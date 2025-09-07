import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function calculatePayout(totalAmount: number, sharePercentage: number, platformFee = 0.02): number {
  const afterFee = totalAmount * (1 - platformFee);
  return afterFee * (sharePercentage / 100);
}

export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateSharePercentages(contributors: { sharePercentage: number }[]): boolean {
  const total = contributors.reduce((sum, c) => sum + c.sharePercentage, 0);
  return Math.abs(total - 100) < 0.01; // Allow for small floating point errors
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
