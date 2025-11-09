import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const isError = (err: unknown): err is Error => err instanceof Error;

export const loadEnv = async (filePath = '.env'): Promise<void> => {
  try {
    const envPath = resolve(process.cwd(), filePath);
    const content = await readFile(envPath, 'utf-8');

    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (err: unknown) {
    console.warn(
      `loadEnv: failed to load file ${filePath}: ${isError(err) ? err.message : String(err)}`,
    );
  }
};
