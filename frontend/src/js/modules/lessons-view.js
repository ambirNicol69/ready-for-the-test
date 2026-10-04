import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert, createViewHeader } from '../utils/ui.js';
import { LESSONS } from './lesson-catalog.js';
import * as progressApi from '../services/lesson-service.js';

const PHASES = ['Video', 'Conceptos', 'Ejemplo', 'Ejercicio'];
let activePlayer = null;
let playbackTimer = null;
let lastPlaybackTime = null;
let watchedSeconds = 0;

export function renderLessons(container) {
  destroyPlayer();
  clearChildren(container);
  container.appendChild(createViewHeader('Lecciones', 'Aprende paso a paso. Completa cada fase para desbloquear la siguiente.'));
  const list = el('div', 'rejilla');
  list.appendChild(el('p', 'estado-vacio', 'Cargando lecciones…'));
  container.appendChild(list);
  progressApi.getProgress().then((progress) => renderLessonCards(list, progress))
    .catch((error) => list.replaceChildren(createAlert(error.message)));
}

function renderLessonCards(list, progress) {
  clearChildren(list);
  LESSONS.forEach((lesson) => {
    const phase = Number(progress[lesson.slug] || 0);
    const card = el('article', 'tarjeta lesson-card');
    card.append(
      el('span', 'badge badge-primario', lesson.subject),
      el('h3', '', lesson.title),
      el('p', '', phase === 4 ? 'Lección completada' : `${Math.min(phase, 3)} de 4 fases completadas`),
      button(phase === 4 ? 'Repasar lección' : phase ? 'Continuar lección' : 'Comenzar lección', () => showLesson(lesson, phase)),
    );
    list.appendChild(card);
  });
}

function showLesson(lesson, progress, selectedPhase = Math.min(progress, 3)) {
  destroyPlayer();
  const container = document.getElementById('app');
  clearChildren(container);
  container.appendChild(createViewHeader(lesson.title, lesson.subject));
  container.appendChild(button('← Todas las lecciones', () => renderLessons(document.getElementById('app'))));
  const stepper = el('nav', 'lesson-stepper');
  const content = el('section', 'cajon lesson-content');
  PHASES.forEach((label, index) => {
    const item = button(`${index + 1}. ${label}`, () => showLesson(lesson, progress, index));
    item.className = `chip${selectedPhase === index ? ' is-activo' : ''}`;
    item.disabled = index > progress;
    stepper.appendChild(item);
  });
  container.append(stepper, content);
  renderPhase(content, lesson, progress, selectedPhase);
}

function renderPhase(content, lesson, progress, phase) {
  clearChildren(content);
  content.appendChild(el('h3', '', PHASES[phase]));
  if (phase === 0) renderVideo(content, lesson, progress);
  if (phase === 1) renderConcepts(content, lesson, progress);
  if (phase === 2) renderExample(content, lesson, progress);
  if (phase === 3) renderExercise(content, lesson, progress);
}

function renderVideo(content, lesson, progress) {
  content.appendChild(el('p', '', lesson.videoTitle));
  if (progress > 0) {
    content.appendChild(el('p', 'badge badge-verde', 'Video completado'));
    content.appendChild(button('Continuar a conceptos', () => showLesson(lesson, progress, 1)));
    return;
  }
  const player = el('div', 'lesson-video');
  player.id = 'lessonVideoPlayer';
  content.appendChild(player);
  const link = el('a', 'lesson-video-link', 'Abrir video en YouTube');
  link.href = `https://www.youtube.com/watch?v=${lesson.videoId}`;
  link.target = '_blank'; link.rel = 'noopener';
  content.appendChild(link);
  watchedSeconds = 0;
  lastPlaybackTime = null;
  loadYouTubeApi().then((YT) => {
    if (!YT || !player.isConnected) return;
    let completed = false;
    activePlayer = new YT.Player(player, {
      videoId: lesson.videoId,
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onStateChange: async (event) => {
          if (event.data === YT.PlayerState.PLAYING) startPlaybackTracking(event.target);
          if (event.data === YT.PlayerState.PAUSED) trackPlayback(event.target);
          if (completed || event.data !== YT.PlayerState.ENDED) return;
          trackPlayback(event.target);
          stopPlaybackTracking();
          const remaining = event.target.getDuration() - watchedSeconds;
          if (remaining > Math.max(3, event.target.getDuration() * 0.03)) {
            content.appendChild(createAlert('Para continuar, reproduce el video completo sin saltarte partes.'));
            return;
          }
          completed = true;
          try {
            const result = await progressApi.saveProgress(lesson.slug, 1);
            showLesson(lesson, result.phase, 1);
          } catch (error) {
            completed = false;
            if (player.isConnected) content.appendChild(createAlert(error.message));
          }
        },
      },
    });
  }).catch(() => content.appendChild(createAlert('No se pudo cargar el reproductor de YouTube.')));
}

