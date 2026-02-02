import api from './client';

export async function verifyPassword(password: string): Promise<{ token: string }> {
  const { data } = await api.post('/auth/verify', { password });
  return data;
}

export async function getAuthStatus(): Promise<{ locked: boolean; has_password: boolean }> {
  const { data } = await api.get('/auth/status');
  return data;
}

export async function setPassword(password: string, currentPassword?: string) {
  const { data } = await api.post('/auth/set-password', { password, current_password: currentPassword });
  return data;
}

export async function removePassword(currentPassword: string) {
  const { data } = await api.post('/auth/remove-password', { current_password: currentPassword });
  return data;
}
