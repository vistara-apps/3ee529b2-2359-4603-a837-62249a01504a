import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(amount: number, currency = 'USDC', decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount) + ` ${currency}`;
}

// Format wallet addresses
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format percentages
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format dates
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate percentage (0-100)
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

// Calculate total percentage from contributors
export function calculateTotalPercentage(contributors: { sharePercentage: number }[]): number {
  return contributors.reduce((total, contributor) => total + contributor.sharePercentage, 0);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Convert Wei to Ether
export function weiToEther(wei: string | number): number {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
  return Number(weiValue) / Math.pow(10, 18);
}

// Convert Ether to Wei
export function etherToWei(ether: number): string {
  return (BigInt(Math.floor(ether * Math.pow(10, 18)))).toString();
}

// Format transaction hash for display
export function formatTxHash(hash: string, chars = 6): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

// Get Base scan URL for transaction
export function getBaseScanUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = 'https://basescan.org';
  return `${baseUrl}/${type}/${hash}`;
}

// Validate form data
export function validateProjectForm(data: {
  projectName: string;
  contributors: { sharePercentage: number; walletAddress: string }[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.projectName.trim()) {
    errors.push('Project name is required');
  }
  
  if (data.contributors.length === 0) {
    errors.push('At least one contributor is required');
  }
  
  const totalPercentage = calculateTotalPercentage(data.contributors);
  if (totalPercentage !== 100) {
    errors.push(`Total percentage must equal 100% (currently ${totalPercentage}%)`);
  }
  
  data.contributors.forEach((contributor, index) => {
    if (!isValidAddress(contributor.walletAddress)) {
      errors.push(`Invalid wallet address for contributor ${index + 1}`);
    }
    if (!isValidPercentage(contributor.sharePercentage)) {
      errors.push(`Invalid percentage for contributor ${index + 1}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Format large numbers
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

// Get status color for UI
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    completed: 'text-blue-600 bg-blue-100',
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    processing: 'text-blue-600 bg-blue-100',
    failed: 'text-red-600 bg-red-100',
    distributing: 'text-purple-600 bg-purple-100',
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
}

// Error handling utility
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
