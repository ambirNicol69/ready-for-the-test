import { getToken, clearToken } from '../utils/storage.js';

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  });
  const payload = await response.json();
  if (!response.ok) {
    if (response.status === 401) clearToken();
    throw new Error(payload.message || 'No se pudo guardar el progreso');
  }
  return payload.data;
}

export const getProgress = () => request('/api/lesson-progress');
export const saveProgress = (lessonSlug, phase, answer) => request('/api/lesson-progress', {
  method: 'POST',
  body: JSON.stringify({ lesson_slug: lessonSlug, phase, answer }),
});
