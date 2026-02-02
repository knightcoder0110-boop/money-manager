export function formatCurrency(amount: number, symbol: string = "₹"): string {
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    // Fix: Indian numbering - first group of 3, then groups of 2
    .replace(/\B(?=(\d{3})+(?!\d))/, ',');

  // Use Intl for proper Indian locale formatting
  const intlFormatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${intlFormatted}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthName(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

export function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diff = today.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDateShort(dateStr);
}
