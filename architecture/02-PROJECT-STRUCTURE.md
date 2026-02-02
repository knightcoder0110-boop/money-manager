# Project Structure

```
money-manager/
├── architecture/              # You are here
├── plan/                      # Product plan
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (font, theme, providers)
│   │   ├── page.tsx           # Dashboard (home)
│   │   ├── globals.css        # Tailwind base + custom CSS vars
│   │   │
│   │   ├── add/
│   │   │   └── page.tsx       # Add expense/income page
│   │   │
│   │   ├── transactions/
│   │   │   └── page.tsx       # All transactions list with filters
│   │   │
│   │   ├── monthly/
│   │   │   └── page.tsx       # Monthly breakdown view
│   │   │
│   │   ├── categories/
│   │   │   ├── page.tsx       # Category overview / management
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Category deep dive
│   │   │
│   │   ├── daily/
│   │   │   └── page.tsx       # Daily log / calendar view
│   │   │
│   │   ├── events/
│   │   │   ├── page.tsx       # Events list
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Create event
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Event detail + breakdown
│   │   │
│   │   ├── analytics/
│   │   │   └── page.tsx       # Insights & trends
│   │   │
│   │   └── settings/
│   │       └── page.tsx       # App settings
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── app-shell.tsx       # Main app wrapper (header + nav + content)
│   │   │   ├── mobile-nav.tsx      # Bottom navigation bar (mobile)
│   │   │   ├── header.tsx          # Top bar (balance, budget mode indicator)
│   │   │   └── page-header.tsx     # Reusable page title + back button
│   │   │
│   │   ├── dashboard/
│   │   │   ├── balance-card.tsx         # Big balance display
│   │   │   ├── budget-mode-banner.tsx   # War mode indicator
│   │   │   ├── today-summary.tsx        # Today's spending
│   │   │   ├── month-summary.tsx        # This month income vs expense
│   │   │   ├── recent-transactions.tsx  # Last 5-10 transactions
│   │   │   └── quick-add-fab.tsx        # Floating action button
│   │   │
│   │   ├── transactions/
│   │   │   ├── transaction-form.tsx     # Add/Edit expense or income
│   │   │   ├── transaction-list.tsx     # Scrollable transaction list
│   │   │   ├── transaction-item.tsx     # Single transaction row
│   │   │   ├── transaction-filters.tsx  # Filter by date, category, necessity
│   │   │   ├── category-picker.tsx      # Grid of categories to pick from
│   │   │   ├── subcategory-picker.tsx   # Subcategory selection
│   │   │   └── necessity-toggle.tsx     # Necessary/Unnecessary/Debatable buttons
│   │   │
│   │   ├── charts/
│   │   │   ├── category-pie-chart.tsx   # Pie chart for category breakdown
│   │   │   ├── necessity-bar-chart.tsx  # Bar chart: necessary vs unnecessary
│   │   │   ├── monthly-trend-chart.tsx  # Line chart: spending over months
│   │   │   └── daily-bar-chart.tsx      # Bar chart: daily spending in a month
│   │   │
│   │   ├── events/
│   │   │   ├── event-form.tsx           # Create/edit event
│   │   │   ├── event-card.tsx           # Event summary card
│   │   │   └── event-breakdown.tsx      # Breakdown within an event
│   │   │
│   │   └── settings/
│   │       ├── category-manager.tsx     # Add/edit/delete categories
│   │       ├── budget-mode-settings.tsx # Configure budget mode
│   │       └── general-settings.tsx     # Currency, initial balance, etc.
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   └── server.ts          # Server-side Supabase client
│   │   │
│   │   ├── utils.ts               # General utilities (cn, formatCurrency, formatDate)
│   │   └── constants.ts           # App constants (default colors, necessity options)
│   │
│   ├── actions/                   # Next.js Server Actions (all DB operations)
│   │   ├── transactions.ts        # CRUD for transactions
│   │   ├── categories.ts          # CRUD for categories + subcategories
│   │   ├── events.ts              # CRUD for events
│   │   ├── settings.ts            # Read/update settings
│   │   ├── dashboard.ts           # Dashboard aggregation queries
│   │   └── analytics.ts           # Analytics / trends queries
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-budget-mode.ts     # Budget mode state
│   │   ├── use-categories.ts      # Fetch categories with caching
│   │   └── use-settings.ts        # Fetch/update settings
│   │
│   └── types/
│       └── index.ts               # TypeScript types matching DB schema
│
├── public/
│   ├── icons/                     # PWA icons
│   └── manifest.json              # PWA manifest
│
├── .env.local                     # Supabase keys (gitignored)
├── .env.example                   # Template for env vars
├── components.json                # shadcn/ui config
├── tailwind.config.ts             # Tailwind config
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── package.json
└── README.md
```

## Key Decisions

### Server Actions over API Routes
- All data mutations go through Next.js Server Actions in `src/actions/`
- No REST API layer needed — this is a single-user app, not a platform
- Server Actions are typed end-to-end, simpler than maintaining API routes
- Each action file maps to a domain: transactions, categories, events, settings

### Component Organization
- `components/ui/` — shadcn/ui primitives (don't modify these)
- `components/layout/` — app shell, navigation (shared across all pages)
- `components/{domain}/` — feature-specific components grouped by domain
- Each page in `app/` is thin — it just composes components and calls server actions

### Data Flow
```
Page (Server Component)
  → calls Server Action to fetch data
  → passes data to Client Components as props
  → Client Components handle interactivity
  → on mutation, Client Components call Server Actions
  → revalidatePath() refreshes the page data
```

### State Management
- No global state library (no Redux, no Zustand)
- Server state: fetched via Server Actions, cached by Next.js
- UI state: local React state (useState)
- Budget mode: fetched from settings, available via custom hook
- Use `revalidatePath()` after mutations to keep data fresh
