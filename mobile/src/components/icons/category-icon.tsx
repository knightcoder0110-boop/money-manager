import React from 'react';
import { type ColorValue } from 'react-native';
import {
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  CreditCard,
  Laptop,
  PiggyBank,
  TrendingUp,
  Heart,
  Users,
  Handshake,
  Pill,
  Coffee,
  Wallet,
  Wrench,
  RotateCcw,
  Gift,
  BarChart3,
  Banknote,
  CircleAlert,
  type LucideIcon,
} from 'lucide-react-native';

/** Maps Lucide icon key strings to components */
const KEY_ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  'utensils-crossed': UtensilsCrossed,
  car: Car,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  clapperboard: Clapperboard,
  'credit-card': CreditCard,
  laptop: Laptop,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  heart: Heart,
  users: Users,
  handshake: Handshake,
  pill: Pill,
  coffee: Coffee,
  wallet: Wallet,
  wrench: Wrench,
  'rotate-ccw': RotateCcw,
  gift: Gift,
  'bar-chart-3': BarChart3,
  banknote: Banknote,
};

/** Maps legacy emoji strings (currently in DB) to Lucide icon keys */
const EMOJI_TO_KEY: Record<string, string> = {
  '\u{1F3E0}': 'home',             // 🏠 Rent
  '\u{1F354}': 'utensils-crossed',  // 🍔 Food
  '\u{1F697}': 'car',              // 🚗 Transport
  '\u{1F6CD}\uFE0F': 'shopping-bag', // 🛍️ Shopping
  '\u{1F6CD}': 'shopping-bag',     // 🛍
  '\u{1F4F1}': 'receipt',          // 📱 Bills
  '\u{1F3AC}': 'clapperboard',     // 🎬 Entertainment
  '\u{1F4B3}': 'credit-card',      // 💳 Subscriptions
  '\u{1F4BB}': 'laptop',           // 💻 Professional
  '\u{1F3E6}': 'piggy-bank',       // 🏦 Savings
  '\u{1F4C8}': 'trending-up',      // 📈 Investments
  '\u2764\uFE0F': 'heart',         // ❤️ Girlfriend
  '\u2764': 'heart',               // ❤
  '\u{1F468}\u200D\u{1F469}\u200D\u{1F466}': 'users', // 👨‍👩‍👦 Family
  '\u{1F91D}': 'handshake',        // 🤝 Friends
  '\u{1F48A}': 'pill',             // 💊 Health
  '\u2615': 'coffee',              // ☕ Daily Small
  '\u{1F4B0}': 'wallet',           // 💰 Salary
  '\u{1F527}': 'wrench',           // 🔧 Freelance
  '\u21A9\uFE0F': 'rotate-ccw',    // ↩️ Refund
  '\u21A9': 'rotate-ccw',          // ↩
  '\u{1F381}': 'gift',             // 🎁 Gift Received
  '\u{1F4CA}': 'bar-chart-3',      // 📊 Returns
  '\u{1F4B5}': 'banknote',         // 💵 Other Income
};

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: ColorValue;
}

export function CategoryIcon({ icon, size = 20, color = 'currentColor' }: CategoryIconProps) {
  // 1. Try direct key lookup (new format)
  let IconComp: LucideIcon | undefined = KEY_ICON_MAP[icon];

  // 2. Try emoji → key mapping (backward compat)
  if (!IconComp) {
    const key = EMOJI_TO_KEY[icon];
    if (key) {
      IconComp = KEY_ICON_MAP[key];
    }
  }

  if (IconComp) {
    return <IconComp size={size} color={color as string} strokeWidth={2} />;
  }

  // 3. Fallback
  return <CircleAlert size={size} color={color as string} strokeWidth={2} />;
}
