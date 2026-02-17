# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raccoons Web is a landing page and management system for a motorcycle workshop (taller de motocicletas). The application includes:
- Public-facing landing page with services and contact information
- Service tracking system for customers to monitor their motorcycle repairs
- Appointment booking system
- Admin panel for managing services and appointments
- Backend API with PostgreSQL, JWT auth, and email notifications

## Tech Stack

### Frontend
- **Framework:** React 19.2.0 with Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **Styling:** Pure CSS (no CSS framework)
- **Animations:** GSAP, Lenis (smooth scroll), Intersection Observer
- **PDF Generation:** jsPDF 3.0.4 + html2canvas
- **Icons:** Lucide React
- **Build Tool:** Vite with @vitejs/plugin-react + compression (gzip/brotli)

### Backend
- **Runtime:** Node.js 20 with Express 4.18
- **Database:** PostgreSQL 16 with Prisma ORM 6.2
- **Auth:** JWT (access + refresh tokens) with bcryptjs
- **Queue:** Bull + Redis (notifications)
- **Email:** Nodemailer (Gmail SMTP)
- **File Upload:** Multer (local storage)
- **Logging:** Winston with daily rotation
- **Architecture:** Clean Architecture (core/infrastructure/presentation/shared)

### Deployment
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy + SSL + SPA)
- **SSL:** Let's Encrypt via Certbot
- **Domain:** raccoonsoax.com
- **CI/CD:** GitHub Actions (SSH deploy on push to main)

## Development Commands

```bash
# Frontend (from project root)
npm run dev          # Dev server on http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
npm run preview      # Preview production build

# Backend (from backend/)
npm run dev          # Nodemon dev server on :3001
npm run start        # Production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:migrate:prod  # Run migrations (production)
npm run db:seed      # Seed admin user
npm run db:studio    # Prisma Studio GUI
npm run test         # Jest tests

# Docker (from project root)
# Dev: only postgres + redis (frontend/backend run with npm)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres redis

# Production: all services
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

## Architecture

### Project Structure

```
raccoons_web/
├── src/                     # Frontend React source
│   ├── api/                 # API client (axios) + service modules
│   ├── components/          # Reusable components + admin/
│   ├── pages/               # Route pages (Home, Admin, Tracking)
│   ├── services/            # PDF, WhatsApp helpers
│   ├── hooks/               # Custom hooks (cookie, theme, scroll)
│   ├── utils/               # Status helpers
│   └── assets/              # Static assets
├── public/                  # Public images, gallery
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── application/ # Use cases (auth, services, appointments, notifications)
│   │   │   └── domain/      # Domain models
│   │   ├── infrastructure/
│   │   │   ├── database/    # Prisma client, repositories, seeds
│   │   │   ├── messaging/   # Email (Nodemailer), SMS (Twilio - disabled)
│   │   │   ├── storage/     # File storage
│   │   │   └── websockets/  # Socket.io setup
│   │   ├── presentation/
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── routes/      # Express routes
│   │   │   ├── middlewares/  # Request logger, error handler
│   │   │   ├── dto/         # Data transfer objects
│   │   │   └── validators/  # Joi validation
│   │   └── shared/
│   │       ├── config/      # Env-based configuration
│   │       ├── logger/      # Winston logger
│   │       ├── errors/      # AppError class
│   │       └── utils/       # JWT, password helpers
│   ├── prisma/              # Schema + migrations
│   ├── uploads/             # User-uploaded files (gitignored)
│   └── logs/                # Application logs (gitignored)
├── nginx/                   # Nginx config (reverse proxy + SSL)
├── deploy/                  # Deployment scripts
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Dev override (postgres + redis only)
├── Dockerfile               # Frontend multi-stage build
└── .github/workflows/       # CI/CD
```

### Backend Legacy Files

The following files in `backend/` root are **legacy WhatsApp integration files** preserved for future implementation. They are NOT used by the Docker setup (which uses `src/server.js`):
- `backend/server.js` - Old Express server
- `backend/routes/`, `backend/controllers/`, `backend/services/`, `backend/config/`, `backend/middleware/` - Old route/controller structure

**Do NOT modify or delete these files.** They will be integrated in a future phase.

### Routing Structure

- `/` - HomePage: Public landing page
- `/admin` - AdminPage: JWT-authenticated admin panel
- `/seguimiento` - TrackingPage: Service tracking for customers

### API Endpoints (backend)

```
GET    /api/v1/health              # Health check
POST   /api/v1/auth/register       # Register
POST   /api/v1/auth/login          # Login (returns JWT)
POST   /api/v1/auth/refresh        # Refresh token
POST   /api/v1/auth/logout         # Logout
GET    /api/v1/auth/me             # Current user

CRUD   /api/v1/services            # Service management
GET    /api/v1/services/code/:code # Track by code (public)
PUT    /api/v1/services/:id/status # Change status

CRUD   /api/v1/appointments        # Appointment management
GET    /api/v1/appointments/upcoming
PUT    /api/v1/appointments/:id/confirm
PUT    /api/v1/appointments/:id/cancel

GET    /api/v1/notifications       # Notification management
GET    /api/v1/notifications/unread
PUT    /api/v1/notifications/:id/read
```

### Database (Prisma)

Models: User, RefreshToken, Service, ServiceEvidence, ServiceHistory, Appointment, Notification

Service states: `RECEIVED → IN_DIAGNOSIS → IN_REPAIR → READY_FOR_PICKUP → DELIVERED` (or `CANCELLED`)

### Service Management Flow

1. Admin creates service → auto-generated tracking code (`RCN-XXXXXXXXX`)
2. Email notification sent to customer with tracking code
3. Admin updates status through workflow states
4. Evidence photos uploaded per service
5. Customer tracks via `/seguimiento` with tracking code
6. PDF reports generated client-side

## Deployment

### First Deploy (VPS)

```bash
# 1. Clone repo on VPS
git clone <repo-url> && cd raccoons_web

# 2. Run init script (generates secrets, gets SSL cert, starts everything)
bash deploy/init.sh

# 3. Configure email in backend/.env.production
```

### Subsequent Deploys

Automatic via GitHub Actions on push to `main`, or manually:
```bash
git pull origin main
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:16-alpine | 5432 (internal) | Database |
| redis | redis:7-alpine | 6379 (internal) | Job queue |
| backend | Custom (Node 20) | 3001 (internal) | API server |
| frontend | Custom (Nginx) | 80, 443 (public) | SPA + reverse proxy |
| certbot | certbot/certbot | - | SSL renewal |

### Environment Files

- `backend/.env` - Backend dev config (see `backend/.env.example`)
- `backend/.env.production` - Backend prod config (see `backend/.env.production.example`)
- `.env` - Docker compose vars (POSTGRES_PASSWORD)
- `.env.production.example` - Frontend prod env template

## Styling Approach

- All styles in dedicated `.css` files next to components
- Global styles in `App.css` and `index.css`
- No CSS preprocessors or CSS-in-JS
- Responsive design with mobile menu

## Important Files

- `backend/.env.example` - Backend environment template with setup instructions
- `backend/.env.production.example` - Production environment template
- `deploy/init.sh` - First-time VPS deployment script
- `nginx/nginx.conf` - Production Nginx config (SSL + reverse proxy)
- `docker-compose.yml` - Production Docker orchestration
- `docker-compose.dev.yml` - Development override (DB + Redis only)
