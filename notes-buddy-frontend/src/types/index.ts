export interface College {
  id: number;
  college_name: string;
  college_code: string;
}

export interface Course {
  id: number;
  course: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  college: College;
  course: Course;
  startYear: number;
  endYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  semester: number;
  subject: string;
  topic: string;
  course: Course;
  session: string;
  userId: number;
  college: College;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  userCount: number;
  notesCount: number;
}

export interface AuthResponse {
  access_token: string;
}

export interface RegistrationToken {
  registration_token: string;
}

export interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface SearchResult {
  data: Note[];
  meta: SearchMeta;
}

export interface SignupPayload {
  name: string;
  collegeCode: string;
  collegeName: string;
  course: string;
  password: string;
  startYear: number;
  endYear: number;
  registration_token: string;
}
