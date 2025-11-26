# Frontend Learning & Implementation Guide

This guide teaches the wireframe app by rebuilding its shell in `frontend/`, with explicit code actions and why they matter in React + Vite. Use your existing modern toolchain (React 19, Vite 7 from the scaffold) and pull in the UI libraries the wireframe relies on.

## 0) Prerequisites (Vite + React wiring)
- Vite expects an `index.html` with a root element (e.g., `<div id="root">`); React mounts into it via `createRoot`.
- Node + npm via nvm: `nvm install --lts && nvm use --lts`
- Workdir: `cd /home/tinhc/CloudSim/frontend`

## 1) Align dependencies (latest, matching the scaffold)
- Concept: Components rely on UI libs (Radix, lucide-react, etc.); keep React/Vite at your scaffold’s versions (React 19, Vite 7) while adding the needed UI packages.
- Action (edit `frontend/package.json`):
  - Keep existing React/Vite versions.
  - Add needed UI deps (latest compatible): `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-avatar`, `@radix-ui/react-progress`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, plus any others referenced in the wireframe (Radix dropdown, popover, hover-card, tooltip, slider, switch, checkbox, radio-group, table/scroll-area). You can copy the wireframe deps list, but keep React 19 and let npm resolve latest minor/patch for those packages.
  - Install: `npm install`
- Why: Ensures the shared UI primitives compile against current React/Vite.

## 2) Entry point (React mount + global styles)
- Concept: `main.tsx` mounts the app and pulls CSS; Vite injects the bundle into `index.html`.
- Action (`frontend/src/main.tsx`):
  ```ts
  import { createRoot } from "react-dom/client";
  import { StrictMode } from 'react'
  import App from "./App";
  import "./index.css";

  createRoot(document.getElementById("root")!).render( <StrictMode><App /> </StrictMode>);
  ```
- Why: Hooks React into the DOM container and applies global styles once.

## 3) Global styles
- Concept: Shared utility classes and base styling used across components.
- Action: Copy `EC2 Instance Management Wireframes/src/index.css` into `frontend/src/index.css` (overwrite). If there is a `styles/globals.css`, bring it into `src/styles/globals.css` and import it from `index.css` if needed.
- Why: Ensures the UI primitives and pages render with the intended spacing/typography.

## 4) UI primitives (build blocks for shell)
- Concept: Composition and consistent styling via shared components rather than raw HTML.
- Action: Copy `EC2 Instance Management Wireframes/src/components/ui` into `frontend/src/components/ui`.
- Why: `App.tsx` and child pages import Tabs, Button, Badge, Table, Progress, etc. from here.

## 5) User context (mock auth) and login modal
- Concept: Global state via React Context; controlled modal for authentication.
- Actions:
  - Copy `EC2 Instance Management Wireframes/src/contexts/UserContext.tsx` to `frontend/src/contexts/UserContext.tsx`.
  - Copy `EC2 Instance Management Wireframes/src/components/LoginModal.tsx` to `frontend/src/components/LoginModal.tsx`.
- Why: `App` uses `useUser()` to gate access and display username/role; login modal sets the context state.

## 6) Core shell components
- Concept: App chrome (header/nav) and supporting modals.
- Actions (copy into `frontend/src/components/`):
  - `CloudSimLogo.tsx` (brand)
  - `IAMPanel.tsx` (settings/roles dialog)
  - `CreateInstanceModal.tsx` (launch button target)
  - Pages: `DashboardPage.tsx`, `InstanceDetailsPage.tsx`, `InstanceMonitoringPage.tsx`
  - `ScalingConfigDialog.tsx` (used inside Instance Details)
- Why: These are directly referenced by the app shell.

