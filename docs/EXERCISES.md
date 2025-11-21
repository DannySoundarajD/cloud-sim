# Exercises — CloudSim Wireframes

This document contains progressive hands-on exercises aligned to the learning path. Each exercise lists estimated time, steps, and acceptance criteria.

Exercise A — Quick Start (15–30 min)
- Goal: Run the project locally and find the key UI elements.
- Steps:
  1. From repo root run `npm install`.
  2. Run `npm run dev` and open `http://localhost:5173`.
  3. Open `CreateInstanceModal.tsx` and `DashboardPage.tsx` in the editor.
- Acceptance:
  - Dev server starts without fatal errors.
  - Dashboard renders and the create instance modal opens.

Exercise B — Read & Explain (30–60 min)
- Goal: Read a component and document its flow.
- Steps:
  1. Open `src/components/DashboardPage.tsx`.
  2. Add inline comments explaining the main sections (data fetching, rendering, event handlers).
  3. Commit notes to a local branch.
- Acceptance:
  - You can explain how data flows from context to the rendered list.

Exercise C — Add a Region field (1–2 hours)
- Goal: Add a `Region` dropdown to `CreateInstanceModal` and pass the value to `InstanceDetailsPage`.
- Steps:
  1. Add a `region` field in the modal form as a controlled select.
  2. Pass `region` as part of the instance data object when creating an instance.
  3. Render region in `InstanceDetailsPage.tsx`.
- Acceptance:
  - Selected region is visible in instance details.
  - Form uses controlled inputs and validates selection.

Exercise D — UI Primitive Variant (1–2 hours)
- Goal: Add a `ghost` variant to `button.tsx` and use it in the UI.
- Steps:
  1. Extend the `button.tsx` props interface with `variant: 'default'|'ghost'|...`.
  2. Add matching styles in `globals.css` or the button file.
  3. Replace one call site with `variant="ghost"` and verify visuals.
- Acceptance:
  - `ghost` buttons render the new style.

Exercise E — Mock API integration (2–4 hours)
- Goal: Add a mock backend and connect the instance list to it.
- Steps:
  1. Add a small `src/mocks/instances.json` fixture.
  2. Create a `useInstances` hook that fetches the fixture (simulate latency with setTimeout or msw).
  3. Wire the dashboard to the hook and show loading/error states.
- Acceptance:
  - Dashboard loads mock data with a visible loading state.
  - Errors are handled and surfaced to the user.

Capstone ideas (4–16 hours)
- Add search + filters + pagination to `DashboardPage` (mock API + UI).
- Implement dark mode with a theme provider and persist preference in `localStorage`.
- Add a small monitoring chart in `InstanceMonitoringPage` using a lightweight charting library.

Commands and tips

Install dependencies:
```bash
npm install
```

Run dev server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Troubleshooting tips
- If dev server fails, check node version (`node -v`) and ensure dependencies installed.
- If TypeScript errors block compilation, run `npm run dev -- --no-check` temporarily to iterate; fix types before merging.

If you'd like, I can:
- Implement Exercise A now and verify the dev server runs in this environment.
- Create starter branches for any exercise and scaffold needed files (mock data, hooks).
