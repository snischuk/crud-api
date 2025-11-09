import { createServer } from 'node:http';
// import { usersController } from './controllers/users.controller.ts';
import { loadEnv } from './utils/loadEnv.ts';

await loadEnv();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