## 7) Implement the app shell (App.tsx)
- Concept: Top-level state + controlled navigation and dialogs.
- Action (replace `frontend/src/App.tsx` with the wireframe version):
  ```tsx
  import { useState } from "react";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
  import { Button } from "./components/ui/button";
  import { Badge } from "./components/ui/badge";
  import { Plus, Settings, LogOut, User } from "lucide-react";
  import { CreateInstanceModal } from "./components/CreateInstanceModal";
  import { DashboardPage } from "./components/DashboardPage";
  import { InstanceDetailsPage } from "./components/InstanceDetailsPage";
  import { InstanceMonitoringPage } from "./components/InstanceMonitoringPage";
  import { CloudSimLogo } from "./components/CloudSimLogo";
  import { LoginModal } from "./components/LoginModal";
  import { IAMPanel } from "./components/IAMPanel";
  import { UserProvider, useUser, UserRole } from "./contexts/UserContext";

  function AppContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isIAMPanelOpen, setIsIAMPanelOpen] = useState(false);
    const { user, login, logout } = useUser();

    const handleInstanceClick = () => setActiveTab("details");
    const handleLogin = (username: string, role: UserRole) => login(username, role);
    const handleLogout = () => { logout(); setActiveTab("dashboard"); };

    if (!user) return <LoginModal open={true} onLogin={handleLogin} />;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            <CloudSimLogo />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">{user.username}</span>
                <Badge variant="outline" className="ml-1">{user.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsIAMPanelOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> IAM & Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="details">Instance Details</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" /> Launch Instance
              </Button>
            </div>

            <TabsContent value="dashboard">
              <DashboardPage onInstanceClick={handleInstanceClick} />
            </TabsContent>
            <TabsContent value="details">
              <div className="bg-white rounded-lg border p-8">
                <InstanceDetailsPage />
              </div>
            </TabsContent>
            <TabsContent value="monitoring">
              <div className="bg-white rounded-lg border p-8">
                <InstanceMonitoringPage />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <CreateInstanceModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        <IAMPanel open={isIAMPanelOpen} onOpenChange={setIsIAMPanelOpen} />
      </div>
    );
  }

  export default function App() {
    return (
      <UserProvider>
        <AppContent />
      </UserProvider>
    );
  }
  ```
- Why (concept mapping):
  - Controlled tabs: parent holds `activeTab` and passes `onValueChange`.
  - Controlled modals: parent owns `isModalOpen`/`isIAMPanelOpen`, passes `open`/`onOpenChange`.
  - Context: `UserProvider` supplies `user`, `login`, `logout` to any component.
  - State lifting: child (Dashboard) notifies parent to switch tabs via `onInstanceClick`.

## 8) Verify imports/paths
- Concept: Correct module resolution keeps build fast and predictable.
- Action: Ensure all imports in `App.tsx` point to `./components/...` and `./contexts/UserContext`, and UI primitives come from `./components/ui/...`.

## 9) Run and observe
- Concept: Dev server + HMR for tight feedback.
- Commands: `npm run dev -- --host --port 5173`
- In browser:
  - Login modal appears first; submit to set context.
  - Tabs switch content; Launch Instance/IAM buttons open their dialogs; Logout returns to the login modal.

## 10) Quality checks
- Lint: `npm run lint`
- Build: `npm run build`
- Why: Ensures imports/types are sound and the shell bundles correctly.

## 11) Deployment (later)
- Build output: `dist/` via `npm run build`.
- Host on any static provider (Netlify, Vercel with output dir `dist`, or `npx serve dist`).
- Smoke test: login, tab switching, modals, and page renders.

## Suggested learning order (with mapping)
1) Entry + CSS (main.tsx/index.css) → React mount + Vite asset flow.
2) UI primitives → composition and styling conventions.
3) User context + Login modal → Context API + controlled modals.
4) App shell (App.tsx) → state lifting, navigation, header controls.
5) Pages (Dashboard, Details, Monitoring) → data-to-UI mapping, nested tabs.
6) Modals/dialogs (Create, IAM, Scaling) → controlled dialogs, form elements.
7) Quality checks + build → lint/build pipeline confidence.

As you complete each step, keep the dev server running and interact with the feature you just wired to reinforce how the React state, context, and Vite bundling come together. Document notes in `frontend/README.md` as you learn.***
