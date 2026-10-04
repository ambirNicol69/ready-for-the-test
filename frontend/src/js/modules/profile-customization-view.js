import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert } from '../utils/ui.js';
import { refreshHeader } from './app-shell.js';
import { session } from './session.js';
import * as profileApi from '../services/profile-service.js';
import {
  applyAccentColor, buildProfileAvatar, readCustomization,
  saveLocalCustomization, saveProfilePhoto, getStudentAvatarImage,
} from '../utils/profile-identity.js';

const COLORS = [
  { value: '#0e8388', label: 'Turquesa' },
  { value: '#6257d9', label: 'Violeta' },
  { value: '#c4477d', label: 'Rosa' },
  { value: '#26734d', label: 'Verde' },
  { value: '#bc6b25', label: 'Naranja' },
];

export function renderProfileCustomization(container) {
  const card = el('section', 'cajon profile-customization');
  card.appendChild(el('h3', '', 'Personaliza tu perfil'));
  card.appendChild(el('p', 'estado-vacio', 'Elige un color para la plataforma y cambia tu avatar.'));
  const body = el('div');
  body.appendChild(el('p', 'estado-vacio', 'Cargando tus preferencias…'));
  card.appendChild(body);
  container.appendChild(card);
  loadCustomization(body);
}

async function loadCustomization(body) {
  try {
    const settings = await profileApi.getCustomization();
    saveLocalCustomization(session.user.id, settings);
    applyAccentColor(settings.accent_color);
    renderControls(body, settings);
    refreshHeader();
  } catch (error) {
    body.replaceChildren(createAlert(error.message));
  }
}

function renderControls(body, settings) {
  clearChildren(body);
  const preview = el('div', 'profile-avatar-preview');
  preview.appendChild(buildProfileAvatar(session.user, 'profile-avatar profile-avatar-large'));
  preview.appendChild(el('p', '', session.user.full_name));
  body.appendChild(preview);

  const colorSection = el('div', 'profile-color-picker');
  colorSection.appendChild(el('h4', '', 'Color de la página'));
  const swatches = el('div', 'profile-color-options');
  COLORS.forEach((color) => {
    const button = el('button', `profile-color-swatch${color.value === settings.accent_color ? ' is-selected' : ''}`);
    button.type = 'button';
    button.title = color.label;
    button.setAttribute('aria-label', `Usar color ${color.label}`);
    button.style.setProperty('--swatch-color', color.value);
    button.addEventListener('click', () => saveColor(color, settings, swatches));
    swatches.appendChild(button);
  });
  colorSection.appendChild(swatches);
  body.appendChild(colorSection);

  if (session.isTeacher) renderPhotoPicker(body);
  if (session.isStudent) renderShop(body, settings);
}

async function saveColor(color, settings, swatches) {
  try {
    const updated = await profileApi.saveCustomization({ ...settings, accent_color: color.value });
    Object.assign(settings, updated);
    saveLocalCustomization(session.user.id, settings);
    applyAccentColor(color.value);
    swatches.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('is-selected', button.title === color.label);
    });
  } catch (error) {
    swatches.parentElement.appendChild(createAlert(error.message));
  }
}

function renderPhotoPicker(body) {
  const section = el('div', 'profile-photo-picker');
  section.appendChild(el('h4', '', 'Foto de perfil'));
  section.appendChild(el('p', 'estado-vacio', 'Selecciona una imagen de tu dispositivo (máximo 1.5 MB).'));
  const input = el('input', 'profile-photo-input');
  input.type = 'file';
  input.accept = 'image/*';
  input.setAttribute('aria-label', 'Seleccionar foto de perfil');
  input.addEventListener('change', () => readTeacherPhoto(input, section));
  section.appendChild(input);
  body.appendChild(section);
}

function readTeacherPhoto(input, section) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/') || file.size > 1.5 * 1024 * 1024) {
    section.appendChild(createAlert('Elige una imagen válida de hasta 1.5 MB.'));
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      saveProfilePhoto(session.user.id, reader.result);
      document.querySelector('.profile-avatar-large')?.replaceWith(
        buildProfileAvatar(session.user, 'profile-avatar profile-avatar-large')
      );
      refreshHeader();
    } catch {
      section.appendChild(createAlert('No se pudo guardar la foto en este dispositivo.'));
    }
  };
  reader.readAsDataURL(file);
}

async function renderShop(body, settings) {
  const section = el('div', 'profile-shop');
  section.appendChild(el('h4', '', 'Tienda de avatares'));
  const balance = el('p', 'estado-vacio shop-balance', `Tienes ${session.user.points} puntos para canjear.`);
  section.appendChild(balance);
  const grid = el('div', 'profile-shop-grid');
  grid.appendChild(el('p', 'estado-vacio', 'Cargando artículos…'));
  section.appendChild(grid);
  body.appendChild(section);
  try {
    const shop = await profileApi.getShop();
    balance.textContent = `Tienes ${shop.points} puntos para canjear.`;
    grid.replaceChildren();
    shop.items.forEach((item) => grid.appendChild(buildShopItem(item, shop.owned_items, settings, grid, balance)));
  } catch (error) {
    grid.replaceChildren(createAlert(error.message));
  }
}

function buildShopItem(item, owned, settings, grid, balance) {
  const card = el('article', 'profile-shop-item');
  const image = el('img', 'profile-shop-image');
  image.src = getStudentAvatarImage(item.id);
  image.alt = `Avatar ${item.name}`;
  image.loading = 'lazy';
  card.append(image, el('strong', '', item.name));
  card.appendChild(el('span', 'badge badge-ambar', `${item.price} puntos`));
  const button = el('button', 'btn btn-contorno', owned.includes(item.id)
    ? settings.avatar_item === item.id ? 'Equipado' : 'Usar avatar'
    : 'Canjear');
  button.type = 'button';
  button.disabled = settings.avatar_item === item.id;
  button.addEventListener('click', () => redeemOrEquip(item, owned, settings, grid, balance));
  card.appendChild(button);
  return card;
}

async function redeemOrEquip(item, owned, settings, grid, balance) {
  try {
    if (!owned.includes(item.id)) await profileApi.purchaseItem(item.id);
    const updated = await profileApi.saveCustomization({ ...settings, avatar_item: item.id });
    Object.assign(settings, updated, { owned_items: [...new Set([...(settings.owned_items || []), item.id])] });
    saveLocalCustomization(session.user.id, settings);
    await session.reload();
    const shop = await profileApi.getShop();
    balance.textContent = `Tienes ${shop.points} puntos para canjear.`;
    grid.replaceChildren(...shop.items.map((entry) => buildShopItem(entry, shop.owned_items, settings, grid, balance)));
    document.querySelector('.profile-avatar-large')?.replaceWith(
      buildProfileAvatar(session.user, 'profile-avatar profile-avatar-large')
    );
    refreshHeader();
  } catch (error) {
    grid.appendChild(createAlert(error.message));
  }
}
