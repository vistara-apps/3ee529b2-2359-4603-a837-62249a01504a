// Core data model types based on the specification

export interface Project {
  projectId: string;
  projectName: string;
  creatorWalletAddress: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'completed';
  description?: string;
  totalRevenue?: number;
  totalDistributed?: number;
}

export interface Contributor {
  contributorId: string;
  projectId: string;
  walletAddress: string;
  sharePercentage: number;
  role: string;
  onboardedAt: string;
  status: 'pending' | 'confirmed' | 'rejected';
  farcasterUsername?: string;
}

export interface RevenuePool {
  poolId: string;
  projectId: string;
  source: 'zora' | 'direct' | 'other';
  totalAmount: number;
  distributedAmount: number;
  createdAt: string;
  status: 'pending' | 'distributing' | 'completed' | 'failed';
  transactionHash?: string;
  sourceMetadata?: {
    nftCollectionAddress?: string;
    saleTransactionHash?: string;
    zoraEventId?: string;
  };
}

export interface Payout {
  payoutId: string;
  poolId: string;
  contributorId: string;
  amount: number;
  transactionHash?: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gasUsed?: number;
  gasPrice?: string;
}

// UI Component Props Types
export interface ProjectCardProps {
  project: Project;
  contributors?: Contributor[];
  variant?: 'active' | 'inactive';
  onClick?: () => void;
}

export interface ContributorRowProps {
  contributor: Contributor;
  onEdit?: (contributor: Contributor) => void;
  onRemove?: (contributorId: string) => void;
  showActions?: boolean;
}

export interface FrameContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

// Form Types
export interface CreateProjectForm {
  projectName: string;
  description: string;
  contributors: {
    walletAddress: string;
    sharePercentage: number;
    role: string;
    farcasterUsername?: string;
  }[];
}

export interface AddContributorForm {
  walletAddress: string;
  sharePercentage: number;
  role: string;
  farcasterUsername?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Blockchain Types
export interface TransactionDetails {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  status: 'success' | 'failed';
}

export interface ContractInteraction {
  contractAddress: string;
  functionName: string;
  parameters: any[];
  transactionHash?: string;
  status: 'pending' | 'success' | 'failed';
}

// Zora API Types
export interface ZoraNFTSale {
  id: string;
  collectionAddress: string;
  tokenId: string;
  salePrice: string;
  currency: string;
  buyer: string;
  seller: string;
  timestamp: string;
  transactionHash: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// User Context Types
export interface UserProfile {
  walletAddress: string;
  farcasterUsername?: string;
  email?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AppState {
  user: UserProfile | null;
  projects: Project[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

// Hook Return Types
export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (data: CreateProjectForm) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseContributorsReturn {
  contributors: Contributor[];
  loading: boolean;
  error: string | null;
  addContributor: (projectId: string, data: AddContributorForm) => Promise<Contributor>;
  updateContributor: (contributorId: string, updates: Partial<Contributor>) => Promise<Contributor>;
  removeContributor: (contributorId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseRevenuePoolsReturn {
  pools: RevenuePool[];
  loading: boolean;
  error: string | null;
  createPool: (projectId: string, amount: number, source: string) => Promise<RevenuePool>;
  distributeRevenue: (poolId: string) => Promise<Payout[]>;
  refetch: () => Promise<void>;
}

// Smart Contract Types
export interface RevenueSplitterContract {
  address: string;
  projectId: string;
  contributors: string[];
  shares: number[];
  totalShares: number;
  deployed: boolean;
  deploymentTx?: string;
}

export interface DeployContractParams {
  projectId: string;
  contributors: string[];
  shares: number[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Constants
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
} as const;

export const CONTRIBUTOR_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const REVENUE_SOURCES = {
  ZORA: 'zora',
  DIRECT: 'direct',
  OTHER: 'other',
} as const;
