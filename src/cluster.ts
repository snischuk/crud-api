import cluster from 'node:cluster';
import type { Worker } from 'node:cluster';
import os from 'os';
import { IncomingMessage, ServerResponse, createServer } from 'http';
import { randomUUID } from 'crypto';
import { loadEnv } from './utils/load-env.utils';
import { isError } from './utils/type-guards.utils';
import { usersControllerIPC } from './controllers/users.controller';
import type { User } from './models/user.model';

type IPCControllerResult =
  | { user: User; action: 'create' | 'update' }
  | { userId: string; action: 'delete' }
  | { error: string; status: number }
  | User[]
  | User
  | Record<string, unknown>;

type WorkerRequestMessage = {
  type: 'request';
  requestId: string;
  url?: string;
  method?: string;
  body?: string;
};

type WorkerResponseMessage = {
  type: 'response';
  requestId: string;
  status: number;
  data: IPCControllerResult;
  updateDb?: {
    action: 'create' | 'update' | 'delete';
    user?: User;
    userId?: string;
  };
};

type WorkerGetDbMessage = { type: 'get-db' };
type MasterDbMessage = { type: 'db'; db: User[] };

const numCPUs = os.cpus().length;
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

if (cluster.isPrimary) {
  const workers: Worker[] = [];
  const pendingResponses = new Map<string, ServerResponse>();
  const db: User[] = [];
  let rrCounter = 0;

  for (let i = 1; i < numCPUs; i++) {
    const worker = cluster.fork({ WORKER_PORT: PORT + i });
    workers.push(worker);

    worker.on('message', (msg: WorkerResponseMessage | WorkerGetDbMessage) => {
      if (msg.type === 'response') {
        const { requestId, status, data, updateDb } = msg;

        if (updateDb) {
          if (updateDb.action === 'create' && updateDb.user)
            db.push(updateDb.user);
          if (updateDb.action === 'update' && updateDb.user) {
            const index = db.findIndex((u) => u.id === updateDb.user!.id);
            if (index !== -1) db[index] = updateDb.user;
          }
          if (updateDb.action === 'delete' && updateDb.userId) {
            const index = db.findIndex((u) => u.id === updateDb.userId);
            if (index !== -1) db.splice(index, 1);
          }
        }

        const res = pendingResponses.get(requestId);
        if (!res) return;

        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        pendingResponses.delete(requestId);
      }

      if (msg.type === 'get-db') {
        worker.send({ type: 'db', db });
      }
    });
  }

  createServer((req: IncomingMessage, res: ServerResponse) => {
    if (!workers.length) {
      res.writeHead(500);
      res.end('No workers available');
      return;
    }

    const workerIndex = rrCounter % workers.length;
    const worker = workers[workerIndex]!;
    rrCounter++;

    const requestId = randomUUID();
    pendingResponses.set(requestId, res);

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      worker.send({
        type: 'request',
        requestId,
        url: req.url,
        method: req.method,
        body,
      } as WorkerRequestMessage);
    });
  }).listen(PORT);
} else {
  (async () => {
    await loadEnv();

    process.on(
      'message',
      async (msg: WorkerRequestMessage | MasterDbMessage) => {
        if (msg.type === 'request') {
          const { requestId, url, method, body } = msg;

          try {
            process.send!({ type: 'get-db' as const });

            const db: User[] = await new Promise((resolve) => {
              const handler = (m: MasterDbMessage) => {
                if (m.type === 'db') {
                  process.off('message', handler);
                  resolve(m.db);
                }
              };
              process.on('message', handler);
            });

            const controllerResult = await usersControllerIPC({
              url,
              method,
              body,
              database: db,
            });
            const result: IPCControllerResult = controllerResult ?? {
              error: 'Internal Error',
              status: 500,
            };

            const updateDb =
              'action' in result &&
              (result.action === 'create' ||
                result.action === 'update' ||
                result.action === 'delete')
                ? result
                : undefined;

            process.send!({
              type: 'response' as const,
              requestId,
              status: 'status' in result ? result.status : 200,
              data: result,
              updateDb,
            } as WorkerResponseMessage);
          } catch (error: unknown) {
            const message = isError(error)
              ? error.message
              : 'Internal Server Error';
            process.send!({
              type: 'response' as const,
              requestId,
              status: 500,
              data: { error: message, status: 500 },
            } as WorkerResponseMessage);
          }
        }
      },
    );
  })();
}
