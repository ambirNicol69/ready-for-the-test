import * as authService from '../services/auth-service.js';
import { saveToken, getToken, clearToken, saveUser, getUser, clearUser } from '../utils/storage.js';
import { emit } from '../utils/events.js';

export const session = {
  user: null,

  get isLogged() {
    return Boolean(getToken()) && this.user !== null;
  },

  get isTeacher() {
    return this.user !== null && this.user.role === 'docente';
  },

  get isStudent() {
    return this.user !== null && this.user.role === 'estudiante';
  },

  async init() {
    if (!getToken()) {
      this.user = null;
      return;
    }
    try {
      await this.reload();
    } catch {
      this.logout();
    }
  },

  async login(email, password) {
    const data = await authService.login({ email, password });
    this.applyAuth(data);
  },

  async register({ fullName, email, password, role }) {
    const data = await authService.registerUser({ fullName, email, password, role });
    this.applyAuth(data);
  },

  async reload() {
    const user = await authService.getMe();
    this.user = user;
    saveUser(user);
    emit('session', { user });
    return user;
  },

  logout() {
    clearToken();
    clearUser();
    this.user = null;
    emit('session', { user: null });
  },

  applyAuth(data) {
    saveToken(data.token);
    this.user = data.user;
    saveUser(data.user);
    emit('session', { user: data.user });
  },
};
