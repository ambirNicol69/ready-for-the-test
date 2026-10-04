import { getToken, clearToken } from '../utils/storage.js';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  headers = { Authorization: `Bearer ${getToken()}`, ...headers };
  const response = await fetch(path, { method, headers, body });
  const responseText = await response.text();
  let payload;
  try {
    payload = JSON.parse(responseText);
  } catch {
    const serverMessage = new DOMParser().parseFromString(responseText, 'text/html').body.textContent.trim();
    throw new Error(serverMessage || 'El servidor devolvió una respuesta no válida. Revisa los registros de PHP.');
  }
  if (!response.ok) {
    if (response.status === 401) clearToken();
    throw new Error(payload.message || 'No se pudo completar la solicitud');
  }
  return payload.data ?? { message: payload.message };
}

export const list = () => request('/api/classrooms');
export const create = (body) => request('/api/classrooms', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } });
export const addStudent = (id, email) => request(`/api/classrooms/${id}/students`, { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } });
export const createAssignment = (id, body) => request(`/api/classrooms/${id}/assignments`, { method: 'POST', body });
export const submit = (id, body) => request(`/api/assignments/${id}/submissions`, { method: 'POST', body });
export const submissions = (id) => request(`/api/assignments/${id}/submissions`);
export const grade = (id, body) => request(`/api/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } });
