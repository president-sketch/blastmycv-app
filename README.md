# BlastMyCV Mobile App

A React Native mobile app for [BlastMyCV](https://blastmycv.com) — connecting job seekers to opportunities.

## Architecture

- **Mobile:** Expo SDK 53 + React Native 0.76 (port 8081)
- **Backend:** Hono + Bun (port 3000) — local proxy/relay only
- **External API:** BlastMyCV API at `https://api.blastmycv.com`

## App Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | Sign in with BlastMyCV credentials |
| Register | `/(auth)/register` | Redirect to blastmycv.com |
| Dashboard | `/(tabs)/` | Stats, recent activity, quick actions |
| Jobs | `/(tabs)/jobs` | Browse and search job listings |
| Applications | `/(tabs)/applications` | Track application statuses |
| My CV | `/(tabs)/cv` | View and edit CV sections |
| Profile | `/(tabs)/profile` | User profile and settings |

## Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A14` | Screen backgrounds |
| Card | `#1A1A2E` | Card/surface backgrounds |
| Border | `#2A2A40` | Borders and dividers |
| Accent | `#FF6B35` | Primary orange, buttons, icons |
| Text muted | `#888899` | Secondary text |

## API Integration

The app is designed to connect to the BlastMyCV external REST API.

**API Client:** `mobile/src/lib/api/blastmycv-api.ts`

When BlastMyCV provides API endpoints, update:
1. `BLASTMYCV_API_BASE` constant in `blastmycv-api.ts`
2. `loginUser()` and `registerUser()` functions
3. Data fetching calls in each screen

**Auth:** JWT token stored in AsyncStorage via Zustand persist middleware.

## Key Files

```
mobile/src/
├── app/
│   ├── _layout.tsx              # Root layout + auth gate
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Register redirect
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar config
│       ├── index.tsx            # Dashboard
│       ├── jobs.tsx             # Job listings
│       ├── applications.tsx     # Applications tracker
│       ├── cv.tsx               # CV management
│       └── profile.tsx          # Profile & settings
├── lib/
│   ├── api/
│   │   └── blastmycv-api.ts    # External API client
│   ├── state/
│   │   └── auth-store.ts       # Auth state (Zustand)
│   └── types/
│       └── blastmycv.ts        # TypeScript types
```
