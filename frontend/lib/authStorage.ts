// Single source of truth for the auth localStorage keys, so authContext.tsx
// (React state) and lib/api.ts's response interceptor (outside React, can't
// use hooks) don't duplicate — or drift on — the key names.

export interface StoredUser {
  id: string;
  email: string;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export function getStoredAuth(): { token: string | null; user: StoredUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null };

  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  let user: StoredUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

export function setStoredAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Defense in depth: an older build of this app tracked a second, unrelated
  // client-generated id under this key (invented by the onboarding page) and
  // used it — instead of real auth state — to decide whether protected pages
  // were reachable. Clearing it here means no stale copy from before this
  // fix can outlive a logout and paper over the real auth check again.
  localStorage.removeItem('userId');
}
