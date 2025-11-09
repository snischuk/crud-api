import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { usersController } from './controllers/users.controller.ts';
import { loadEnv } from './utils/load-env.utils.ts';
import { isError } from './utils/type-guards.utils.ts';

await loadEnv();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await usersController(req, res);
    } catch (error: unknown) {
      const message = isError(error) ? error.message : 'Internal Server Error';
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message }));
    }
  },
);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
