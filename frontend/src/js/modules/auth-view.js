import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createField, createAlert, clearFieldError, setFieldError } from '../utils/ui.js';
import { isRequired, isEmailValid, isPasswordValid } from '../utils/validators.js';
import { session } from './session.js';
import { navigate } from './router.js';

const ROLE_OPTIONS = [
  { value: 'estudiante', text: 'Estudiante' },
  { value: 'docente', text: 'Docente' },
];

export function renderLogin(container) {
  clearChildren(container);
  const card = el('div', 'cajon vista-auth');
  card.appendChild(el('h2', '', 'Iniciar sesión'));
  card.appendChild(el('p', 'estado-vacio', 'Accede a tu cuenta para continuar'));

  const form = el('form', 'formulario');
  const emailField = createField({ id: 'loginEmail', label: 'Correo electrónico', type: 'email', required: true });
  const passwordField = createField({ id: 'loginPassword', label: 'Contraseña', type: 'password', required: true });
  const messageBox = el('div');
  const submit = el('button', 'btn btn-primario btn-bloque', 'Ingresar');
  submit.type = 'submit';

  form.appendChild(emailField.wrapper);
  form.appendChild(passwordField.wrapper);
  form.appendChild(messageBox);
  form.appendChild(submit);

  const registerLink = el('p', 'estado-vacio');
  const anchor = el('a', '', 'Crear cuenta');
  anchor.href = '#/registro';
  registerLink.appendChild(anchor);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearChildren(messageBox);
    if (!validateLogin(emailField, passwordField)) {
      return;
    }
    submit.disabled = true;
    try {
      await session.login(emailField.input.value.trim(), passwordField.input.value);
      navigate('#/inicio');
    } catch (error) {
      messageBox.appendChild(createAlert(error.message));
    } finally {
      submit.disabled = false;
    }
  });

  card.appendChild(form);
  card.appendChild(registerLink);
  container.appendChild(card);
}

export function renderRegister(container) {
  clearChildren(container);
  const card = el('div', 'cajon vista-auth');
  card.appendChild(el('h2', '', 'Crear cuenta'));
  card.appendChild(el('p', 'estado-vacio', 'Regístrate como estudiante o docente'));

  const form = el('form', 'formulario');
  const nameField = createField({ id: 'registerName', label: 'Nombre completo', required: true });
  const emailField = createField({ id: 'registerEmail', label: 'Correo electrónico', type: 'email', required: true });
  const passwordField = createField({ id: 'registerPassword', label: 'Contraseña (mínimo 8 caracteres)', type: 'password', required: true });
  const roleField = createField({ id: 'registerRole', label: 'Tipo de cuenta', type: 'select', options: ROLE_OPTIONS });
  const messageBox = el('div');
  const submit = el('button', 'btn btn-primario btn-bloque', 'Registrarse');
  submit.type = 'submit';

  form.appendChild(nameField.wrapper);
  form.appendChild(emailField.wrapper);
  form.appendChild(passwordField.wrapper);
  form.appendChild(roleField.wrapper);
  form.appendChild(messageBox);
  form.appendChild(submit);

  const loginLink = el('p', 'estado-vacio');
  const anchor = el('a', '', 'Ya tengo cuenta');
  anchor.href = '#/login';
  loginLink.appendChild(anchor);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearChildren(messageBox);
    if (!validateRegister(nameField, emailField, passwordField)) {
      return;
    }
    submit.disabled = true;
    try {
      await session.register({
        fullName: nameField.input.value.trim(),
        email: emailField.input.value.trim(),
        password: passwordField.input.value,
        role: roleField.input.value,
      });
      navigate('#/inicio');
    } catch (error) {
      messageBox.appendChild(createAlert(error.message));
    } finally {
      submit.disabled = false;
    }
  });

  card.appendChild(form);
  card.appendChild(loginLink);
  container.appendChild(card);
}

function validateLogin(emailField, passwordField) {
  let valid = true;
  clearFieldError(emailField);
  clearFieldError(passwordField);

  if (!isEmailValid(emailField.input.value)) {
    setFieldError(emailField, 'Correo electrónico no válido');
    valid = false;
  }
  if (!isRequired(passwordField.input.value)) {
    setFieldError(passwordField, 'Escribe tu contraseña');
    valid = false;
  }
  return valid;
}

function validateRegister(nameField, emailField, passwordField) {
  let valid = true;
  clearFieldError(nameField);
  clearFieldError(emailField);
  clearFieldError(passwordField);

  if (!isRequired(nameField.input.value)) {
    setFieldError(nameField, 'Escribe tu nombre completo');
    valid = false;
  }
  if (!isEmailValid(emailField.input.value)) {
    setFieldError(emailField, 'Correo electrónico no válido');
    valid = false;
  }
  if (!isPasswordValid(passwordField.input.value)) {
    setFieldError(passwordField, 'La contraseña debe tener al menos 8 caracteres');
    valid = false;
  }
  return valid;
}
