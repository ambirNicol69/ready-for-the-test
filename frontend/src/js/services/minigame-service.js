import { request } from './api.js';

export function getMinigameStats(gameCode) {
  return request(`/api/minigames/${gameCode}/stats`);
}

export function saveMinigameAttempt({ gameCode, attemptToken, score, durationSeconds }) {
  return request('/api/minigame-attempts', {
    method: 'POST',
    body: {
      game_code: gameCode,
      attempt_token: attemptToken,
      score,
      duration_seconds: durationSeconds,
    },
  });
}

export function createMinigameAttemptToken() {
  return globalThis.crypto.randomUUID();
}
