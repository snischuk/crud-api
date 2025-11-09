import { IncomingMessage, ServerResponse } from 'node:http';
import type { TUserDTO } from '../types/user.type';
import { isValidUUID } from '../utils/uuid.utils';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../services/users.service';

const getRequestBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', (err) => reject(err));
  });

export const usersController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const url = req.url || '';
  const method = req.method || '';

  try {
    if (url === '/api/users' && method === 'GET') {
      const users = await getAllUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
      return;
    }

    if (url === '/api/users' && method === 'POST') {
      const body = await getRequestBody(req);
      const parsedBody: TUserDTO = JSON.parse(body);

      if (
        !parsedBody.username ||
        parsedBody.age === undefined ||
        !parsedBody.hobbies
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'All fields are required' }));
        return;
      }

      const newUser = await createUser(parsedBody);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
      return;
    }

    const userIdMatch = url.match(/^\/api\/users\/([0-9a-f\-]+)$/i);
    if (userIdMatch && userIdMatch[1]) {
      const userId = userIdMatch[1];

      if (!isValidUUID(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid UUID' }));
        return;
      }

      if (method === 'GET') {
        const user = await getUserById(userId);
        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User not found' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        return;
      }

      if (method === 'PUT') {
        const body = await getRequestBody(req);
        const parsedBody: TUserDTO = JSON.parse(body);

        if (
          !parsedBody.username ||
          parsedBody.age === undefined ||
          !parsedBody.hobbies
        ) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ message: 'All fields are required for PUT' }),
          );
          return;
        }

        const updatedUser = await updateUser(userId, parsedBody);
        if (!updatedUser) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User not found' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedUser));
        return;
      }

      if (method === 'DELETE') {
        const deleted = await deleteUser(userId);
        if (!deleted) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User not found' }));
          return;
        }

        res.writeHead(204);
        res.end();
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message }));
  }
};
