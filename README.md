
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=300&section=header&text=NotesBuddy&fontSize=90&fontAlignY=35&animation=fadeIn&desc=Your%20College%20Notes,%20All%20in%20One%20Place&descAlignY=55&descAlign=50" width="100%" />
</p>

<p align="center">
  <b>A full-stack note-sharing platform for students — upload, discover, and manage college notes effortlessly.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS-ea2845?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Mobile-Expo-000020?style=flat-square&logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Web-React%2019-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Storage-AWS%20S3-569A31?style=flat-square&logo=amazons3" alt="S3" />
  <img src="https://img.shields.io/badge/Style-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
</p>

---

## ✨ What is NotesBuddy?

**NotesBuddy** is a student-friendly platform where you can **upload**, **search**, and **download** college notes — organized by college, course, subject, semester, and session. Whether you're on your phone or laptop, NotesBuddy has you covered with both a **mobile app** (Expo/React Native) and a **web app** (React + Vite), powered by a **NestJS backend**.

| What you can do | &nbsp; |
|---|---|
| 📤 Upload notes (PDFs) for your courses | 🔍 Search & filter notes by college, course, subject & more |
| 📱 Access from mobile (Android/iOS) or web | 🔐 Secure JWT-based authentication |
| 🛡️ Virus scanning on every upload | 📊 Analytics & admin dashboard |

---

## 🧱 Project Structure

```
NotesBuddy/
│
├── notes-buddy-backend/          # 🚀 NestJS REST API
│   ├── src/
│   │   ├── auth/                 # Registration, login, JWT
│   │   ├── user/                 # User profile management
│   │   ├── note/                 # Note CRUD & file handling
│   │   ├── college/              # College management
│   │   ├── course/               # Course management
│   │   ├── search/               # Full-text note search
│   │   ├── analytics/            # Usage stats & metrics
│   │   ├── admin/                # Admin dashboard logic
│   │   ├── storage/              # AWS S3 file operations
│   │   ├── scanner/              # ClamAV virus scanning
│   │   ├── email/                # Nodemailer email service
│   │   ├── crypto/               # Encryption utilities
│   │   ├── database/             # TypeORM & PostgreSQL setup
│   │   └── middleware/           # JWT & admin guards
│   ├── test/                     # E2E tests
│   └── docker-compose.yml        # Postgres + MinIO + ClamAV
│
├── notes-buddy-expo/             # 📱 Mobile App (Expo / React Native)
│   ├── app/
│   │   ├── (auth)/               # Login & Signup screens
│   │   ├── (tabs)/               # Home, My Notes, Search, Upload, Profile
│   │   └── preview.tsx           # Note preview screen
│   ├── components/               # Reusable UI components
│   ├── context/                  # Auth state management
│   ├── services/                 # Axios API client, endpoints, downloads
│   └── constants/                # Theme colors
│
└── notes-buddy-frontend/         # 🌐 Web App (React + Vite + Tailwind)
    ├── src/
    │   ├── pages/                # Home, Login, Signup, Dashboard, etc.
    │   ├── components/           # Navbar, RouteGuards, Modals
    │   ├── context/              # Auth state management
    │   ├── services/             # Axios API client & endpoints
    │   └── types/                # Shared TypeScript definitions
    ├── public/                   # Static assets
    └── vercel.json               # Vercel deployment config
```

---

## 🛠️ Tech Stack

| Component | Framework / Tools |
|---|---|
| **Backend** | NestJS v11, TypeORM, PostgreSQL, JWT, AWS S3, ClamAV, Nodemailer |
| **Mobile App** | Expo SDK 54, React Native 0.81, Expo Router, Axios |
| **Web Frontend** | React 19, Vite 7, Tailwind CSS v4, React Router v7, Axios, Lucide |
| **Infrastructure** | Docker Compose (Postgres + MinIO + ClamAV), Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL (or run via Docker Compose)
- AWS S3 credentials (or use MinIO locally)

### Quick Start

```bash
# 1. Clone & enter the project
git clone <repo-url>
cd NotesBuddy

# 2. Start backend dependencies (Postgres, MinIO, ClamAV)
cd notes-buddy-backend
docker-compose up -d

# 3. Install & run the backend
npm install
npm run start:dev          # → http://localhost:8080

# 4. In a new terminal — Web frontend
cd notes-buddy-frontend
npm install
npm run dev                # → http://localhost:5173

# 5. In another terminal — Mobile app
cd notes-buddy-expo
npm install
npx expo start             # → Scan QR with Expo Go
```

---

## 📸 Features at a Glance

- **🔐 Auth** — Register, login, JWT-based protected routes
- **🏫 Colleges & Courses** — Hierarchical organization of academic content
- **📄 Notes** — Upload PDFs with subject, topic, semester metadata
- **🔎 Search** — Smart filtering by college, course, subject, semester, session
- **📊 Analytics** — Track note views, downloads, and user engagement
- **👑 Admin Panel** — Manage users, notes, colleges, courses
- **🛡️ Security** — Virus scanning (ClamAV), password hashing (Bcrypt), input validation
- **📱 Cross-platform** — Native mobile experience + responsive web app

---

<p align="center">
  Made with ❤️ for students, by students.
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer" width="100%" />
</p>
