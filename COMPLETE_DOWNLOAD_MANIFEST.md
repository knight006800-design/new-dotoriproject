# Complete Dotori-Route-Relay Repository Download

## Summary

Successfully fetched **78 files** from https://github.com/knight006800-design/dotori-route-relay

All files are now available in: `/tmp/cc-agent/67551018/project/repo-download/`

---

## File Directory Structure

```
repo-download/
├── Configuration Files (10)
│   ├── .gitignore
│   ├── .lovable/project.json
│   ├── .prettierignore
│   ├── .prettierrc
│   ├── bunfig.toml
│   ├── components.json
│   ├── eslint.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── src/
│   ├── components/ui/ (46 Shadcn UI Components)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   │
│   ├── hooks/ (1)
│   │   └── use-mobile.tsx
│   │
│   ├── lib/ (9)
│   │   ├── api/
│   │   │   └── example.functions.ts
│   │   ├── config.server.ts
│   │   ├── dotori-state.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── lovable-error-reporting.ts
│   │   ├── posts.ts
│   │   └── utils.ts
│   │
│   ├── routes/ (8)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── notifications.tsx
│   │   ├── post.$id.tsx
│   │   ├── profile.tsx
│   │   ├── signup.tsx
│   │   ├── support.tsx
│   │   └── README.md
│   │
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   ├── styles.css
│   └── routeTree.gen.ts
```

---

## Key Files Overview

### 1. **Configuration Files**

**package.json** - Project dependencies and scripts
- React 19.2.0
- TypeScript 5.8.3
- TanStack Start 1.167.50
- TanStack Router 1.168.25
- Tailwind CSS 4.2.1
- 46 Shadcn UI components via Radix UI
- Build tool: Vite 7.3.1

**tsconfig.json** - TypeScript configuration
- Target: ES2022
- Module resolution: Bundler
- Strict mode enabled
- Path aliases: @/* -> ./src/*

**vite.config.ts** - Vite build configuration
- Uses @lovable.dev/vite-tanstack-config
- Includes TanStack Start, React, Tailwind, Nitro

**components.json** - Shadcn UI configuration

**.prettierrc** - Code formatting rules

**eslint.config.js** - Linting rules

---

### 2. **Application State Management**

**src/lib/dotori-state.ts** - Client-side state (localStorage)
- Member profiles with vehicles
- Application status tracking
- Driver ratings and statistics
- Notification management

Key Types:
```typescript
- Vehicle (id, plate, model, verified)
- Member (name, phone, password, vehicles[], stats)
- AppStatus ("applied" | "approved" | "completed")
- Notification (with read status)
```

**src/lib/posts.ts** - Mock post data
- Sample delivery posts with details
- Product info, fees, delivery windows
- Special handling instructions

---

### 3. **Routing & Navigation**

**src/router.tsx** - Router setup
- TanStack Router configuration
- Query client initialization
- Scroll restoration

**src/routes/__root.tsx** - Root layout
- Global error boundary
- CSS injection
- 404 page component
- HTML structure

**Routes (File-based with TanStack Router):**
- `index.tsx` - Home / Post listing
- `profile.tsx` - User profile & vehicles
- `signup.tsx` - User registration
- `notifications.tsx` - Notification center
- `post.$id.tsx` - Dynamic post details
- `support.tsx` - Support page

---

### 4. **UI Components (46 Shadcn Components)**

All components are built on Radix UI with Tailwind CSS:

**Form Components:**
button, input, label, checkbox, radio-group, select, slider, switch, textarea, input-otp, toggle, toggle-group, form

**Layout Components:**
card, accordion, tabs, collapsible, breadcrumb, pagination, separator, scroll-area, resizable, sidebar

**Dialog/Overlay:**
dialog, alert-dialog, popover, hover-card, tooltip, drawer, dropdown-menu, context-menu, sheet, navigation-menu, command, menubar

**Data Display:**
table, calendar, carousel, badge, avatar, alert, progress, skeleton, chart, sonner

---

### 5. **Server Files**

**src/server.ts** - SSR server entry (wrapped for error handling)

**src/start.ts** - Start server entry

---

### 6. **Styles**

**src/styles.css** - Global styles with Tailwind CSS

---

## Project Information

**Type:** TanStack Start (React + Vite + Node.js server)

**Framework Stack:**
- React 19.2 with TypeScript 5.8
- TanStack Router 1.168 for file-based routing
- TanStack React Query 5.83 for data fetching
- Tailwind CSS 4.2.1 for styling
- Shadcn/UI for component library
- React Hook Form + Zod for forms

**Package Manager:** Bun (with fallback to npm)

**Build Tool:** Vite 7.3.1

**Server Framework:** Nitro 3.0 (for SSR)

---

## Application Features

1. **Delivery Post Listing** - Browse available delivery jobs
2. **Driver Management** - Register and manage vehicles
3. **Application System** - Apply for delivery jobs
4. **Notification System** - Real-time notifications
5. **Rating System** - Rate and review drivers
6. **User Authentication** - Sign up and profile management
7. **Support Page** - Customer support

---

## How to Use

1. Copy all files from `/tmp/cc-agent/67551018/project/repo-download/` to your local machine

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Build the project:
   ```bash
   bun run build
   ```

4. Run development server:
   ```bash
   bun run dev
   ```

---

## File Statistics

- **Total Files:** 78
- **Configuration:** 10 files
- **Source Code:** 68 files
  - UI Components: 46
  - Routes: 8
  - Lib files: 9
  - Hooks: 1
  - Server files: 2
  - Core files: 2

- **Total Size:** ~468 KB

---

## Repository

Original: https://github.com/knight006800-design/dotori-route-relay

Downloaded: June 5, 2026

All files are complete and ready for development.
