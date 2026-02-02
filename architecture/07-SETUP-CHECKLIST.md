# Setup Checklist (Run Before Agents Start)

This is the shared foundation that must be in place before any of the 5 agents begin working. Done once, in order.

## Step 1: Initialize Next.js Project

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

## Step 2: Install Dependencies

```bash
pnpm add @supabase/supabase-js recharts sonner date-fns
pnpm add -D @types/node
```

## Step 3: Install shadcn/ui + Components

```bash
npx shadcn@latest init -d
```

Then install all needed components:
```bash
npx shadcn@latest add button card input label select dialog sheet badge calendar tabs toggle-group separator skeleton dropdown-menu popover avatar scroll-area tooltip textarea
```

Also install sonner separately for toasts:
```bash
npx shadcn@latest add sonner
```

## Step 4: Create Shared Files

### `src/types/index.ts`
Copy from `architecture/04-TYPES.md`

### `src/lib/supabase/server.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}
```

### `src/lib/supabase/client.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
```

### `src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol: string = "₹"): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
```

### `src/lib/constants.ts`
```typescript
export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Stats", href: "/monthly", icon: "BarChart3" },
  { label: "Add", href: "/add", icon: "Plus" },
  { label: "Daily", href: "/daily", icon: "Calendar" },
  { label: "More", href: "#more", icon: "Menu" },
] as const;

export const MORE_MENU_ITEMS = [
  { label: "Transactions", href: "/transactions", icon: "List" },
  { label: "Events", href: "/events", icon: "CalendarDays" },
  { label: "Categories", href: "/categories", icon: "Grid3x3" },
  { label: "Analytics", href: "/analytics", icon: "TrendingUp" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const NECESSITY_COLORS = {
  necessary: { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500" },
  unnecessary: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500" },
  debatable: { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500" },
} as const;

export const TRANSACTION_TYPE_COLORS = {
  expense: { text: "text-red-400", prefix: "-" },
  income: { text: "text-green-400", prefix: "+" },
} as const;
```

### `.env.example`
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### `src/app/layout.tsx`
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Money Manager",
  description: "Track every penny. Know where your money goes.",
  manifest: "/manifest.json",
  themeColor: "#09090B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

### Update `src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 9.4%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 9.4%;
    --popover-foreground: 0 0% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 217 91% 60%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Numeric inputs - no spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Mobile viewport fix */
body {
  min-height: 100dvh;
}
```

### `public/manifest.json`
```json
{
  "name": "Money Manager",
  "short_name": "Money",
  "description": "Track every penny",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090B",
  "theme_color": "#09090B",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Step 5: Supabase Project Setup

1. Go to https://supabase.com → New Project
2. Name: `money-manager`
3. Set a strong DB password
4. Region: closest to you (Mumbai for India)
5. Copy the project URL and keys into `.env.local`
6. Go to SQL Editor → run `001_initial_schema.sql`
7. Then run `002_seed_data.sql`

## Step 6: Verify

```bash
pnpm dev
```

App should start at localhost:3000 with a blank page (no content yet — agents will build it).

---

## After This Checklist

All 5 agents can now start working in parallel. Each agent has:
- A fully typed codebase to work in
- shadcn/ui components ready to use
- Supabase client configured
- Utility functions available
- Types defined and importable
- Clear file ownership (no conflicts)
