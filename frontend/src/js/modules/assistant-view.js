import { el, clearChildren, getElement } from '../utils/dom-helpers.js';
import { on } from '../utils/events.js';
import * as assistant from '../services/assistant-service.js';
import { session } from './session.js';
import { contextForRoute, currentHash } from './router.js';

let wrapper = null;
let panelOpen = false;
let currentContext = 'general';

export function initAssistant() {
  const layer = getElement('assistantLayer');
  wrapper = el('div', 'chat-flotante');
  wrapper.id = 'asistenteFlotante';
  layer.appendChild(wrapper);

  on('session', () => {
    if (session.isLogged && !session.isTeacher) {
      wrapper.replaceChildren(buildButton());
    } else {
      panelOpen = false;
      wrapper.replaceChildren();
    }
  });

  on('route', ({ hash }) => {
    if (hash === '#/inicio' && !session.isTeacher) {
      panelOpen = false;
      wrapper.replaceChildren();
      wrapper.classList.add('chat-oculto');
      return;
    }
    wrapper.classList.remove('chat-oculto');
    if (session.isLogged && !session.isTeacher && !wrapper.firstChild) {
      wrapper.replaceChildren(buildButton());
    }
    if (panelOpen) currentContext = contextForRoute();
  });

  if (session.isLogged && !session.isTeacher && currentHash() === '#/inicio') {
    wrapper.classList.add('chat-oculto');
  } else if (session.isLogged && !session.isTeacher) {
    wrapper.replaceChildren(buildButton());
  }
}

function buildButton() {
  const button = el('button', 'chat-boton');
  const logo = el('img', 'chat-logo');
  logo.src = new URL('../../assets/images/logosintitulo.png', import.meta.url).href;
  logo.alt = '';
  button.appendChild(logo);
  button.setAttribute('aria-label', 'Abrir chat con Milo');
  button.addEventListener('click', togglePanel);
  return button;
}

function togglePanel() {
  panelOpen = !panelOpen;
  wrapper.replaceChildren(buildButton());
  if (panelOpen) {
    wrapper.appendChild(buildPanel());
  }
}

function buildPanel() {
  const panel = el('div', 'chat-panel');

  const header = el('div', 'chat-cabecera');
  const identity = el('div', 'chat-identidad');
  const logo = el('img', 'chat-logo chat-logo-header');
  logo.src = new URL('../../assets/images/logosintitulo.png', import.meta.url).href;
  logo.alt = '';
  identity.append(logo, el('h3', '', 'Milo'));
  header.appendChild(identity);
  const closeButton = el('button', 'btn btn-icono', '✕');
  closeButton.addEventListener('click', togglePanel);
  header.appendChild(closeButton);
  panel.appendChild(header);

  const messages = el('div', 'chat-mensajes');
  messages.id = 'chatMensajes';
  messages.appendChild(buildBotMessage('¡Hola! Soy Milo. ¿En qué te ayudo?', 'feliz').wrapper);
  panel.appendChild(messages);

  const suggestions = el('div', 'chat-sugerencias');
  suggestions.id = 'chatSugerencias';
  panel.appendChild(suggestions);

  const entry = el('div', 'chat-entrada');
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'chatEntradaInput';
  input.placeholder = 'Escribe tu consulta…';
  input.maxLength = 500;
  const sendButton = el('button', '', '➤');
  sendButton.setAttribute('aria-label', 'Enviar');
  entry.appendChild(input);
  entry.appendChild(sendButton);
  panel.appendChild(entry);

  sendButton.addEventListener('click', () => sendMessage(input, messages));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage(input, messages);
    }
  });

  loadSuggestions(suggestions, currentContext);
  return panel;
}

async function loadSuggestions(suggestions, context) {
  clearChildren(suggestions);
  try {
    const topics = await assistant.getHelp(context);
    const seen = new Set();
    const chips = [];
    for (const topic of topics) {
      for (const suggestion of topic.suggestions) {
        if (!seen.has(suggestion)) {
          seen.add(suggestion);
          chips.push(suggestion);
        }
        if (chips.length >= 5) {
          break;
        }
      }
      if (chips.length >= 5) {
        break;
      }
    }
    for (const chipText of chips) {
      plainChip(suggestions, chipText);
    }
  } catch {
    suggestions.appendChild(el('span', 'estado-vacio', 'No hay sugerencias disponibles.'));
  }
}

function plainChip(suggestions, text) {
  const chip = el('button', 'chat-chip', text);
  chip.addEventListener('click', () => {
    const messages = document.getElementById('chatMensajes');
    const input = document.getElementById('chatEntradaInput');
    submitQuery(text, input, messages);
  });
  suggestions.appendChild(chip);
}

function sendMessage(input, messages) {
  const value = input.value.trim();
  if (value === '') {
    return;
  }
  input.value = '';
  submitQuery(value, input, messages);
}

async function submitQuery(message, input, messages) {
  const contextValue = currentContext || contextForRoute();
  const userBubble = el('div', 'burbuja burbuja-usuario', message);
  messages.appendChild(userBubble);
  messages.scrollTop = messages.scrollHeight;

  const reply = buildBotMessage('…', 'pensativo');
  messages.appendChild(reply.wrapper);
  messages.scrollTop = messages.scrollHeight;

  try {
    const result = await assistant.askAssistant({ message, context: contextValue });
    reply.bubble.textContent = result.response;
    reply.avatar.classList.replace('mascota-expresion-pensativo', 'mascota-expresion-feliz');
    const suggestions = document.getElementById('chatSugerencias');
    updateSuggestionsState(suggestions, result.suggestions);
  } catch (error) {
    reply.bubble.textContent = `Error: ${error.message}`;
    reply.avatar.classList.replace('mascota-expresion-pensativo', 'mascota-expresion-triste');
  }
  messages.scrollTop = messages.scrollHeight;
}

function buildBotMessage(text, mood) {
  const wrapper = el('div', 'chat-mensaje-milo');
  const avatar = el('span', `mascota-expresion mascota-expresion-chat mascota-expresion-${mood}`);
  avatar.setAttribute('aria-hidden', 'true');
  const bubble = el('div', 'burbuja burbuja-bot', text);
  wrapper.append(avatar, bubble);
  return { wrapper, avatar, bubble };
}

function updateSuggestionsState(suggestions, suggestionList) {
  clearChildren(suggestions);
  if (!suggestionList) {
    return;
  }
  const messages = document.getElementById('chatMensajes');
  const input = document.getElementById('chatEntradaInput');
  for (const text of suggestionList) {
    plainChip(suggestions, text);
  }
  if (suggestionList.length > 0 && input) {
    input.placeholder = 'Escribe tu consulta o elige una sugerencia…';
  }
}
