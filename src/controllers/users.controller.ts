import type { TUserDTO } from '../types/user.type';
import type { User } from '../models/user.model';
import { isValidUUID } from '../utils/uuid.utils';
import { isError } from '../utils/type-guards.utils';

type RequestInput = {
  url?: string;
  method?: string;
  body?: string;
  database?: User[];
};

export const usersControllerIPC = async (req: RequestInput) => {
  const db = req.database ?? [];
  const url = req.url ?? '';
  const method = req.method ?? '';
  const body = req.body ?? '';

  try {
    if (url === '/api/users' && method === 'GET') {
      return db;
    }

    if (url === '/api/users' && method === 'POST') {
      const parsedBody: TUserDTO = JSON.parse(body);
      if (
        !parsedBody.username ||
        parsedBody.age === undefined ||
        !parsedBody.hobbies
      ) {
        return { error: 'All fields are required', status: 400 };
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        ...parsedBody,
      };

      return { user: newUser, action: 'create' };
    }

    const userIdMatch = url.match(/^\/api\/users\/([0-9a-f\-]+)$/i);
    if (userIdMatch && userIdMatch[1]) {
      const userId = userIdMatch[1];

      if (!isValidUUID(userId)) {
        return { error: 'Invalid UUID', status: 400 };
      }

      const userIndex = db.findIndex((u) => u.id === userId);

      if (method === 'GET') {
        if (userIndex === -1) return { error: 'User not found', status: 404 };
        return db[userIndex];
      }

      if (method === 'PUT') {
        const parsedBody: TUserDTO = JSON.parse(body);
        if (
          !parsedBody.username ||
          parsedBody.age === undefined ||
          !parsedBody.hobbies
        ) {
          return { error: 'All fields are required for PUT', status: 400 };
        }

        const updatedUser: User = { id: userId, ...parsedBody };
        return { user: updatedUser, action: 'update' };
      }

      if (method === 'DELETE') {
        return { userId, action: 'delete' };
      }
    }

    return { error: 'Route not found', status: 404 };
  } catch (error: unknown) {
    const message = isError(error) ? error.message : 'Internal Server Error';
    return { error: message, status: 500 };
  }
};
