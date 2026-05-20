<div align="center">

# MedScan AI — Frontend

**React 19 + TypeScript UI for AI-powered medical scan analysis**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)

</div>

---

## Overview

The MedScan AI frontend is a single-page React 19 application that powers patient, doctor, and admin workflows for AI-assisted chest X-ray diagnosis. It pairs with the [`medical-diagnosis-api`](https://github.com/AhmYousry/medical-diagnosis-api) backend over REST + WebSocket.

### Highlights

| | |
|---|---|
| **Real-time results** | WebSocket subscription streams `processing` -> `completed` updates the moment the AI finishes — no polling |
| **Silent token refresh** | axios interceptor auto-refreshes expired access tokens; users never see a spurious logout |
| **Role-based routing** | Three role flavors (patient, verified doctor, admin) with guarded routes and tailored dashboards |
| **Email verification + password reset** | Complete one-time-token flows with branded UI states |
| **Animated UX** | Framer Motion page transitions and micro-interactions tuned for a "Clinical Luxury" design system |
| **Sentry monitoring** | Opt-in browser tracing + session replay (masked) when `VITE_SENTRY_DSN` is set |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| HTTP | axios (with refresh-token interceptor) |
| Forms | React Hook Form + Zod |
| UI primitives | Radix UI + custom shadcn-style components |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Animation | Framer Motion 11 |
| Icons | Lucide |
| Monitoring | Sentry (`@sentry/react`) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- The backend stack running (see [`medical-diagnosis-api`](https://github.com/AhmYousry/medical-diagnosis-api))

### Local development

```bash
git clone https://github.com/AhmYousry/medical-diagnosis-ui
cd medical-diagnosis-ui

npm install
npm run dev
```

Open http://localhost:5173

### Environment variables

Create a `.env.local` file (Vite picks it up automatically):

```ini
# Required — backend base URL
VITE_API_URL=http://localhost:8000

# Optional — Sentry browser monitoring
VITE_SENTRY_DSN=
```

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # local preview of the prod bundle
```

The included `Dockerfile` produces a minimal nginx image that serves the built assets — see the backend repo's `docker-compose.prod.yml` for the full deploy stack.

---

## Project Structure

```
src/
├── main.tsx                # Entry point, Sentry init, ErrorBoundary
├── App.tsx                 # Route definitions
├── AppWithAuth.tsx         # Auth bootstrap + providers (Query, Router, Toast)
│
├── pages/                  # Route-level components
│   ├── landing.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── verify-email.tsx          ┐
│   ├── forgot-password.tsx       │  Sprint 2 auth flows
│   ├── reset-password.tsx        ┘
│   ├── user-dashboard.tsx
│   ├── upload-page.tsx
│   ├── predictions-page.tsx
│   ├── prediction-detail.tsx     # Live WebSocket result view
│   ├── doctor-register.tsx       ┐
│   ├── doctor-pending.tsx        │  Doctor verification
│   ├── doctor-profile.tsx        ┘
│   ├── admin-dashboard.tsx       ┐
│   ├── admin-users.tsx           │  Admin panel
│   ├── admin-predictions.tsx     │
│   ├── admin-prediction-detail.tsx ┘
│   ├── notifications-page.tsx
│   ├── settings-page.tsx
│   └── not-found.tsx
│
├── components/             # Reusable UI primitives + feature components
├── services/               # API clients (axios) per resource
│   ├── authService.ts
│   ├── uploadService.ts
│   ├── predictionService.ts
│   └── adminService.ts
├── hooks/                  # Custom hooks (useAuth, useWebSocket, etc.)
├── store/                  # Zustand stores
├── lib/                    # Utilities (axios instance, cn, validators)
├── types/                  # Shared TS types
└── utils/                  # Pure helpers
```

---

## Key Concepts

### Auth flow

1. **Login** -> backend returns `{ access_token, refresh_token }`
2. Access token stored in memory; refresh token in `httpOnly`-safe storage
3. axios interceptor catches 401 responses, calls `/auth/refresh`, retries the original request transparently
4. On refresh failure -> hard logout to `/login`

### Real-time predictions

The prediction detail page opens a WebSocket to `/api/v1/predict/{id}/ws` immediately after queuing a task. Status transitions (`processing` -> `completed` | `failed`) come through the same channel powered by the backend's Redis pub/sub bridge — no manual polling required.

### Role-based routing

`AppWithAuth.tsx` reads the current user from the auth store and gates routes:
- **`/dashboard`** -> patient view
- **`/doctor/*`** -> doctor profile + pending-approval screens
- **`/admin/*`** -> admin panel (users, predictions, doctor approvals)
- Unauthenticated -> public landing / login / register

### Error boundary + Sentry

A top-level `<ErrorBoundary>` catches render errors. When `VITE_SENTRY_DSN` is set, `main.tsx` initializes Sentry with:
- `browserTracingIntegration` (10% sample rate)
- `replayIntegration` with `maskAllText` + `blockAllMedia` (5% session sample, 100% on error)

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check then build production bundle |
| `npm run preview` | Serve the production build locally |

---

## API Endpoints Used

See the [backend API reference](https://github.com/AhmYousry/medical-diagnosis-api#api-reference) for the full list. Highlights:

| Method | Endpoint | Where it's used |
|--------|----------|-----------------|
| `POST` | `/api/v1/auth/register` | `register.tsx` |
| `POST` | `/api/v1/auth/login` | `login.tsx` |
| `POST` | `/api/v1/auth/refresh` | axios interceptor |
| `POST` | `/api/v1/auth/verify-email` | `verify-email.tsx` |
| `POST` | `/api/v1/auth/forgot-password` | `forgot-password.tsx` |
| `POST` | `/api/v1/auth/reset-password` | `reset-password.tsx` |
| `POST` | `/api/v1/uploads` | `upload-page.tsx` |
| `POST` | `/api/v1/predict/{file_id}` | `upload-page.tsx` |
| `WS`   | `/api/v1/predict/{id}/ws` | `prediction-detail.tsx` |

---

## Related

- [`medical-diagnosis-api`](https://github.com/AhmYousry/medical-diagnosis-api) — FastAPI backend
- [`medical-diagnosis-AI-Model`](https://github.com/AhmYousry/medical-diagnosis-AI-Model) — PyTorch CheXNet inference service

---

<div align="center">
  <sub>Built by <a href="https://github.com/AhmYousry">Ahmed Yousry</a></sub>
</div>
