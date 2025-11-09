import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { usersController } from './controllers/users.controller';
import { loadEnv } from './utils/load-env.utils';
import { isError } from './utils/type-guards.utils';

(async () => {
  await loadEnv();

  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        await usersController(req, res);
      } catch (error: unknown) {
        const message = isError(error)
          ? error.message
          : 'Internal Server Error';
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message }));
      }
    },
  );

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
