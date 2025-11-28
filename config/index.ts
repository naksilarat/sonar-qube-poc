import path from 'path';
import dotenv from 'dotenv';

// Load .env once from config directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

export const ENV = {
  BASE_URL: process.env.BASE_URL ?? '',
  LOGIN_PATH: process.env.LOGIN_PATH ?? '/api/client/auth/login',
  LOGOUT_PATH: process.env.LOGOUT_PATH ?? '/api/client/auth/logout',
} as const;

export type Env = typeof ENV;