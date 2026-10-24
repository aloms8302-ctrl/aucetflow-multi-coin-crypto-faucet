export type CoinType = 'BTC' | 'LTC' | 'DOGE' | 'USDT';

export interface CoinConfig {
  coin: CoinType;
  name: string;
  symbol: string;
  rewardAmount: number;
  rewardDisplay: string;
  unitNickname: string;
  decimals: number;
  color: string;
  borderColor: string;
  bgLight: string;
  estUsdPrice: number;
}

export const COIN_SPECS: Record<CoinType, CoinConfig> = {
  BTC: {
    coin: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    rewardAmount: 0.00000001,
    rewardDisplay: '0.00000001',
    unitNickname: '1 Satoshi',
    decimals: 8,
    color: '#F7931A',
    borderColor: 'border-amber-500/30',
    bgLight: 'rgba(247, 147, 26, 0.08)',
    estUsdPrice: 68500,
  },
  LTC: {
    coin: 'LTC',
    name: 'Litecoin',
    symbol: 'LTC',
    rewardAmount: 0.00000100,
    rewardDisplay: '0.00000100',
    unitNickname: '100 Litoshis',
    decimals: 8,
    color: '#345D9D',
    borderColor: 'border-blue-500/30',
    bgLight: 'rgba(52, 93, 157, 0.08)',
    estUsdPrice: 85,
  },
  DOGE: {
    coin: 'DOGE',
    name: 'Dogecoin',
    symbol: 'DOGE',
    rewardAmount: 0.00001000,
    rewardDisplay: '0.00001000',
    unitNickname: '1,000 Koinu',
    decimals: 8,
    color: '#C2A633',
    borderColor: 'border-yellow-500/30',
    bgLight: 'rgba(194, 166, 51, 0.08)',
    estUsdPrice: 0.16,
  },
  USDT: {
    coin: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    rewardAmount: 0.00010000,
    rewardDisplay: '0.00010000',
    unitNickname: '0.01 Cent',
    decimals: 4,
    color: '#26A17B',
    borderColor: 'border-emerald-500/30',
    bgLight: 'rgba(38, 161, 123, 0.08)',
    estUsdPrice: 1.0,
  },
};

export interface Profile {
  id: string;
  username: string | null;
  created_at: string;
}

export interface Balance {
  user_id: string;
  coin: CoinType;
  amount: number;
  updated_at: string;
}

export interface Claim {
  id: string;
  user_id: string;
  coin: CoinType;
  amount: number;
  claimed_at: string;
}

export type AdminActivityAction =
  | 'dashboard_view'
  | 'users_view'
  | 'claims_view'
  | 'activity_logs_view'
  | 'data_refresh';

export interface AdminActivityLog {
  id: number;
  actor_user_id: string | null;
  actor_email: string | null;
  action: AdminActivityAction;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export interface FaucetUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  referrer_id?: string | null;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referee_id: string;
  referee_email?: string;
  coin: CoinType;
  amount: number;
  created_at: string;
}

export interface UserReferralData {
  referralCode: string;
  inviteUrl: string;
  totalReferrals: number;
  totalEarnedUsd: number;
  earningsByCoin: Record<CoinType, number>;
  earningsHistory: ReferralEarning[];
}

export interface FaucetState {
  currentUser: FaucetUser;
  balances: Record<CoinType, number>;
  claims: Claim[];
  cooldowns: Record<CoinType, number>; // timestamp in ms when available
  isLiveSupabase: boolean;
  supabaseConnected: boolean;
}

