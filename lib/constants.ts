export const PLATFORM_FEE = 0.02; // 2% platform fee

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

export const CONTRIBUTOR_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  DECLINED: 'declined',
} as const;

export const REVENUE_SOURCES = {
  ZORA: 'zora',
  DIRECT: 'direct',
  OTHER: 'other',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
] as const;

export const BASE_SCAN_URL = 'https://basescan.org';
export const ZORA_API_URL = 'https://api.zora.co/graphql';
