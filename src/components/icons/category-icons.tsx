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
  HeartPulse,
  Coffee,
  Wallet,
  Wrench,
  RotateCcw,
  Gift,
  BarChart3,
  Banknote,
  // Extra icons for the picker
  Plane,
  Bus,
  Fuel,
  Pill,
  Cigarette,
  Wine,
  Gamepad2,
  Music,
  Film,
  Dumbbell,
  Stethoscope,
  BookOpen,
  GraduationCap,
  Phone,
  Wifi,
  Zap,
  Flame,
  ShieldCheck,
  Building,
  Store,
  Shirt,
  Gem,
  Watch,
  Camera,
  Dog,
  Cat,
  Baby,
  Briefcase,
  Globe,
  MapPin,
  Umbrella,
  Key,
  Scissors,
  Truck,
  Train,
  Bike,
  Pizza,
  Apple,
  Utensils,
  CircleDollarSign,
  HandCoins,
  BadgeDollarSign,
  Sparkles,
  PartyPopper,
  Ticket,
  Tv,
  Headphones,
  Palette,
  Hammer,
  Package,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

/** Icon entry with metadata for the picker */
export interface IconEntry {
  key: string;
  label: string;
  icon: LucideIcon;
  tags: string[];
}

/**
 * Curated set of icons for a finance/money-manager app.
 * Organized by rough category for the icon picker.
 */
