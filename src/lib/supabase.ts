import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database table names
export const TABLES = {
  PROJECTS: 'projects',
  CONTRIBUTORS: 'contributors',
  REVENUE_POOLS: 'revenue_pools',
  PAYOUTS: 'payouts',
  USER_PROFILES: 'user_profiles',
} as const;

// Helper functions for common database operations

export async function createProject(data: {
  projectName: string;
  creatorWalletAddress: string;
  description?: string;
}) {
  const { data: project, error } = await supabase
    .from(TABLES.PROJECTS)
    .insert({
      project_name: data.projectName,
      creator_wallet_address: data.creatorWalletAddress,
      description: data.description,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function getProjectsByCreator(creatorWalletAddress: string) {
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .select(`
      *,
      contributors (*)
    `)
    .eq('creator_wallet_address', creatorWalletAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addContributor(data: {
  projectId: string;
  walletAddress: string;
  sharePercentage: number;
  role: string;
  farcasterUsername?: string;
}) {
  const { data: contributor, error } = await supabase
    .from(TABLES.CONTRIBUTORS)
    .insert({
      project_id: data.projectId,
      wallet_address: data.walletAddress,
      share_percentage: data.sharePercentage,
      role: data.role,
      farcaster_username: data.farcasterUsername,
      status: 'pending',
      onboarded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return contributor;
}

export async function getContributorsByProject(projectId: string) {
  const { data, error } = await supabase
    .from(TABLES.CONTRIBUTORS)
    .select('*')
    .eq('project_id', projectId)
    .order('onboarded_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createRevenuePool(data: {
  projectId: string;
  source: string;
  totalAmount: number;
  sourceMetadata?: any;
}) {
  const { data: pool, error } = await supabase
    .from(TABLES.REVENUE_POOLS)
    .insert({
      project_id: data.projectId,
      source: data.source,
      total_amount: data.totalAmount,
      distributed_amount: 0,
      status: 'pending',
      source_metadata: data.sourceMetadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return pool;
}

export async function getRevenuePoolsByProject(projectId: string) {
  const { data, error } = await supabase
    .from(TABLES.REVENUE_POOLS)
    .select(`
      *,
      payouts (*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPayout(data: {
  poolId: string;
  contributorId: string;
  amount: number;
  transactionHash?: string;
}) {
  const { data: payout, error } = await supabase
    .from(TABLES.PAYOUTS)
    .insert({
      pool_id: data.poolId,
      contributor_id: data.contributorId,
      amount: data.amount,
      transaction_hash: data.transactionHash,
      status: data.transactionHash ? 'completed' : 'pending',
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return payout;
}

export async function updatePayoutStatus(
  payoutId: string,
  status: string,
  transactionHash?: string
) {
  const updateData: any = { status };
  if (transactionHash) {
    updateData.transaction_hash = transactionHash;
  }

  const { data, error } = await supabase
    .from(TABLES.PAYOUTS)
    .update(updateData)
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(walletAddress: string) {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createOrUpdateUserProfile(data: {
  walletAddress: string;
  farcasterUsername?: string;
  email?: string;
}) {
  const { data: profile, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .upsert({
      wallet_address: data.walletAddress,
      farcaster_username: data.farcasterUsername,
      email: data.email,
      last_login_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return profile;
}

// Real-time subscriptions
export function subscribeToProject(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.PROJECTS,
        filter: `id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToContributors(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`contributors-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.CONTRIBUTORS,
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToRevenuePools(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`revenue-pools-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.REVENUE_POOLS,
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}
