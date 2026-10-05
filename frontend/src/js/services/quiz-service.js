import { request } from './api.js';

export function createRoom({ title, questions }) {
  return request('/api/quiz-rooms', {
    method: 'POST',
    body: { title, questions },
  });
}

export function listRooms() {
  return request('/api/quiz-rooms');
}

export function getRoom(roomId) {
  return request(`/api/quiz-rooms/${roomId}`);
}

export function deleteRoom(roomId) {
  return request(`/api/quiz-rooms/${roomId}`, { method: 'DELETE' });
}

export function joinRoomWithCode(code) {
  return request('/api/quiz-rooms/join', {
    method: 'POST',
    body: { code },
  });
}

export function prepareLiveRoom(roomId, questionTimeSeconds) {
  return request(`/api/quiz-rooms/${roomId}/live/prepare`, {
    method: 'POST', body: { question_time_seconds: questionTimeSeconds },
  });
}

export function startLiveRoom(roomId) {
  return request(`/api/quiz-rooms/${roomId}/live/start`, { method: 'POST' });
}

export function getLiveRoomState(roomId) {
  return request(`/api/quiz-rooms/${roomId}/live`);
}

export function advanceLiveRoom(roomId) {
  return request(`/api/quiz-rooms/${roomId}/live/advance`, { method: 'POST' });
}

export function toggleLiveRoomPause(roomId) {
  return request(`/api/quiz-rooms/${roomId}/live/pause`, { method: 'POST' });
}

export function finishLiveRoom(roomId) {
  return request(`/api/quiz-rooms/${roomId}/live/finish`, { method: 'POST' });
}

export function getStudentLiveState(attemptId) {
  return request(`/api/quiz-live/${attemptId}`);
}

export function submitLiveAnswer({ attemptId, questionId, optionPosition }) {
  return request('/api/quiz-live/answer', {
    method: 'POST',
    body: { attempt_id: attemptId, question_id: questionId, option_position: optionPosition },
  });
}

export function autoRoomTopics() {
  return request('/api/quiz-rooms/auto/topics');
}

export function createAutoRoom({ title, topic, questionCount, pointsValue }) {
  return request('/api/quiz-rooms/auto', {
    method: 'POST',
    body: {
      title,
      topic,
      question_count: questionCount,
      points_value: pointsValue,
    },
  });
}

export function submitAnswers({ attemptId, answers }) {
  return request('/api/quiz-answers', {
    method: 'POST',
    body: { attempt_id: attemptId, answers },
  });
}
