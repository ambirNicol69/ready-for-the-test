import { el } from './dom-helpers.js';

const SETTINGS_KEY = 'rft_customization_';
const PHOTO_KEY = 'rft_profile_photo_';
const STUDENT_AVATARS = {
  conejo: 'conejo.jpeg', corgi: 'corgi.jpeg', gato: 'gato.jpeg', husky: 'husky.jpeg',
  nutria: 'nutria.jpeg', oso: 'oso.jpeg', oveja: 'oveja.jpeg', panda: 'panda.jpeg',
  pato: 'pato.jpeg', pingu: 'pingu.jpeg', rana: 'rana.jpeg', tortuga: 'tortuga.jpeg',
  zorra: 'zorra.jpeg',
};

export function readCustomization(userId) {
  try {
    return JSON.parse(localStorage.getItem(`${SETTINGS_KEY}${userId}`)) || {};
  } catch {
    return {};
  }
}

export function saveLocalCustomization(userId, settings) {
  localStorage.setItem(`${SETTINGS_KEY}${userId}`, JSON.stringify(settings));
}

export function saveProfilePhoto(userId, dataUrl) {
  localStorage.setItem(`${PHOTO_KEY}${userId}`, dataUrl);
}

export function getProfilePhoto(userId) {
  return localStorage.getItem(`${PHOTO_KEY}${userId}`);
}

export function getStudentAvatarImage(itemId) {
  const filename = STUDENT_AVATARS[itemId];
  return filename ? new URL(`../../assets/images/studentpfp/${filename}`, import.meta.url).href : null;
}

export function applyAccentColor(color) {
  const palette = {
    '#0e8388': ['#0e8388', '#0a5f63', '#57c4c7', 'rgba(14, 131, 136, .12)'],
    '#6257d9': ['#6257d9', '#453ba8', '#9288f3', 'rgba(98, 87, 217, .12)'],
    '#c4477d': ['#c4477d', '#92315b', '#e778a7', 'rgba(196, 71, 125, .12)'],
    '#26734d': ['#26734d', '#194e34', '#55a77b', 'rgba(38, 115, 77, .12)'],
    '#bc6b25': ['#bc6b25', '#874a18', '#e39a5a', 'rgba(188, 107, 37, .12)'],
  }[color];
  if (!palette) return;
  const root = document.body.style;
  ['--primario', '--primario-profundo', '--primario-claro', '--primario-tinte']
    .forEach((property, index) => root.setProperty(property, palette[index]));
}

export function buildProfileAvatar(user, className = 'profile-avatar') {
  const avatar = el('span', className);
  avatar.setAttribute('aria-label', `Avatar de ${user.full_name}`);
  const photo = getProfilePhoto(user.id);
  const item = readCustomization(user.id).avatar_item;
  const imageUrl = photo || getStudentAvatarImage(item);
  if (imageUrl) {
    const image = el('img');
    image.src = imageUrl;
    image.alt = '';
    avatar.appendChild(image);
  } else avatar.appendChild(el('span', '', initials(user.full_name)));
  return avatar;
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
