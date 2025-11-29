# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-agent AI assistant built as a single-page React application with Google OAuth integration for calendar and email access. The app consists of:
- **Personal Assistant**: Email management, calendar viewing, reminders, goals, AI chat
- **Health Coach**: Track water, sleep, exercise, meals, weight with visualization
- **Dashboard**: Cross-agent insights showing health and productivity correlations

## Commands

### Development
```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Build for production (outputs to dist/)
npm run preview    # Preview production build locally
```

### Deployment
Configured for Vercel deployment via `vercel.json`. The app is a static SPA with serverless API routes.

## Architecture

### Single-File Component Structure
The entire frontend lives in `src/App.jsx` (~5500 lines) organized into sections marked with comment blocks:
- **DATA PERSISTENCE LAYER** (lines 5-405): `usePersistentState` hook, `AppDataContext`, data provider
- **REUSABLE MODAL COMPONENTS** (lines 428-1453): Modal, EditGoalModal, AddGoalModal, etc.
- **PERSONAL ASSISTANT** (lines 1455-2812): AI response generation, chat interface, email/calendar UI
- **HEALTH COACH** (lines 2814-4864): Health logging, stats tracking, data visualization
- **DASHBOARD VIEW** (lines 4866-5246): Cross-agent insights and analytics
- **SETTINGS** (lines 5246-5371): App settings panel
- **MAIN APP** (lines 5372+): Root component with routing

### State Management
All data is managed via React Context (`AppDataContext`) with automatic localStorage persistence:
- `usePersistentState(key, defaultValue)` - Custom hook that syncs state to `localStorage` with key prefix `myassistant_${key}`
- Data keys: `userProfile`, `personalAssistant`, `healthCoach`, `financialAdvisor`, `learningTutor`, `googleAuth`
- Update functions: `updatePersonalAssistant()`, `updateHealthCoach()`, `updateFinancial()`, `updateLearning()`
- All updates trigger auto-save with sync status indicator

### Google OAuth Integration
Backend API routes in `api/` directory (serverless functions):
- `api/auth/login.js` - Initiates OAuth flow with Google scopes (calendar.readonly, gmail.readonly, gmail.send)
- `api/auth/callback.js` - Handles OAuth callback, exchanges code for tokens
- `api/auth/refresh.js` - Refreshes expired access tokens
- `api/google/calendar.js` - Fetches calendar events
- `api/google/emails.js` - Lists recent emails (max 20, fetches metadata for 10)
- `api/google/email-detail.js` - Fetches full email content by ID
- `api/google/send.js` - Sends emails via Gmail API

OAuth flow:
1. User clicks "Connect Google" → calls `googleLogin()` → redirects to `/api/auth/login`
2. Login endpoint redirects to Google OAuth with required scopes
3. Google redirects back to `/api/auth/callback`
4. Callback exchanges code for tokens and redirects to app with base64-encoded auth data
5. Frontend parses URL params and stores tokens in `googleAuth` state
6. `getValidAccessToken()` automatically refreshes tokens when needed (5min buffer before expiry)

### Health Data Structure
Health logs stored in nested object by date:
```javascript
dailyLogs: {
  "2024-11-27": [
    { type: 'water', value: 2, timestamp: '...', notes: '...' },
    { type: 'sleep', value: 8, timestamp: '...' },
    { type: 'exercise', value: 30, timestamp: '...' },
    { type: 'meal', value: 'Breakfast...', timestamp: '...' }
  ]
}
```

Types: `water` (glasses), `sleep` (hours), `exercise` (minutes), `meal` (text), `weight` (lbs/kg)

Goals auto-tracked: When health metrics are logged, corresponding goals update their progress automatically via the `autoTracked` flag and `trackingType` field.

### AI Chat Implementation
Both Personal Assistant and Health Coach use simulated AI via pattern matching:
- `generateAIResponse(message, preferences, context)` - Personal Assistant (line 1460)
- `generateHealthResponse(message, healthData, todayLogs)` - Health Coach (line 3109)

Messages stored in `chatHistory` array within each agent's data object. Chat interfaces render via `ChatInterface` component (line 2031).

### Data Export/Import
- Export: Generates JSON or CSV from health logs via `ExportDataModal` (line 3292)
- Import: Parses JSON/CSV and merges into existing data via `ImportDataModal` (line 3457)

## Important Patterns

### Adding New Goals
Goals are stored in agent data with structure:
```javascript
{ id: number, title: string, description: string, progress: number, completed: boolean }
```
Health goals also have: `autoTracked: boolean, trackingType: string, target: number`

### Modal Management
All modals use the base `Modal` component with `isOpen`, `onClose`, `title` props. Use state flags like `showAddGoal`, `showEditGoal` to control visibility.

### Environment Variables
Required for Google OAuth (set in Vercel):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

### Date Handling
Use `getLocalDateKey(date)` helper for consistent date keys in health logs:
```javascript
const getLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
```

### Component Conventions
- EmptyState placeholders use `EmptyState` component (line 903)
- Toast notifications via `Toast` component (line 932) with auto-dismiss
- Tab navigation uses `TabBar` component (line 1437)
- Section headers use `SectionHeader` component (line 1420)

## Tech Stack
- React 18 with hooks (useState, useEffect, useCallback, useContext, useRef)
- Vite for build/dev server
- Tailwind CSS for styling
- Recharts for data visualization (LineChart, BarChart, AreaChart)
- Lucide React for icons
- Vercel for deployment with serverless functions
