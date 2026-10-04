import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader } from '../utils/ui.js';
import { renderMixing } from './mixing-view.js';
import { renderIdentification } from './identification-view.js';

const OPTIONS = [
  { key: 'mezclas', label: 'Mezcla de sustancias', render: renderMixing },
  { key: 'identificacion', label: 'Identificación de sustancias', render: renderIdentification },
];

export function renderLaboratory(container, initialOption = 'mezclas') {
  clearChildren(container);
  container.appendChild(createViewHeader(
    'Laboratorio',
    'Elige una actividad para explorar las sustancias.'
  ));

  const selector = el('nav', 'vista-acciones');
  selector.setAttribute('aria-label', 'Actividades del laboratorio');
  const panel = el('section');
  container.append(selector, panel);

  const buttons = OPTIONS.map((option) => {
    const button = el('button', 'chip', option.label);
    button.type = 'button';
    button.addEventListener('click', () => selectOption(option, button));
    selector.appendChild(button);
    return button;
  });

  function selectOption(option, button) {
    buttons.forEach((item) => item.classList.toggle('is-activo', item === button));
    option.render(panel);
  }

  const selectedIndex = Math.max(0, OPTIONS.findIndex((option) => option.key === initialOption));
  selectOption(OPTIONS[selectedIndex], buttons[selectedIndex]);
}
