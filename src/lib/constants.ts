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
