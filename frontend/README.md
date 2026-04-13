# Employee Management Frontend (Minimal)

This is a minimal React frontend for the simplified employee management system.

## Features

- Login for admin and employee
- One-time admin bootstrap (only if no admin exists)
- Admin dashboard:
  - Register employees
  - Create projects and assign them to employees
  - View all employees and all projects
- Employee dashboard:
  - View assigned projects
- No forgot password or password change flow

## Setup

```bash
npm install
npm run dev
```

Set optional API URL in `.env`:

```bash
VITE_API_URL=http://localhost:5001
VITE_IMAGE_BASE_URL=http://localhost:5001
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
```
