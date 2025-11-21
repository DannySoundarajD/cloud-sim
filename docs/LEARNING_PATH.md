# Learning Path — CloudSim Wireframes (Vite + React + TypeScript)

## Goal

Become confident reading, modifying, and extending the CloudSim wireframe app (Vite + React + TypeScript + CSS + UI primitives + Figma assets).

## Suggested durations

- Self-paced: 4–6 weeks (4–8 hours/week)
- Intensive: 2–3 weeks full-time

## Prerequisites

- Basic programming experience (variables, functions)
- Familiarity with HTML & CSS
- Node.js + npm installed

## Core Modules

### Module 1 — Project Orientation (1 session)
- Objective: Understand repo layout and dev workflow.
- Key topics: `index.html`, `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.
- Outcome: Run the app locally and identify core components.

### Module 2 — TypeScript + React Fundamentals (2–3 sessions)
- Objective: Safely read and change .tsx files.
- Key topics: props & state typing, interfaces, JSX, hooks (`useState`, `useEffect`), functional components, custom hooks.
- Repo focus: `src/components/*`, `src/contexts/UserContext.tsx`.

### Module 3 — Component Library & UI Primitives (2 sessions)
- Objective: Learn shared primitives and composition patterns.
- Key topics: API surface of primitives, variants, accessibility, composition.
- Repo focus: `src/components/ui/*`, `src/styles/globals.css`.

### Module 4 — Styling & Responsive Layout (1–2 sessions)
- Objective: Read and extend global CSS and responsive layout.
- Key topics: global CSS tokens, utility classes, responsive breakpoints, `ImageWithFallback.tsx` pattern.
- Repo focus: `src/styles/globals.css`, `src/components/figma/ImageWithFallback.tsx`.

### Module 5 — State Management & Context (1–2 sessions)
- Objective: Use and extend `UserContext` safely.
- Key topics: Context provider patterns, consumer hooks, lifting state.
- Repo focus: `src/contexts/UserContext.tsx`, components consuming it (e.g., `IAMPanel.tsx`).

### Module 6 — Forms, Modals & Dialogs (1–2 sessions)
- Objective: Implement and validate interactive forms and modal UX.
- Key topics: controlled inputs, validation, focus management in dialogs.
- Repo focus: `CreateInstanceModal.tsx`, `LoginModal.tsx`, `ScalingConfigDialog.tsx`.

### Module 7 — Integrations & Mock APIs (1–2 sessions)
- Objective: Connect UI to mock data and handle async states.
- Key topics: fetch/axios, mocking responses, loading & error states, optimistic updates.
- Repo focus: `InstanceMonitoringPage.tsx`, dashboard lists.

### Module 8 — Testing & Quality (optional, 2 sessions)
- Objective: Add Jest/Testing Library tests for critical components.
- Key topics: unit tests for hooks, component interaction tests, accessibility checks.

### Module 9 — Capstone Project (2–4 sessions)
- Objective: Deliver a production-ready feature: search+filter/pagination, dark mode, or a monitoring chart.
- Deliverable: PR-ready branch with README and tests.

## Quickstart (run locally)

```bash
npm install
npm run dev
```

## Build & production

```bash
npm run build
```

## Files to read first (guided tour)

- `index.html` — app entry
- `package.json` — scripts & deps
- `vite.config.ts` — tooling
- `src/main.tsx`, `src/App.tsx` — bootstrap
- `src/components/*` — feature UI
- `src/components/ui/*` — primitives
- `src/contexts/UserContext.tsx` — app-wide state
- `src/styles/globals.css` — design tokens

## Recommended external resources

- TypeScript handbook: https://www.typescriptlang.org/docs/
- React Docs (Hooks & Context): https://reactjs.org/docs/
- Vite Guide: https://vitejs.dev/guide/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro
- Figma basics: https://www.figma.com/resources/learn-design/

## Next steps

- Use `docs/EXERCISES.md` for hands-on tasks. Ask me to expand any module into a detailed lesson, checklist, or slide deck.
