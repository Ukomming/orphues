import { endpoints } from './api.js';

export let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
export const getCurrent = () => currentUser;

export async function login(email, password) {
  const res = await endpoints.login({ email, password });
  if (res.error) throw res.error;
  currentUser = res;
  localStorage.setItem('currentUser', JSON.stringify(res));
  return res;
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
}

export async function signup(name, email, password) {
  const res = await endpoints.register({ name, email, password });
  if (res.error) throw res.error;
  return res;
}
