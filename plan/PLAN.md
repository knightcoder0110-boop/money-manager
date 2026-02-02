# Money Manager - The Plan

## What This Is

A personal finance tracker built for one person: you. No multi-user nonsense, no complex auth flows. Just a sharp, honest tool that shows you exactly where every rupee goes and forces you to confront your spending habits.

---

## Core Philosophy

1. **Every penny is accounted for** - nothing slips through
2. **Brutal honesty** - every expense is tagged necessary/unnecessary, no hiding from yourself
3. **Two mental states** - Normal mode (track everything) and Budget mode (war mode, only essentials)
4. **Breakdowns all the way down** - categories, subcategories, and event-level breakdowns
5. **Build incrementally** - usable at every stage, not a big bang release

---

## The Data Model (How Things Are Organized)

### Financial Position
- Your current balance (positive or negative)
- Updated automatically as you log income/expenses
- A clear number staring at you every time you open the app

### Categories & Subcategories

Main categories with default subcategories (you can always add more):

| Category | Subcategories |
|----------|--------------|
| **Rent** | rent, maintenance, society charges |
| **Food** | groceries, eating out, ordering in, tea/snacks, water |
| **Transport** | auto/cab, fuel, metro, bus, parking |
| **Shopping** | clothes, electronics, household items, personal care |
| **Bills** | electricity, wifi, phone recharge, gas |
| **Entertainment** | movies, outings, games, events |
| **Subscriptions** | claude, gemini, netflix, spotify, other tools |
| **Professional** | hosting, domains, courses, software, tools |
| **Savings** | fixed deposit, emergency fund, general savings |
| **Investments** | stocks, mutual funds, crypto, other |
| **Girlfriend** | food, gifts, travel, activities, miscellaneous |
| **Family** | money sent home, gifts, travel |
| **Friends** | lending, outings, gifts |
| **Health** | medicines, doctor, gym, supplements |
| **Daily Small** | chai, cigarettes, snacks, random small buys |

You should be able to **add/edit/delete** categories and subcategories anytime.

### The Necessity Tag (Non-Negotiable)

Every single expense gets one of these:
- **Necessary** - you genuinely needed this (rent, groceries, medicine)
- **Unnecessary** - you could have survived without it (that extra ordering in, impulse shopping)
- **Debatable** - gray area, but you're being honest with yourself

This is the learning engine. At month end, you see: "You spent X on unnecessary things. If you cut all of it, you'd save X."

### Events / Trips (The Breakdown Feature)

An "Event" is a container for related expenses. Examples:
- "Weekend trip with girlfriend - Jan 15-16"
- "Friends' birthday party"
- "Family visit"

Each event:
- Has a name, date range, and optional description
- Contains individual expenses (each with category, subcategory, amount, necessity tag)
- Shows a total and a breakdown
- These expenses ALSO count toward your main category totals (no double counting confusion - an event is just a grouping lens)

### Income Tracking
- Salary, freelance, refunds, gifts received, returns on investments
- Each income entry: amount, source, date, note

---

## The Two Modes

### Normal Mode
- Track everything freely
- All categories available
- Full dashboard with all breakdowns
- The default state

### Budget Mode (War Mode)
- You toggle this ON when money is tight or you want discipline
- A visual indicator that you're in war mode (red theme / banner)
- When adding an expense, if the category is flagged as "non-essential" (entertainment, shopping, girlfriend gifts, etc.), you get a friction screen: "You're in BUDGET MODE. Is this really necessary?"
- Dashboard shows only: rent, food (groceries only), bills, transport, health
- A daily budget limit you set when entering budget mode
- Shows remaining daily budget prominently
- Summary of "money saved by being in budget mode" vs your normal spending pattern

You define which categories are "essential" and which are "non-essential" in settings.

---

## Screens / Views

### 1. Dashboard (Home)
- Current balance (big, bold, in your face)
- Current mode indicator (Normal / Budget)
- Today's spending so far
- This month's spending vs income
- Quick-add expense button (most used action, must be instant)
- Recent transactions (last 5-10)

### 2. Add Expense (Must Be Fast)
- Amount (number pad, big)
- Category (tap to select from grid)
- Subcategory (tap to select)
- Necessary / Unnecessary / Debatable (three buttons)
- Note (optional, short text)
- Date (defaults to today)
- Link to Event (optional dropdown - "part of a trip/event?")
- Save. Done. Under 10 seconds for a simple entry.

