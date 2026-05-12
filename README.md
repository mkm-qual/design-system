# Design System Studio

An enterprise-grade design system management platform. Create and manage multiple design systems, edit design tokens live, upload custom fonts, browse icon libraries, and enforce UI Contracts that propagate token changes instantly across your entire project repository.

---

## Screenshots

| Dashboard | Studio Editor | Icon Browser |
|-----------|--------------|--------------|
| Multi-system overview with status badges | 5-panel token + component editor with live preview | Material Symbols & Fluent Icons from CDN |

---

## Features

### Design System Management
- Create and manage multiple design systems across organisations
- Per-system status: **Published**, **Draft**, **Archived**
- Edit name, description, organisation, and platform at any time
- Version tracking with unpublished change counters

### Studio Editor (5-panel layout)
- **Token Categories** — Seed tokens (Color, Size, Font, Line, Motion, Radius) and Derived/Map tokens
- **Token Editor** — Live color pickers, sliders, and text inputs; changes reflect in the preview instantly
- **Component List** — Full component catalogue grouped by category (General, Layout, Navigation, Data Entry, Data Display, Feedback)
- **Component Editor** — Per-component token overrides
- **Live Preview** — Buttons, alerts, tags, typography, form controls, progress bars, and tables all respond in real time to token changes

### Custom Font Upload
- Upload `.ttf`, `.otf`, `.woff`, and `.woff2` font files (up to 3 MB each)
- Set the CSS font-family name, weight, and style per file
- Fonts are injected via `@font-face` into the document immediately
- The preview pane applies custom fonts across all components as soon as a file is added
- Font files are stored as base64 in `localStorage` so they persist across page reloads

### Icon Browser
Fetches icons live from two industry-standard libraries:

| Library | Source | Count |
|---------|--------|-------|
| **Material Symbols** | Google Fonts CDN | 300+ icons in 12 categories |
| **Fluent System Icons** | Microsoft · jsDelivr CDN | 260+ icons |

- Search across both libraries in real time
- Click any icon to copy its name to the clipboard
- Organised by category (Material) or flat search (Fluent)

### UI Contracts
- Define contracts that link a set of token rules to a design system and target repository
- Each rule maps a token path (e.g. `seed.color.primaryColor`) to a value
- **Propagate Now** simulates propagating all rules across the entire codebase
- Propagation log shows timestamp, files modified, and screens updated
- Designed to scale to tens of thousands of screens

### Authentication & User Management
- JWT-style session stored in `localStorage`
- Three roles: **Admin**, **Editor**, **Viewer**
- Admins can add users, set roles, deactivate accounts, and reset passwords
- Profile settings and self-service password change

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/mkm-qual/design-system.git
cd design-system
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

### Default credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@dss.io` | `admin123` | Admin |

Change the admin password immediately after first login via **Settings → Password**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Routing | React Router v6 |
| Icons (app UI) | Lucide React |
| Icons (browser) | Google Material Symbols · Microsoft Fluent Icons |
| Persistence | localStorage (browser) |
| ID generation | uuid |

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── layout/        # AppShell (collapsible sidebar)
│   ├── studio/        # FontUploader, IconBrowser
│   └── ui/            # Button, Input/Select, Modal
├── lib/
│   ├── defaults.ts    # Seed token defaults and component catalogue
│   ├── storage.ts     # localStorage helpers
│   └── utils.ts       # cn(), formatDate(), hashPassword(), …
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudioPage.tsx
│   ├── ContractsPage.tsx
│   ├── UsersPage.tsx
│   └── SettingsPage.tsx
├── store/
│   ├── authStore.ts   # Auth, users, roles
│   └── dsStore.ts     # Design systems, tokens, fonts, contracts
└── types/
    └── index.ts       # All shared TypeScript types
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## Roadmap

- [ ] Backend API + PostgreSQL persistence
- [ ] Real codebase propagation via GitHub / GitLab webhooks
- [ ] Export design tokens as CSS custom properties, JSON, or Figma tokens
- [ ] Figma file import
- [ ] Team-level audit log
- [ ] Component screenshot diffing after token changes

---

## License

MIT
