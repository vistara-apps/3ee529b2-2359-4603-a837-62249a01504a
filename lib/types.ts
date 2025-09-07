export interface Project {
  projectId: string;
  projectName: string;
  creatorWalletAddress: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending';
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
  onboardedAt: Date;
  status: 'confirmed' | 'pending' | 'declined';
  name?: string;
  farcasterHandle?: string;
}

export interface RevenuePool {
  poolId: string;
  projectId: string;
  source: 'zora' | 'direct' | 'other';
  totalAmount: number;
  distributedAmount: number;
  createdAt: Date;
  status: 'pending' | 'distributed' | 'failed';
  transactionHash?: string;
}

export interface Payout {
  payoutId: string;
  poolId: string;
  contributorId: string;
  amount: number;
  transactionHash: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface CreateProjectData {
  projectName: string;
  description: string;
  contributors: {
    walletAddress: string;
    sharePercentage: number;
    role: string;
    name?: string;
  }[];
}

export interface DistributeRevenueData {
  projectId: string;
  amount: number;
  source: RevenuePool['source'];
}
