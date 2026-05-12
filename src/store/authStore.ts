import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { User, Role } from '../types';
import { storage } from '../lib/storage';
import { hashPassword, checkPassword } from '../lib/utils';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  addUser: (name: string, email: string, password: string, role: Role) => { ok: boolean; error?: string };
  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  resetPassword: (id: string, newPassword: string) => void;
  changeOwnPassword: (currentPassword: string, newPassword: string) => { ok: boolean; error?: string };
  _init: () => void;
}

const SEED_ADMIN: User = {
  id: 'admin-seed',
  name: 'Admin User',
  email: 'admin@dss.io',
  password: hashPassword('admin123'),
  role: 'admin',
  createdAt: new Date().toISOString(),
  active: true,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],

  _init() {
    let users = storage.get<User[]>('users');
    if (!users || users.length === 0) {
      users = [SEED_ADMIN];
      storage.set('users', users);
    }
    const session = storage.get<User>('session');
    set({ users, currentUser: session ?? null });
  },

  login(email, password) {
    const users = storage.get<User[]>('users') ?? [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No account found with that email.' };
    if (!user.active) return { ok: false, error: 'This account has been deactivated.' };
    if (!checkPassword(password, user.password)) return { ok: false, error: 'Incorrect password.' };
    const updated = { ...user, lastLogin: new Date().toISOString() };
    const newUsers = users.map(u => u.id === user.id ? updated : u);
    storage.set('users', newUsers);
    storage.set('session', updated);
    set({ currentUser: updated, users: newUsers });
    return { ok: true };
  },

  logout() {
    storage.remove('session');
    set({ currentUser: null });
  },

  addUser(name, email, password, role) {
    const users = get().users;
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'A user with that email already exists.' };
    }
    const newUser: User = {
      id: uuid(),
      name,
      email,
      password: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
      active: true,
    };
    const next = [...users, newUser];
    storage.set('users', next);
    set({ users: next });
    return { ok: true };
  },

  updateUser(id, updates) {
    const next = get().users.map(u => u.id === id ? { ...u, ...updates } : u);
    storage.set('users', next);
    const cur = get().currentUser;
    const updated = next.find(u => u.id === id);
    if (cur?.id === id && updated) {
      storage.set('session', updated);
      set({ users: next, currentUser: updated });
    } else {
      set({ users: next });
    }
  },

  deleteUser(id) {
    const next = get().users.filter(u => u.id !== id);
    storage.set('users', next);
    set({ users: next });
  },

  resetPassword(id, newPassword) {
    get().updateUser(id, { password: hashPassword(newPassword) });
  },

  changeOwnPassword(currentPassword, newPassword) {
    const user = get().currentUser;
    if (!user) return { ok: false, error: 'Not logged in.' };
    if (!checkPassword(currentPassword, user.password)) return { ok: false, error: 'Current password is incorrect.' };
    get().updateUser(user.id, { password: hashPassword(newPassword) });
    return { ok: true };
  },
}));
