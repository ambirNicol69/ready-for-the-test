import { el } from './dom-helpers.js';

export function createViewHeader(title, subtitle = '') {
  const wrapper = el('div', 'vista-cabecera');
  wrapper.appendChild(el('h2', '', title));
  if (subtitle !== '') {
    wrapper.appendChild(el('p', '', subtitle));
  }
  return wrapper;
}

export function createField({ id, label, type = 'text', options = [], placeholder = '', required = false }) {
  const fieldLabel = el('label', '', label);
  let input;

  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.id = id;
    input.placeholder = placeholder;
    input.rows = 3;
  } else if (type === 'select') {
    input = document.createElement('select');
    input.id = id;
    for (const option of options) {
      const optionNode = document.createElement('option');
      optionNode.value = option.value;
      optionNode.textContent = option.text || option.value;
      input.appendChild(optionNode);
    }
  } else {
    input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.placeholder = placeholder;
  }

  if (required) {
    input.required = true;
  }

  fieldLabel.appendChild(input);
  const error = el('p', 'campo-error');
  fieldLabel.appendChild(error);

  return { wrapper: fieldLabel, input, error };
}

export function createAlert(text, type = 'error') {
  return el('div', `mensaje mensaje-${type}`, text);
}

export function clearFieldError(field) {
  field.error.textContent = '';
}

export function setFieldError(field, message) {
  field.error.textContent = message;
}
