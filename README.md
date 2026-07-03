# To-Do List

A full-stack, PWA-ready kanban task manager with a **glassmorphism UI**, daily routine tracker, notifications, and calendar view. Built with React + Vite (frontend) and Node.js + Express (backend).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, CSS Modules |
| State | React Context + `useReducer` |
| Drag & drop | `@dnd-kit/core` |
| Calendar | `react-big-calendar` + `date-fns` |
| PWA | `vite-plugin-pwa` + Workbox service worker |
| Backend | Node.js + Express |
| Persistence | `server/db.json` (server) · `localStorage` (offline cache) |

---

## Features

- **Kanban board** — three columns (To Do / In Progress / Done) with drag-and-drop
- **Calendar view** — tasks mapped to due dates, colour-coded by status
- **Daily Routine** — 6 AM → 10 PM preset schedule with Mark Done, progress bar, and 🎉 celebration animation when all tasks are complete
- **Notifications** — browser push alerts for overdue / due-today tasks; bell icon with badge in navbar
- **Optimistic UI** — local state updates instantly and rolls back on API error
- **Undo delete** — 5-second toast window before the DELETE request fires
- **Offline fallback** — loads from `localStorage` when the server is unreachable
- **PWA / installable** — works as a standalone app on Android & iOS (Add to Home Screen)
- **Glassmorphism** — animated mesh gradient background, frosted-glass cards and modals

---

## Project Structure

```
.
├── client/                  # Vite + React frontend  (port 5173)
│   ├── public/
│   │   ├── pwa-icon.svg
│   │   └── pwa-maskable.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx
│   │   │   ├── BottomNav.jsx        ← mobile bottom navigation
│   │   │   ├── CalendarView.jsx
│   │   │   ├── CelebrationOverlay.jsx
│   │   │   ├── Column.jsx
│   │   │   ├── ConfirmDeleteDialog.jsx
│   │   │   ├── DailyRoutine.jsx
│   │   │   ├── InstallPrompt.jsx    ← PWA install banner
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── context/
│   │   │   └── TaskContext.jsx
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useTaskNotifications.js
│   │   │   └── useTasks.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       ├── glass.module.css
│   │       └── variables.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Express API  (port 3001)
    ├── middleware/
    │   └── validateTask.js
    ├── routes/
    │   └── tasks.js
    ├── db.json              ← flat-file task database
    ├── db.js
    ├── index.js
    └── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Setup & Running

### 1. Backend (Terminal 1)

```bash
cd server
npm install

# Optional: set a custom port
cp .env.example .env

npm run dev          # --watch mode on http://localhost:3001
```

### 2. Frontend — Desktop (Terminal 2)

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:3001`.

### 3. Frontend — Mobile / Phone access

Run Vite with `--host` to expose it on your local network:

```bash
cd client
npm run dev -- --host 0.0.0.0 --port 5173
```

Then find your machine's local IP:

```bash
# Windows
ipconfig | findstr IPv4

# macOS / Linux
hostname -I
```

Open on your phone (same Wi-Fi):

```
http://<YOUR_LOCAL_IP>:5173
```

> **Current machine IP:** `192.168.8.102`  
> Phone URL: `http://192.168.8.102:5173`

### 4. Production build & preview

```bash
cd client
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
# Open on phone: http://192.168.8.102:4173
```

---

## Installing as a Mobile App (PWA)

| Platform | Steps |
|----------|-------|
| **Android (Chrome)** | Open the URL → browser menu → **Add to Home screen** or **Install app** |
| **iPhone (Safari)** | Open the URL → Share button → **Add to Home Screen** |

Once installed, the app launches full-screen like a native app and works offline thanks to the Workbox service worker.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks` | Return all tasks |
| `POST` | `/api/tasks` | Create a task (`title` required) |
| `PUT` | `/api/tasks/:id` | Update fields; `updatedAt` auto-set |
| `DELETE` | `/api/tasks/:id` | Delete a task |

All responses are JSON. Errors return `{ "error": "<message>" }`.

---

## Environment Variables (server)

Copy `server/.env.example` → `server/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the Express server listens on |

---

## Data Model

```js
/**
 * @typedef {Object} Task
 * @property {string} id            - UUID
 * @property {string} title
 * @property {string} description
 * @property {"todo"|"doing"|"done"} status
 * @property {number} timeAllocated - minutes
 * @property {string} dueDate       - YYYY-MM-DD
 * @property {string} createdAt     - ISO string
 * @property {string} updatedAt     - ISO string
 */
```

