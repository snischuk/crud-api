import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { usersControllerIPC } from './controllers/users.controller';
import { isError } from './utils/type-guards.utils';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

export const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const result = await usersControllerIPC(req);

      const status =
        typeof result === 'object' && 'status' in result ? result.status : 200;

      const data =
        typeof result === 'object' && 'error' in result
          ? { message: result.error }
          : (result ?? {});

      if (status === 204) {
        res.writeHead(204);
        res.end();
        return;
      }

      res.writeHead(status ?? 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error: unknown) {
      const message = isError(error) ? error.message : 'Internal Server Error';
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message }));
    }
  },
).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
