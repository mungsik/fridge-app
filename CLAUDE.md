# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

냉장고 관리 앱 (Refrigerator Management App) - A React single-page application for managing refrigerator inventory. Originated from a Figma Make bundle.

## Commands

```bash
npm i              # Install dependencies
npm run dev        # Start development server (Vite)
npm run build      # Build for production
```

Note: No linting or testing scripts are currently configured.

## Architecture

### Tech Stack
- **Framework:** React 18 + TypeScript + Vite 6
- **Styling:** Tailwind CSS 4 + shadcn/ui components + Radix UI primitives
- **Icons:** Lucide React + Material UI icons
- **Date handling:** date-fns
- **Notifications:** sonner (toasts)

### Project Structure
```
src/
├── main.tsx                    # React entry point
├── app/
│   ├── App.tsx                # Main component with state & business logic
│   ├── components/
│   │   ├── FridgeItemCard.tsx      # Item display card
│   │   ├── FridgeItemForm.tsx      # Add/edit form dialog
│   │   ├── NotificationBanner.tsx  # Expiry alerts
│   │   └── ui/                     # shadcn/ui components (40+)
│   └── types/
│       └── fridge.ts               # TypeScript interfaces
└── styles/
    ├── tailwind.css
    └── theme.css                   # CSS custom properties & design tokens
```

### Data Model
```typescript
interface FridgeItem {
  id: string;           // UUID
  name: string;
  quantity: number;
  expiryDate: string;   // ISO date format
  category: string;
  location: string;
  createdAt: string;    // ISO timestamp
}
```

### State Management
- Local state via React hooks (useState/useEffect)
- Data persisted to localStorage with key `fridge-items`
- No centralized state management library

### Path Alias
- `@` maps to `./src` (configured in vite.config.ts)

## Key Patterns

- **Component styling:** Tailwind utilities + `cn()` helper from `src/app/components/ui/utils.ts` (clsx + tailwind-merge)
- **Forms:** Dialog-based modal forms with controlled inputs
- **Dates:** ISO string format, date-fns for calculations
- **Responsive grid:** 1 col mobile, 2 col tablet, 3 col desktop

## Installed But Unused Libraries

These are available if needed:
- React Hook Form (form validation)
- react-dnd (drag & drop)
- next-themes (theme switching)
- Recharts (charting)
