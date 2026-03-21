# BlastMyCV Mobile App

A React Native mobile app for [BlastMyCV](https://blastmycv.com) — connecting job seekers to opportunities. The app shares the same backend, users, and database as the blastmycv.com website.

## Architecture

- **Mobile:** Expo SDK 53 + React Native 0.76 (port 8081)
- **Backend:** Hono + Bun (port 3000) — transparent reverse proxy to blastmycv.com API
- **External API:** `https://blastmycv.com/api` (same backend as the website)

## Authentication

- **Type:** PHP session-based (`PHPSESSID` cookie)
- **Login:** `POST /api/auth/login` → returns session cookie + user profile
- **Session storage:** Zustand + AsyncStorage (persisted across app restarts)
- **Cookie forwarding:** Sent as `X-Session-Cookie` header (browsers block the `Cookie` header in JS fetch) → proxy forwards it as `Cookie` to blastmycv.com

> **Note:** The blastmycv.com website uses a separate PHP form login (`/login.php`). The REST API password may differ from the website password for some accounts. Users can use "Forgot Password" to reset.

## CORS Proxy

All API calls go through the Vibecode backend proxy to avoid CORS issues (blastmycv.com does not send `Access-Control-Allow-Origin` headers):

```
Mobile App → POST /api/proxy/auth/login
           → Vibecode Backend (Hono)
           → https://blastmycv.com/api/auth/login
```

The proxy handles:
- Special login/register handlers that extract `Set-Cookie` server-side and return session cookie in the response body
- Forwarding `X-Session-Cookie` header as `Cookie` to blastmycv.com
- Stripping cookies on login requests to avoid stale session conflicts

## App Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | Sign in with BlastMyCV credentials |
| Register | `/(auth)/register` | Create new BlastMyCV account |
| Dashboard | `/(tabs)/` | Stats, recent orders, quick actions |
| My CVs | `/(tabs)/cvs` | Upload and manage CVs |
| Blast | `/(tabs)/blast` | Browse and purchase packages |
| Orders | `/(tabs)/orders` | Track order statuses |
| Profile | `/(tabs)/profile` | User profile and settings |

## Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A14` | Screen backgrounds |
| Card | `#1A1A2E` | Card/surface backgrounds |
| Border | `#2A2A40` | Borders and dividers |
| Accent | `#FF6B35` | Primary orange, buttons, icons |
| Text muted | `#888899` | Secondary text |

## API Endpoints

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/auth/login` | POST | No | ✅ Working |
| `/auth/register` | POST | No | ✅ Working |
| `/auth/logout` | POST | Yes | ✅ Working |
| `/auth/me` | GET | Yes | ✅ Working |
| `/user/profile` | GET/PUT | Yes | ✅ Working |
| `/packages` | GET | No | ✅ Working |
| `/orders` | GET/POST | Yes | ✅ Working (returns `{ orders, total }`) |
| `/cvs` | GET/POST | Yes | ⚠️ 500 from blastmycv.com |
| `/notifications` | GET | Yes | ⚠️ 500 from blastmycv.com |

## Key Files

```
mobile/src/
├── app/
│   ├── _layout.tsx              # Root layout
│   ├── (auth)/
│   │   ├── _layout.tsx          # Redirects to tabs if authenticated
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar (redirects to login if not authenticated)
│   │   ├── index.tsx            # Dashboard
│   │   ├── cvs.tsx              # CV management
│   │   ├── blast.tsx            # Packages / Blast
│   │   ├── orders.tsx           # Order history
│   │   └── profile.tsx          # Profile & settings
│   └── notifications.tsx        # Notifications (stack screen)
├── lib/
│   ├── api/
│   │   └── blastmycv-api.ts    # API client (all calls via proxy)
│   ├── state/
│   │   └── auth-store.ts       # Auth state (Zustand + AsyncStorage)
│   └── types/
│       └── blastmycv.ts        # TypeScript types

backend/src/
├── routes/
│   └── blast-proxy.ts          # Transparent reverse proxy to blastmycv.com/api
└── index.ts                    # Hono app, mounts proxy at /api/proxy
```
