import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRow } from '../db/schema.js';
import { loadTable, saveTable } from '../db/jsonStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function signup(email: string, password: string): Promise<{ user: UserRow; token: string } | { error: string }> {
  const users = Object.values(loadTable<UserRow>('users'));

  // Check if user already exists
  if (users.some((u: UserRow) => u.email === email)) {
    return { error: 'Email already registered' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const user: UserRow = {
    id: userId,
    email,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  };

  const usersTable = loadTable<UserRow>('users');
  usersTable[userId] = user;
  saveTable('users', usersTable);

  const token = generateToken({ userId, email });
  return { user, token };
}

export async function login(email: string, password: string): Promise<{ user: UserRow; token: string } | { error: string }> {
  const users = Object.values(loadTable<UserRow>('users'));

  const user = users.find((u: UserRow) => u.email === email);
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { error: 'Invalid email or password' };
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function getUserById(userId: string): Promise<UserRow | null> {
  const usersTable = loadTable<UserRow>('users');
  return usersTable[userId] || null;
}

export async function resetPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const usersTable = loadTable<UserRow>('users');
  const user = usersTable[userId];

  if (!user) {
    return { error: 'User not found' };
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    return { error: 'Current password is incorrect' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters' };
  }

  if (currentPassword === newPassword) {
    return { error: 'New password must be different from current password' };
  }

  const newPasswordHash = await hashPassword(newPassword);
  const now = new Date().toISOString();

  usersTable[user.id] = {
    ...user,
    password_hash: newPasswordHash,
    updated_at: now,
  };
  saveTable('users', usersTable);

  return { success: true };
}