function renderConcepts(content, lesson, progress) {
  lesson.concepts.forEach((concept) => {
    const item = el('article', 'lesson-concept');
    item.append(el('h4', '', concept.title), el('p', '', concept.text));
    content.appendChild(item);
  });
  content.appendChild(button('Continuar al ejemplo', () => advance(lesson, progress, 2, 2)));
}

function renderExample(content, lesson, progress) {
  content.appendChild(el('h4', '', lesson.example.title));
  const steps = el('ol', 'lesson-steps');
  lesson.example.steps.forEach((step) => steps.appendChild(el('li', '', step)));
  content.append(steps, button('Continuar al ejercicio', () => advance(lesson, progress, 3, 3)));
}

function renderExercise(content, lesson, progress) {
  if (progress === 4) content.appendChild(el('p', 'badge badge-verde', '¡Respuesta correcta! Lección completada.'));
  content.appendChild(el('h4', '', lesson.exercise.question));
  const feedback = el('div');
  lesson.exercise.options.forEach((option, index) => {
    const choice = button(`${String.fromCharCode(65 + index)}. ${option}`, async () => {
      feedback.replaceChildren();
      try {
        await progressApi.saveProgress(lesson.slug, 4, index + 1);
        showLesson(lesson, 4, 3);
      } catch (error) {
        feedback.replaceChildren(createAlert(error.message));
      }
    });
    choice.className = 'btn btn-contorno lesson-answer';
    content.appendChild(choice);
  });
  content.appendChild(feedback);
}

async function advance(lesson, current, next, phase) {
  try {
    const result = await progressApi.saveProgress(lesson.slug, next);
    showLesson(lesson, Math.max(current, result.phase), phase);
  } catch (error) {
    const content = document.querySelector('.lesson-content');
    if (content) content.appendChild(createAlert(error.message));
  }
}

function button(label, onClick) {
  const item = el('button', 'btn btn-primario', label);
  item.type = 'button'; item.addEventListener('click', onClick);
  return item;
}

function destroyPlayer() {
  stopPlaybackTracking();
  if (activePlayer && typeof activePlayer.destroy === 'function') activePlayer.destroy();
  activePlayer = null;
}

function startPlaybackTracking(player) {
  if (playbackTimer) return;
  lastPlaybackTime = player.getCurrentTime();
  playbackTimer = window.setInterval(() => trackPlayback(player), 1000);
}

function trackPlayback(player) {
  const current = player.getCurrentTime();
  if (lastPlaybackTime !== null) {
    const elapsed = current - lastPlaybackTime;
    const maxStep = Math.max(2.5, player.getPlaybackRate() * 1.8);
    if (elapsed > 0 && elapsed <= maxStep) watchedSeconds += elapsed;
  }
  lastPlaybackTime = current;
}

function stopPlaybackTracking() {
  if (playbackTimer) window.clearInterval(playbackTimer);
  playbackTimer = null;
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window.rftYouTubeApi) return window.rftYouTubeApi;
  window.rftYouTubeApi = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => reject(new Error('YouTube no está disponible'));
    document.head.appendChild(script);
  });
  return window.rftYouTubeApi;
}