export const ICON_REGISTRY: IconEntry[] = [
  // Housing & Living
  { key: "home", label: "Home", icon: Home, tags: ["rent", "house", "living"] },
  { key: "building", label: "Building", icon: Building, tags: ["apartment", "office"] },
  { key: "key", label: "Key", icon: Key, tags: ["rent", "property"] },

  // Food & Drink
  { key: "utensils-crossed", label: "Fork & Knife", icon: UtensilsCrossed, tags: ["food", "dining", "eating"] },
  { key: "utensils", label: "Utensils", icon: Utensils, tags: ["food", "cooking"] },
  { key: "coffee", label: "Coffee", icon: Coffee, tags: ["chai", "tea", "daily", "cafe"] },
  { key: "pizza", label: "Pizza", icon: Pizza, tags: ["food", "snack", "ordering"] },
  { key: "apple", label: "Apple", icon: Apple, tags: ["groceries", "fruit", "healthy"] },
  { key: "wine", label: "Wine", icon: Wine, tags: ["drinks", "alcohol", "bar"] },

  // Transport
  { key: "car", label: "Car", icon: Car, tags: ["transport", "cab", "auto", "drive"] },
  { key: "bus", label: "Bus", icon: Bus, tags: ["transport", "public", "commute"] },
  { key: "train", label: "Train", icon: Train, tags: ["transport", "metro", "rail"] },
  { key: "bike", label: "Bike", icon: Bike, tags: ["transport", "cycle"] },
  { key: "plane", label: "Plane", icon: Plane, tags: ["travel", "flight", "trip"] },
  { key: "fuel", label: "Fuel", icon: Fuel, tags: ["petrol", "gas", "transport"] },
  { key: "truck", label: "Truck", icon: Truck, tags: ["delivery", "moving"] },

  // Shopping
  { key: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag, tags: ["shopping", "retail", "clothes"] },
  { key: "shirt", label: "Shirt", icon: Shirt, tags: ["clothes", "fashion", "shopping"] },
  { key: "gem", label: "Gem", icon: Gem, tags: ["jewelry", "luxury", "shopping"] },
  { key: "watch", label: "Watch", icon: Watch, tags: ["accessories", "luxury"] },
  { key: "store", label: "Store", icon: Store, tags: ["shop", "market", "retail"] },
  { key: "scissors", label: "Scissors", icon: Scissors, tags: ["haircut", "salon", "grooming"] },
  { key: "package", label: "Package", icon: Package, tags: ["delivery", "online", "order"] },

  // Bills & Utilities
  { key: "receipt", label: "Receipt", icon: Receipt, tags: ["bills", "invoice", "payment"] },
  { key: "phone", label: "Phone", icon: Phone, tags: ["recharge", "mobile", "bills"] },
  { key: "wifi", label: "WiFi", icon: Wifi, tags: ["internet", "broadband", "bills"] },
  { key: "zap", label: "Electricity", icon: Zap, tags: ["power", "electric", "bills"] },
  { key: "flame", label: "Flame", icon: Flame, tags: ["gas", "cooking", "bills"] },

  // Entertainment
  { key: "clapperboard", label: "Clapperboard", icon: Clapperboard, tags: ["movies", "entertainment", "cinema"] },
  { key: "film", label: "Film", icon: Film, tags: ["movies", "cinema", "entertainment"] },
  { key: "gamepad", label: "Gaming", icon: Gamepad2, tags: ["games", "entertainment", "play"] },
  { key: "music", label: "Music", icon: Music, tags: ["spotify", "entertainment", "songs"] },
  { key: "headphones", label: "Headphones", icon: Headphones, tags: ["music", "audio", "podcast"] },
  { key: "tv", label: "TV", icon: Tv, tags: ["netflix", "streaming", "entertainment"] },
  { key: "ticket", label: "Ticket", icon: Ticket, tags: ["events", "concert", "show"] },
  { key: "party-popper", label: "Party", icon: PartyPopper, tags: ["celebration", "event", "outing"] },
  { key: "palette", label: "Palette", icon: Palette, tags: ["art", "creative", "hobby"] },

  // Subscriptions & Tech
  { key: "credit-card", label: "Credit Card", icon: CreditCard, tags: ["subscription", "payment", "card"] },
  { key: "laptop", label: "Laptop", icon: Laptop, tags: ["professional", "tech", "work", "computer"] },
  { key: "camera", label: "Camera", icon: Camera, tags: ["photography", "media"] },

  // Finance
  { key: "piggy-bank", label: "Piggy Bank", icon: PiggyBank, tags: ["savings", "bank", "deposit"] },
  { key: "trending-up", label: "Trending Up", icon: TrendingUp, tags: ["investments", "stocks", "growth"] },
  { key: "wallet", label: "Wallet", icon: Wallet, tags: ["salary", "money", "income", "cash"] },
  { key: "banknote", label: "Banknote", icon: Banknote, tags: ["money", "cash", "income", "payment"] },
  { key: "circle-dollar-sign", label: "Dollar", icon: CircleDollarSign, tags: ["money", "income", "payment"] },
  { key: "hand-coins", label: "Hand Coins", icon: HandCoins, tags: ["lending", "giving", "tips"] },
  { key: "badge-dollar-sign", label: "Badge Dollar", icon: BadgeDollarSign, tags: ["earnings", "bonus", "reward"] },
  { key: "bar-chart-3", label: "Bar Chart", icon: BarChart3, tags: ["returns", "analytics", "stats"] },

  // People & Relationships
  { key: "heart", label: "Heart", icon: Heart, tags: ["love", "girlfriend", "partner", "romance"] },
  { key: "heart-pulse", label: "Heart Pulse", icon: HeartPulse, tags: ["health", "medical", "fitness"] },
  { key: "users", label: "People", icon: Users, tags: ["family", "group", "team"] },
  { key: "handshake", label: "Handshake", icon: Handshake, tags: ["friends", "deal", "agreement"] },
  { key: "baby", label: "Baby", icon: Baby, tags: ["kids", "child", "family"] },
  { key: "sparkles", label: "Sparkles", icon: Sparkles, tags: ["girlfriend", "special", "date", "love"] },

  // Health & Fitness
  { key: "pill", label: "Pill", icon: Pill, tags: ["medicine", "health", "pharmacy"] },
  { key: "stethoscope", label: "Stethoscope", icon: Stethoscope, tags: ["doctor", "health", "medical"] },
  { key: "dumbbell", label: "Dumbbell", icon: Dumbbell, tags: ["gym", "fitness", "exercise"] },
  { key: "cigarette", label: "Cigarette", icon: Cigarette, tags: ["smoking", "daily", "habit"] },

  // Education & Work
  { key: "book-open", label: "Book", icon: BookOpen, tags: ["education", "courses", "study"] },
  { key: "graduation-cap", label: "Graduation", icon: GraduationCap, tags: ["education", "college", "degree"] },
  { key: "briefcase", label: "Briefcase", icon: Briefcase, tags: ["work", "business", "professional"] },
  { key: "hammer", label: "Hammer", icon: Hammer, tags: ["repair", "maintenance", "tools"] },

  // Misc
  { key: "wrench", label: "Wrench", icon: Wrench, tags: ["freelance", "repair", "tools"] },
  { key: "rotate-ccw", label: "Refund", icon: RotateCcw, tags: ["refund", "return", "undo"] },
  { key: "gift", label: "Gift", icon: Gift, tags: ["gift", "present", "birthday"] },
  { key: "shield-check", label: "Shield", icon: ShieldCheck, tags: ["insurance", "security", "protection"] },
  { key: "globe", label: "Globe", icon: Globe, tags: ["travel", "international", "online"] },
  { key: "map-pin", label: "Map Pin", icon: MapPin, tags: ["travel", "location", "trip"] },
  { key: "umbrella", label: "Umbrella", icon: Umbrella, tags: ["insurance", "rainy day"] },
  { key: "dog", label: "Dog", icon: Dog, tags: ["pet", "animal"] },
  { key: "cat", label: "Cat", icon: Cat, tags: ["pet", "animal"] },
];

/** Quick lookup: icon key → LucideIcon component */
const ICON_MAP = new Map<string, LucideIcon>(
  ICON_REGISTRY.map((entry) => [entry.key, entry.icon])
);

export function getIconByKey(key: string): LucideIcon | undefined {
  return ICON_MAP.get(key);
}
