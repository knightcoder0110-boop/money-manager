import { CircleAlert, type LucideIcon } from "lucide-react";
import { getIconByKey } from "./category-icons";

/**
 * Maps legacy emoji strings (currently stored in DB) to Lucide icon keys.
 * This allows existing data to render as SVG icons without a DB migration.
 */
const EMOJI_TO_KEY: Record<string, string> = {
  // Expense categories
  "\u{1F3E0}": "home",            // 🏠 Rent
  "\u{1F354}": "utensils-crossed", // 🍔 Food
  "\u{1F697}": "car",             // 🚗 Transport
  "\u{1F6CD}\uFE0F": "shopping-bag", // 🛍️ Shopping
  "\u{1F6CD}": "shopping-bag",    // 🛍 Shopping (without variation selector)
  "\u{1F4F1}": "receipt",         // 📱 Bills
  "\u{1F3AC}": "clapperboard",    // 🎬 Entertainment
  "\u{1F4B3}": "credit-card",     // 💳 Subscriptions
  "\u{1F4BB}": "laptop",          // 💻 Professional
  "\u{1F3E6}": "piggy-bank",      // 🏦 Savings
  "\u{1F4C8}": "trending-up",     // 📈 Investments
  "\u2764\uFE0F": "heart",        // ❤️ Girlfriend
  "\u2764": "heart",              // ❤ Girlfriend (without variation selector)
  "\u{1F468}\u200D\u{1F469}\u200D\u{1F466}": "users", // 👨‍👩‍👦 Family
  "\u{1F91D}": "handshake",       // 🤝 Friends
  "\u{1F48A}": "pill",            // 💊 Health
  "\u2615": "coffee",             // ☕ Daily Small

  // Income categories
  "\u{1F4B0}": "wallet",          // 💰 Salary
  "\u{1F527}": "wrench",          // 🔧 Freelance
  "\u21A9\uFE0F": "rotate-ccw",   // ↩️ Refund
  "\u21A9": "rotate-ccw",         // ↩ Refund (without variation selector)
  "\u{1F381}": "gift",            // 🎁 Gift Received
  "\u{1F4CA}": "bar-chart-3",     // 📊 Returns
  "\u{1F4B5}": "banknote",        // 💵 Other Income
};

interface CategoryIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, size = 20, className }: CategoryIconProps) {
  // 1. Try direct key lookup (new format: "home", "car", etc.)
  let IconComp: LucideIcon | undefined = getIconByKey(icon);

  // 2. Try emoji → key mapping (backward compat with existing DB data)
  if (!IconComp) {
    const key = EMOJI_TO_KEY[icon];
    if (key) {
      IconComp = getIconByKey(key);
    }
  }

  if (IconComp) {
    return <IconComp size={size} className={className} />;
  }

  // 3. Fallback: generic icon
  return <CircleAlert size={size} className={className} />;
}
