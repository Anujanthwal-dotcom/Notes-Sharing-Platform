import api from './api';
import type {
  AuthResponse,
  RegistrationToken,
  SignupPayload,
  User,
  Note,
  Analytics,
  College,
  Course,
  SearchResult,
} from '../types';

// ─── Auth ─────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  getOtp: (email: string) =>
    api.post<boolean>('/auth/get-otp', { email }),

  verifyOtp: (email: string, otp: string) =>
    api.post<RegistrationToken>('/auth/verify-otp', { email, otp }),

  signup: (data: SignupPayload) =>
    api.post<AuthResponse>('/auth/signup', data),
};

// ─── User ─────────────────────────────────────────────
export const userService = {
  getData: () =>
    api.get<User>('/user/data'),

  update: (data: Partial<User>) =>
    api.patch('/user/update', data),

  deleteAccount: () =>
    api.delete('/user/delete'),
};

// ─── Notes ────────────────────────────────────────────
export const noteService = {
  upload: (formData: FormData) =>
    api.post<Note>('/note/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyNotes: () =>
    api.get<Note[]>('/note/my-notes'),

  getCollegeNotes: () =>
    api.get<Note[]>('/note/college-notes'),

  download: (id: number) =>
    api.get(`/note/download/${id}`, { responseType: 'blob' }),

  update: (id: number, data: Partial<Note>) =>
    api.patch(`/note/${id}`, data),

  delete: (id: number) =>
    api.delete(`/note/${id}`),
};

// ─── Search ───────────────────────────────────────────
export const searchService = {
  search: (params: Record<string, string | number>) =>
    api.get<SearchResult>('/search', { params }),

  getHistory: () =>
    api.get<string[]>('/search/history'),
};

// ─── Analytics (Public) ───────────────────────────────
export const analyticsService = {
  get: () =>
    api.get<Analytics>('/analytics/get-analytics'),
};

// ─── College ──────────────────────────────────────────
export const collegeService = {
  getAll: () =>
    api.get<College[]>('/college/list'),
};

// ─── Course ───────────────────────────────────────────
export const courseService = {
  getAll: () =>
    api.get<Course[]>('/course/all'),
};
