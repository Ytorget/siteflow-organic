# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Siteflow consists of two main components:
1. **Marketing Website** - Swedish-language React/Vite SPA for the digital systems consultancy
2. **Customer Portal Backend** - Elixir/Phoenix API with Ash Framework for the B2B SaaS customer portal

## Commands

### Frontend (React/Vite)
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Create production build to dist/
npm run server   # Start Express backend for Gemini AI (requires dist/)
npm start        # Build + start production server
```

### Backend (Elixir/Phoenix) - Use PowerShell scripts on Windows
```powershell
.\restart_server.ps1    # Start Phoenix server (localhost:3000)
.\gen_types.ps1         # Generate TypeScript types from Ash resources
.\run_migrations.ps1    # Run database migrations
.\test_backend.ps1      # Run backend tests
```

Or with mix directly (requires PATH setup):
```bash
cd backend
mix phx.server          # Start server
mix ash_typescript.codegen  # Generate TypeScript RPC types
mix ecto.migrate        # Run migrations
mix test                # Run tests
```

## Architecture

### Frontend (React SPA)
- **Entry:** `index.tsx` → `App.tsx`
- **Routing:** Custom client-side routing via `setCurrentPage` state (no react-router)
- **Pages:** Defined in `types.ts` - home, philosophy, audience, results, contact, login, blog, caseStudies, privacy, terms
- **Styling:** Tailwind CSS via CDN, custom animations in `index.html` head
- **Components:** `components/` folder with lazy-loaded page components

### Backend - Express (server/)
- **Server:** `server/index.js` (ES Modules)
- **API:** `POST /api/assess-system-needs` - Gemini AI customer fit analysis
- **Static serving:** Express serves `dist/` in production with SPA fallback

### Backend - Elixir/Phoenix (backend/)
- **Framework:** Phoenix 1.8 with Ash Framework 3.x
- **Database:** PostgreSQL via Ecto/AshPostgres
- **Auth:** AshAuthentication with JWT tokens, PBKDF2 password hashing (Windows-compatible)

**Ash Domains:**
- `Backend.Accounts` - User authentication (User, Token resources)
- `Backend.Portal` - Customer portal (Company, Project, Ticket, Comment, TimeEntry, Document, Invitation)

**API Routes (backend/lib/backend_web/router.ex):**
- `POST /api/auth/register` - User registration
- `POST /api/auth/sign-in` - User login (returns JWT)
- `DELETE /api/auth/sign-out` - User logout
- `/api/accounts/*` - Protected Accounts JSON API
- `/api/portal/*` - Protected Portal JSON API
- `/dev/dashboard` - Phoenix LiveDashboard (dev only)

**TypeScript Integration:**
- AshTypescript generates RPC types to `siteflow-public/src/generated/ash-rpc.ts`
- Configure RPC actions in domain files (e.g., `backend/lib/backend/portal/portal.ex`)

### i18n System
- Languages: Swedish (sv, default) and English (en)
- Config: `src/i18n.ts`
- Translations: `locales/sv.json` and `locales/en.json`
- Usage: `useTranslation()` hook with `t('key.path')` syntax
- **Important:** When adding UI text, update both locale files

## Key Conventions

- All UI text must use i18n translations, not hardcoded strings
- New frontend pages: update `Page` type in `types.ts`, add to `App.tsx` router, create component
- New Ash resources: add to domain, create migration, regenerate TypeScript types
- Auth API format: wrap credentials in `user` key - `{ "user": { "email": "...", "password": "..." } }`
- CORS is configured in `backend/lib/backend_web/plugs/cors.ex`

## Environment

- Frontend `.env`: `GEMINI_API_KEY` (see `.env.example`)
- Backend config: `backend/config/dev.exs` for database and server settings
- Deployment: Fly.io via Docker (see `fly.toml`, `Dockerfile`)
