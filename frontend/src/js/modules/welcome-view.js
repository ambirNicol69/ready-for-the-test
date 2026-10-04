import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader } from '../utils/ui.js';
import { session } from './session.js';
import { navigate } from './router.js';

export function renderWelcome(container) {
  clearChildren(container);
  container.appendChild(createViewHeader(
    `¡Bienvenido, ${session.user.full_name.split(' ')[0]}!`,
    'Nos alegra tenerte aquí. Prepárate para aprender algo nuevo.'
  ));
  const card = el('section', 'cajon welcome-card');
  const logo = el('img', 'welcome-logo');
  logo.src = new URL('../../assets/images/logocontitulo.jpeg', import.meta.url).href;
  logo.alt = 'Ready for the Test?';
  card.appendChild(logo);
  const intro = el('div', 'welcome-intro');
  const copy = el('div', 'welcome-copy');
  copy.appendChild(el('h2', '', 'Tu próxima lección te espera'));
  copy.appendChild(el('p', 'estado-vacio', 'Cuando quieras comenzar, entra a tus lecciones.'));
  intro.appendChild(copy);
  const mascot = el('div', 'mascota-expresion mascota-expresion-feliz');
  mascot.setAttribute('role', 'img');
  mascot.setAttribute('aria-label', 'Milo te da la bienvenida');
  intro.appendChild(mascot);
  card.appendChild(intro);
  const button = el('button', 'btn btn-primario', 'Ir a lecciones ahora');
  button.type = 'button';
  button.addEventListener('click', () => navigate('#/lecciones'));
  card.appendChild(button);
  container.appendChild(card);
}
