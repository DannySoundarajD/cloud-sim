# Frontend Learning & Implementation Guide

This guide walks you through the wireframe app’s concepts and how to implement them in the new `frontend/` project. Follow the steps in order to understand structure, state management, UI primitives, and page-level features.

## 0) Prerequisites
- Node + npm (via nvm): `nvm install --lts && nvm use --lts`
- From repo root: `cd /home/tinhc/CloudSim/frontend && npm install`

## 1) Run and Explore
- Start dev server: `npm run dev -- --host --port 5173` → open http://localhost:5173
- Keep the app running while you code so you can see changes live.

## 2) Project Structure (what to read first)
- `src/main.tsx`: React entry point; mounts `<App />`.
- `src/App.tsx`: App shell (header, tabs, modals) and top-level state.
- `src/contexts/UserContext.tsx`: Mock auth/user role context (login/logout).
- `src/components/`: Page components and UI building blocks.
- `src/styles/globals.css`, `src/index.css`: Global styles and utility classes.

## 3) App Shell & Navigation
- File: `src/App.tsx`
- Concepts: React state hooks, controlled Tabs, lifting state for modals.
- What to learn/implement:
  - Tabs for switching views (Dashboard, Details, Monitoring).
  - Buttons that open modals (Create Instance, IAM settings).
  - Passing callbacks to child components to change active tab (e.g., clicking an instance in Dashboard opens Details).

## 4) User Context & Login Modal
- Files: `src/contexts/UserContext.tsx`, `src/components/LoginModal.tsx`
- Concepts: React Context, provider pattern, controlled modal.
- What to learn/implement:
  - Create a `UserProvider` wrapping `<AppContent />`.
  - Expose `login`/`logout` via context and consume with `useUser()`.
  - Show the login modal when `user` is undefined; store username/role on login.

## 5) UI Primitives
- Folder: `src/components/ui/` (Button, Badge, Tabs, Table, Card, Progress, etc.)
- Concepts: Reusable presentational components (mostly Radix + styling).
- What to learn/implement:
  - Understand props and className composition.
  - Use these primitives instead of raw HTML to keep styling consistent.

## 6) Dashboard Page
- File: `src/components/DashboardPage.tsx`
- Concepts: Data mapping to UI, conditional styling, tables, badges.
- What to learn/implement:
  - Summary cards derived from a mock `instances` array.
  - A table listing instances with action buttons.
  - Alarm list and availability zone health with progress bars.
  - `onInstanceClick` prop triggers the Details tab in the parent.

## 7) Instance Details Page
- File: `src/components/InstanceDetailsPage.tsx`
- Concepts: Nested tabs, grouped metadata, action bar.
- What to learn/implement:
  - Header with status badge and action buttons (start/stop/reboot/terminate).
  - Quick info cards (type, AZ, IPs).
  - Inner tabs (Details/Security/Networking/Storage/Tags) with grids and tables.
  - Launching a config dialog (see ScalingConfigDialog) from an action button.

## 8) Monitoring Page
- File: `src/components/InstanceMonitoringPage.tsx`
- Concepts: Metrics layout and alerts.
- What to learn/implement:
  - Metrics sections with charts/placeholders and stat cards.
  - Recent alerts/alarms list.

## 9) Modals & Dialogs
- Files: `src/components/CreateInstanceModal.tsx`, `src/components/ScalingConfigDialog.tsx`, `src/components/IAMPanel.tsx`
- Concepts: Controlled dialogs, form controls, role toggles.
- What to learn/implement:
  - Props: `open`, `onOpenChange` to control visibility from parent state.
  - Form inputs/selects/sliders for instance creation and scaling config.
  - IAM panel to manage roles/users (mocked).

## 10) Styling & Theming
- Files: `src/styles/globals.css`, `src/index.css`
- Concepts: Global styles, utility classes, consistent spacing/typography.
- What to learn/implement:
  - Ensure Tailwind-like utility classes or custom styles are applied globally.
  - Keep cards/tables/tabs visually consistent by reusing shared classes.

## 11) Quality Checks
- Lint: `npm run lint`
- Tests (if present): `npm run test` or `npm run test -- --watch`
- Build: `npm run build` (emits `dist/` for deployment)

## 12) Deployment (static hosting)
- Build the app: `npm run build`
- Deploy `dist/` to a static host (Netlify, Vercel with output dir `dist`, or any static server like `npx serve dist`).
- After deploy, smoke test the main flows: login modal, tab switching, modals open/close, cards/tables render.

## Suggested Learning Order
1) App shell (App.tsx) + User context/login
2) UI primitives (components/ui/*)
3) Dashboard page
4) Instance details page
5) Monitoring page
6) Modals/dialogs (create instance, scaling, IAM)
7) Styling polish + quality checks + build/deploy

As you finish each step, run the app (`npm run dev`) and interact with the feature you just built to reinforce the concept. Document takeaways in `frontend/README.md` as you go.
