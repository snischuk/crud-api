import type { User } from '../models/user.model';

const usersDatabase: User[] = [];

export const getAllUsers = async (): Promise<User[]> => [...usersDatabase];

export const getUserById = async (userId: string): Promise<User | undefined> =>
  usersDatabase.find((user) => user.id === userId);

export const createUser = async (userData: User): Promise<User> => {
  usersDatabase.push(userData);
  return userData;
};

export const updateUser = async (
  userId: string,
  userData: User,
): Promise<User | null> => {
  const index = usersDatabase.findIndex((user) => user.id === userId);
  if (index === -1) return null;

  usersDatabase[index] = { ...userData, id: userId };
  return usersDatabase[index];
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const indexOfExistingUser = usersDatabase.findIndex(
    (user) => user.id === userId,
  );
  if (indexOfExistingUser === -1) return false;

  usersDatabase.splice(indexOfExistingUser, 1);
  return true;
};
