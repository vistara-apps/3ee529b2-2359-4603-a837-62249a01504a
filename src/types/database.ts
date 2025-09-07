// Supabase database types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          project_name: string;
          creator_wallet_address: string;
          description: string | null;
          status: 'active' | 'inactive' | 'completed';
          total_revenue: number | null;
          total_distributed: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_name: string;
          creator_wallet_address: string;
          description?: string | null;
          status?: 'active' | 'inactive' | 'completed';
          total_revenue?: number | null;
          total_distributed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_name?: string;
          creator_wallet_address?: string;
          description?: string | null;
          status?: 'active' | 'inactive' | 'completed';
          total_revenue?: number | null;
          total_distributed?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contributors: {
        Row: {
          id: string;
          project_id: string;
          wallet_address: string;
          share_percentage: number;
          role: string;
          farcaster_username: string | null;
          status: 'pending' | 'confirmed' | 'rejected';
          onboarded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          wallet_address: string;
          share_percentage: number;
          role: string;
          farcaster_username?: string | null;
          status?: 'pending' | 'confirmed' | 'rejected';
          onboarded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          wallet_address?: string;
          share_percentage?: number;
          role?: string;
          farcaster_username?: string | null;
          status?: 'pending' | 'confirmed' | 'rejected';
          onboarded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      revenue_pools: {
        Row: {
          id: string;
          project_id: string;
          source: 'zora' | 'direct' | 'other';
          total_amount: number;
          distributed_amount: number;
          status: 'pending' | 'distributing' | 'completed' | 'failed';
          transaction_hash: string | null;
          source_metadata: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source: 'zora' | 'direct' | 'other';
          total_amount: number;
          distributed_amount?: number;
          status?: 'pending' | 'distributing' | 'completed' | 'failed';
          transaction_hash?: string | null;
          source_metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          source?: 'zora' | 'direct' | 'other';
          total_amount?: number;
          distributed_amount?: number;
          status?: 'pending' | 'distributing' | 'completed' | 'failed';
          transaction_hash?: string | null;
          source_metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payouts: {
        Row: {
          id: string;
          pool_id: string;
          contributor_id: string;
          amount: number;
          transaction_hash: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          gas_used: number | null;
          gas_price: string | null;
          timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          contributor_id: string;
          amount: number;
          transaction_hash?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          gas_used?: number | null;
          gas_price?: string | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          contributor_id?: string;
          amount?: number;
          transaction_hash?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          gas_used?: number | null;
          gas_price?: string | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          wallet_address: string;
          farcaster_username: string | null;
          email: string | null;
          created_at: string;
          last_login_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          farcaster_username?: string | null;
          email?: string | null;
          created_at?: string;
          last_login_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          farcaster_username?: string | null;
          email?: string | null;
          created_at?: string;
          last_login_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: 'active' | 'inactive' | 'completed';
      contributor_status: 'pending' | 'confirmed' | 'rejected';
      revenue_source: 'zora' | 'direct' | 'other';
      pool_status: 'pending' | 'distributing' | 'completed' | 'failed';
      payout_status: 'pending' | 'processing' | 'completed' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
