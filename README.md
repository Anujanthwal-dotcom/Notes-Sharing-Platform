# NotesBuddy

NotesBuddy is a comprehensive platform designed for students to share, discover, and manage college notes efficiently. The project follows a monorepo-style structure with a dedicated backend, a web frontend, and a mobile application.

## 🚀 Project Overview

NotesBuddy empowers students by providing a centralized repository for academic resources. It supports college-specific and course-specific note categorization, making it easy for students to find exactly what they need for their curriculum.

### Key Features
- **Centralized Note Sharing:** Upload and download notes across various subjects, semesters, and sessions.
- **Multi-Platform Access:** Available via a responsive Web App and a cross-platform Mobile App (Android/iOS).
- **Secure Storage:** All notes are securely stored in AWS S3 with virus scanning (ClamScan) on upload.
- **Smart Search:** Filter notes by college, course, subject, semester, and session.
- **Admin Dashboard:** Management interface for overseeing users, colleges, and notes.
- **User Analytics:** Insights into note popularity and user engagement.

---

## 🏗 Architecture & Tech Stack

The project is divided into three main components:

### 1. Backend (`notes-buddy-backend`)
Built with **NestJS**, providing a robust and scalable REST API.
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Storage:** AWS S3
- **Caching:** Redis / Cache Manager
- **Authentication:** JWT with Middleware
- **Security:** ClamScan for virus protection, Bcrypt for password hashing
- **Communication:** Nodemailer for email services

### 2. Mobile App (`notes-buddy-expo`)
A cross-platform mobile application built with **Expo**.
- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (File-based routing)
- **State Management:** React Context API (AuthContext)
- **Icons:** Ionicons / Expo Vector Icons
- **Storage:** Expo SecureStore for sensitive data

### 3. Web Frontend (`notes-buddy-frontend`)
A modern, responsive web application built with **React**.
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **HTTP Client:** Axios

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (optional, for caching)
- AWS S3 Credentials (for storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd NotesBuddy
   ```

2. **Setup Backend:**
   ```bash
   cd notes-buddy-backend
   npm install
   # Create a .env file based on existing config and run:
   npm run start:dev
   ```

3. **Setup Web Frontend:**
   ```bash
   cd ../notes-buddy-frontend
   npm install
   npm run dev
   ```

4. **Setup Mobile App:**
   ```bash
   cd ../notes-buddy-expo
   npm install
   npx expo start
   ```

---

## 📂 Directory Structure

```text
NotesBuddy/
├── notes-buddy-backend/   # NestJS API
│   ├── src/               # Application logic (auth, note, college, etc.)
│   └── test/              # E2E tests
├── notes-buddy-expo/      # React Native Mobile App
│   ├── app/               # Expo Router screens
│   └── components/        # Mobile UI components
└── notes-buddy-frontend/  # React Web App
    ├── src/               # Web pages and components
    └── public/            # Static assets
```

## 📄 License
This project is UNLICENSED (Internal/Private).
