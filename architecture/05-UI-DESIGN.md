# UI Design Spec

## Design Principles
- **Mobile-first** — designed for phone screen, works great on desktop too
- **Speed of entry** — adding an expense should take under 10 seconds
- **Honest numbers** — balance always visible, no hiding from reality
- **Minimal clicks** — most common action (add expense) is 1 tap away from any screen

## Theme

### Colors
```
--background:     #09090B   (zinc-950)
--foreground:     #FAFAFA   (zinc-50)
--card:           #18181B   (zinc-900)
--card-foreground: #FAFAFA
--primary:        #3B82F6   (blue-500)
--primary-foreground: #FFFFFF
--destructive:    #EF4444   (red-500)
--success:        #22C55E   (green-500)
--warning:        #F59E0B   (amber-500)
--muted:          #27272A   (zinc-800)
--muted-foreground: #A1A1AA (zinc-400)
--border:         #27272A   (zinc-800)
--ring:           #3B82F6   (blue-500)
```

Dark mode by default (it's a finance app, dark is easier on eyes). Light mode is not a priority.

### Budget Mode Override
When budget mode is active:
```
--primary:        #EF4444   (red-500) — everything turns urgent
--budget-banner:  #991B1B   (red-900 bg with red-500 text)
```

### Font
- System font stack (`font-sans` in Tailwind)
- Amounts: `font-mono` with `tabular-nums` for clean number alignment

### Radius
- `border-radius: 12px` for cards
- `border-radius: 8px` for buttons and inputs

---

## Layout

### Mobile (< 768px)
```
┌─────────────────────┐
│      Header          │  ← Balance + budget mode indicator
│─────────────────────│
│                      │
│      Page Content    │  ← Scrollable
│                      │
│                      │
│─────────────────────│
│  🏠  📊  ➕  📅  ⚙️  │  ← Bottom nav (5 items)
└─────────────────────┘
         ↑
    The ➕ is larger, center, primary color (FAB-style in nav)
```

Bottom nav items:
1. **Home** — Dashboard
2. **Stats** — Monthly breakdown
3. **Add** — Add expense/income (center, prominent)
4. **Daily** — Daily log
5. **More** — Events, Analytics, Settings (sub-menu)

### Desktop (>= 768px)
```
┌──────┬──────────────────┐
│      │                   │
│ Side │   Page Content    │
│ Nav  │                   │
│      │                   │
│      │                   │
└──────┴──────────────────┘
```

Sidebar nav with all links visible. Same pages, just more room.

---

## Screen Specs

### Dashboard (`/`)
```
┌─────────────────────┐
│  ₹12,450            │  ← Big balance number
│  Current Balance     │
│  [🔴 BUDGET MODE ON]│  ← Only when active
├─────────────────────┤
│ Today     │ This Month│
│ ₹450 ↓   │ ₹18,200 ↓│  ← Expense amounts
│ ₹0 ↑     │ ₹50,000 ↑│  ← Income amounts
├─────────────────────┤
│ Category Breakdown   │  ← Horizontal scrollable chips or small pie
│ 🍔 ₹5.2K  🚗 ₹3.1K │
│ 🛍️ ₹2.8K  📱 ₹1.5K │
├─────────────────────┤
│ Recent Transactions  │
│ ┌─ Swiggy      -₹320│
│ │  Food > Order In   │
│ │  Unnecessary  Today│
│ ├─ Auto         -₹80│
│ │  Transport > Cab   │
│ │  Necessary   Today │
│ └─ Salary    +₹50000│
│    Income    Jan 1   │
└─────────────────────┘
```

### Add Expense/Income (`/add`)
```
┌─────────────────────┐
│  [Expense] [Income]  │  ← Toggle tabs
├─────────────────────┤
│                      │
│      ₹ 0             │  ← Big number input, tap to type
│                      │
├─────────────────────┤
│  Select Category     │  ← Grid of category icons+names
│  🏠 Rent  🍔 Food   │
│  🚗 Trans 🛍️ Shop   │
│  📱 Bills 🎬 Ent    │
│  ...                 │
├─────────────────────┤
│  Subcategory ▼       │  ← Dropdown, appears after category pick
├─────────────────────┤
│  [Necessary] [Unnecessary] [Debatable] │  ← 3 buttons
├─────────────────────┤
│  📝 Add a note...    │  ← Optional text input
│  📅 Today ▼          │  ← Date picker, defaults today
│  🎪 Link to Event ▼  │  ← Optional event picker
├─────────────────────┤
│  [ Save Expense ]     │  ← Big primary button
└─────────────────────┘
```

When budget mode is active and category is non-essential:
```
┌─────────────────────┐
│  ⚠️ BUDGET MODE      │
│  You're about to     │
│  spend on Shopping   │
│  (non-essential)     │
│                      │
│  Are you sure?       │
│                      │
│  [Cancel] [Yes, Add] │
└─────────────────────┘
```

### Transaction List (`/transactions`)
```
┌─────────────────────┐
│ Transactions         │
│ [All▼] [Category▼] [Necessity▼] │  ← Filters
│ [Date range: This Month ▼]       │
├─────────────────────┤
│ Jan 15, 2025         │  ← Date group header
│ ┌─ Groceries   -₹850│
│ │  Food        Neces.│
│ ├─ Netflix     -₹199│
│ │  Subs       Unnec. │
│ Jan 14, 2025         │
│ ├─ Auto        -₹120│
│ │  Transport   Neces.│
│ ...                  │
└─────────────────────┘
```

Tapping a transaction opens edit mode (same form as add, prefilled).

### Monthly Breakdown (`/monthly`)
```
┌─────────────────────┐
│  January 2025  [< >] │  ← Month selector
├─────────────────────┤
│ Income     ₹50,000   │
│ Expenses   ₹38,200   │
│ Saved      ₹11,800   │
├─────────────────────┤
│  [PIE CHART]         │  ← Category-wise expense breakdown
│                      │
├─────────────────────┤
│ Necessary   ₹22,000  │  ██████████░░  58%
│ Unnecessary ₹12,500  │  ███████░░░░░  33%
│ Debatable    ₹3,700  │  ██░░░░░░░░░░   9%
├─────────────────────┤
│ 💡 If you cut ALL    │
│ unnecessary spending,│
│ you'd save ₹12,500   │
│ extra this month.    │
├─────────────────────┤
│ Top Categories       │
│ 🍔 Food      ₹8,200 │  ████████░░░░
│ 🏠 Rent      ₹7,000 │  ███████░░░░░
│ ❤️ Girlfriend ₹5,500 │  █████░░░░░░░
│ ...                  │
└─────────────────────┘
```

### Daily Log (`/daily`)
```
┌─────────────────────┐
│  January 2025        │
│  [Calendar Grid]     │
│  Mo Tu We Th Fr Sa Su│
│   1  2  3  4  5  6  7│  ← Each day shows a dot if has expenses
│   8  9 10 11 12 13 14│     Color: green < ₹500, yellow < ₹1000, red > ₹1000
│  ...                 │
├─────────────────────┤
│  Jan 15 — ₹1,280     │  ← Selected day detail
│  ┌─ Groceries   ₹850│
│  │  Necessary        │
│  ├─ Chai ×2     ₹40 │
│  │  Daily Small      │
│  ├─ Auto        ₹120│
│  │  Necessary        │
│  └─ Snacks      ₹270│
│     Unnecessary      │
└─────────────────────┘
```

### Events (`/events`)
```
List view:
┌─────────────────────┐
│ Events  [+ New]      │
├─────────────────────┤
│ 🏖️ Goa Trip          │
│ Jan 20-22 · ₹12,500 │
│ Food ₹4K Transport ₹3K│
├─────────────────────┤
│ 🎂 Rohan's Birthday  │
│ Jan 18 · ₹2,800     │
│ Food ₹1.5K Gift ₹1.3K│
└─────────────────────┘

Detail view (/events/[id]):
┌─────────────────────┐
│ ← Goa Trip           │
│ Jan 20-22, 2025      │
│ Total: ₹12,500       │
├─────────────────────┤
│ Breakdown            │
│ 🍔 Food      ₹4,200 │  ████████░░░░
│ 🚗 Transport ₹3,100 │  ██████░░░░░░
│ 🛍️ Shopping  ₹2,800 │  █████░░░░░░░
│ 🎬 Activity  ₹2,400 │  ████░░░░░░░░
├─────────────────────┤
│ All Expenses         │
│ ┌─ Hotel       ₹3000│
│ ├─ Cab to Goa  ₹2100│
│ ├─ Dinner      ₹1800│
│ ...                  │
└─────────────────────┘
```

---

## Component Interaction Patterns

### Toast Notifications
- Success: "Expense added ✓" (auto-dismiss 2s)
- Error: "Failed to save. Try again." (stays until dismissed)
- Use shadcn/ui `sonner` toast

### Loading States
- Skeleton loaders for cards and lists (not spinners)
- Button loading state: disabled + spinner inside button

### Empty States
- "No transactions yet. Add your first expense!" with CTA button
- "No events created. Plan your next trip!" with CTA button

### Confirm Dialogs
- Delete transaction: "Delete this expense of ₹320?"
- Delete category: "This will remove the category and all subcategories. Transactions won't be deleted but will lose their category. Continue?"
- Budget mode warning: friction dialog as shown above

### Number Input
- On mobile: opens numeric keyboard (`inputMode="decimal"`)
- Format with commas as you type (₹1,23,456 — Indian numbering)
- No negative numbers allowed (type field handles direction)
