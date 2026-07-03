# To-Do List

A kanban-style task manager with a **glassmorphism UI** built on React + Vite (frontend) and Node.js + Express (backend), with JSON-file persistence and optional `localStorage` fallback for offline use.

---

## Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18 + Vite, CSS Modules |
| State     | React Context + `useReducer` |
| Drag & drop | `@dnd-kit/core` |
| Calendar  | `react-big-calendar` + `date-fns` |
| Backend   | Node.js + Express |
| Persistence | `server/db.json` (server) · `localStorage` (client cache) |

---

## Project Structure

```
.
├── client/          # Vite + React frontend  (port 5173)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/          # Express API  (port 3001)
    ├── middleware/
    ├── routes/
    ├── db.json       ← tasks are stored here
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

### 1. Backend

```bash
cd server
npm install

# Optional: copy env file and set a custom port
cp .env.example .env

npm run dev          # starts with --watch on http://localhost:3001
```

### 2. Frontend

Open a **second** terminal:

```bash
cd client
npm install
npm run dev          # starts Vite on http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:3001`, so no CORS config is needed in development.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/tasks` | Return all tasks |
| `POST` | `/api/tasks` | Create a task (`title` required) |
| `PUT`  | `/api/tasks/:id` | Update fields; `updatedAt` auto-set |
| `DELETE` | `/api/tasks/:id` | Delete a task |

All responses are JSON. Errors return `{ "error": "<message>" }`.

---

## Environment Variables (server)

Copy `server/.env.example` → `server/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3001`  | Port the Express server listens on |

---

## Features

- **Kanban board** with three columns (To Do / In Progress / Done), drag-and-drop via `@dnd-kit`
- **Calendar view** via `react-big-calendar`, events colour-coded by status
- **Optimistic UI** — local state updates instantly; rolls back on API error
- **Offline fallback** — if the server is unreachable, tasks load from `localStorage`
- **Undo delete** — 5-second toast after confirming deletion lets you reverse the action
- **Glassmorphism** — animated mesh gradient background, frosted-glass cards and modals
