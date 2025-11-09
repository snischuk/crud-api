import { randomUUID } from 'node:crypto';
import type { User } from '../models/user.model.ts';
import type { TUserDTO } from '../types/user.type.ts';
import {
  getAllUsers as dbGetAllUsers,
  getUserById as dbGetUserById,
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
} from '../db/users.db.ts';

export const getAllUsers = async (): Promise<User[]> => {
  return await dbGetAllUsers();
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const user = await dbGetUserById(userId);
  return user ?? null;
};

export const createUser = async (userData: TUserDTO): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: randomUUID(),
  };
  return await dbCreateUser(newUser);
};

export const updateUser = async (
  userId: string,
  userData: TUserDTO,
): Promise<User | null> => {
  const updatedUser: User = {
    ...userData,
    id: userId,
  };
  return await dbUpdateUser(userId, updatedUser);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  return await dbDeleteUser(userId);
};