### 3. Add Income
- Amount, source, date, note. Simple.

### 4. Monthly Breakdown
- Total income vs total expenses
- Category-wise pie chart / bar chart
- Necessary vs Unnecessary split (this is the killer view)
- "If you only spent on necessary items, you'd have saved X"
- List of all transactions, filterable

### 5. Category Deep Dive
- Pick a category, see all subcategory breakdowns
- Trend over months
- Necessary vs unnecessary within that category

### 6. Events View
- List of all events/trips
- Each event shows total cost and breakdown
- Tap into an event to see all expenses within it

### 7. Daily Log
- Calendar-style view
- Tap any day, see what you spent
- Good for tracking daily small expenses (chai, snacks)
- Daily total with necessary/unnecessary split

### 8. Analytics / Insights
- Monthly trends (spending going up or down?)
- Category trends over time
- Unnecessary spending trend (are you improving?)
- Top spending categories
- Average daily spend
- Budget mode effectiveness (when active)

### 9. Settings
- Edit categories / subcategories
- Set which categories are "essential" (for budget mode)
- Set monthly income expectation
- Set daily budget limit (for budget mode)
- Set initial balance
- Export data (CSV/JSON)

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js (App Router) | SSR, great mobile web experience, easy to host |
| **Styling** | Tailwind CSS | Fast, responsive, utility-first |
| **UI Components** | shadcn/ui | Clean, minimal, customizable |
| **Database** | SQLite via Turso (or local file) | Simple, no separate DB server needed, easy backup |
| **ORM** | Drizzle ORM | Type-safe, lightweight, works great with SQLite |
| **Charts** | Recharts | Simple, works with React |
| **Hosting** | Vercel (or any Node host) | Free tier, easy deploy |
| **Auth** | Simple password/PIN | Just you, no OAuth complexity. A PIN to open the app. |

This gives you:
- A responsive web app that works on mobile browser (add to home screen = feels like an app)
- No app store needed
- Easy to self-host
- Data is yours, no third-party analytics BS

---

## Build Phases (Step-Wise)

### Phase 1: Foundation (Start Here)
- Project setup (Next.js + Tailwind + shadcn/ui + Drizzle + SQLite)
- Database schema for: transactions, categories, subcategories
- Add expense form (amount, category, subcategory, necessary/unnecessary, note, date)
- Add income form
- Basic transaction list (recent first)
- Current balance display
- Mobile responsive from day 1

**After Phase 1: You can start using it immediately to log expenses.**

### Phase 2: Breakdowns & Insights
- Monthly breakdown view (category-wise)
- Necessary vs unnecessary split view
- "You could have saved X" calculation
- Category deep dive page
- Daily log / calendar view
- Basic charts (pie chart for categories, bar for necessary vs unnecessary)

### Phase 3: Events & Trips
- Create event/trip with date range
- Link expenses to events
- Event breakdown view
- Event list page

### Phase 4: Budget Mode
- Toggle budget mode on/off
- Set daily budget limit
- Essential vs non-essential category settings
- Friction screen for non-essential spending in budget mode
- Budget mode dashboard variant
- "Saved by budget mode" tracking

### Phase 5: Polish & Analytics
- Monthly trend charts
- Category trends over time
- Spending pattern insights
- Data export (CSV/JSON)
- PIN/password protection
- PWA setup (installable on phone home screen)
- Dark mode

---

## What Makes This Different From Generic Apps

1. **The Necessary/Unnecessary tag** - This is your learning engine. Most apps just track. This one makes you reflect on EVERY expense.
2. **Budget Mode** - Not just a budget number. An actual mental mode shift with friction for non-essentials.
3. **Event breakdowns** - "That weekend trip cost me 8000, of which 3000 was food, 2000 was travel, 1500 was gifts, 1500 was activities."
4. **Daily small expense tracking** - The chai money, the random snack. These add up and most people never track them.
5. **Built for one person** - No bloat. No sharing features. No social. Just you and your money.

---

## One Rule

Every rupee in. Every rupee out. No exceptions. The app is only as good as the data you feed it.
