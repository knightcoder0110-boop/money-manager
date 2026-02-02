export const NECESSITY_COLORS = {
  necessary: { color: '#00D68F', bg: 'rgba(0, 214, 143, 0.12)', label: 'Necessary' },
  unnecessary: { color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.12)', label: 'Unnecessary' },
  debatable: { color: '#FFD93D', bg: 'rgba(255, 217, 61, 0.12)', label: 'Debatable' },
} as const;

export const TRANSACTION_TYPE_COLORS = {
  expense: { color: '#FF6B6B', prefix: '-' },
  income: { color: '#00D68F', prefix: '+' },
} as const;

export const MORE_MENU_ITEMS = [
  { label: 'Transactions', route: '/transactions' as const, icon: 'list' as const, description: 'All transactions' },
  { label: 'Events', route: '/events' as const, icon: 'calendar' as const, description: 'Trips & events' },
  { label: 'Categories', route: '/categories' as const, icon: 'grid' as const, description: 'Manage categories' },
  { label: 'Analytics', route: '/analytics' as const, icon: 'trending-up' as const, description: 'Charts & insights' },
  { label: 'Settings', route: '/settings' as const, icon: 'settings' as const, description: 'App preferences' },
] as const;
