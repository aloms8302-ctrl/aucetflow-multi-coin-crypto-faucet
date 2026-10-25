import { CoinType } from './faucet';

export type OfferwallProvider = 'junkie' | 'adollar';

export interface OfferwallTask {
  id: string;
  provider: OfferwallProvider;
  title: string;
  tagline: string;
  description: string;
  category: string;
  payoutUsd: number;
  coin: CoinType;
  coinAmount: number;
  timeEstimate: string;
  difficulty: 'Instant' | 'Easy' | 'Medium' | 'High';
  platforms: ('Android' | 'iOS' | 'Desktop' | 'Web')[];
  badge?: string;
  rating: number;
  totalCompletions: number;
  externalUrl: string;
  steps: string[];
  featured?: boolean;
}

export interface OfferwallStats {
  provider: OfferwallProvider;
  name: string;
  tagline: string;
  rating: number;
  totalPaidUsd: string;
  activeOffersCount: number;
  avgCompletionTime: string;
  bonusMultiplier: string;
  accentColor: string;
  borderGlow: string;
  badgeBg: string;
}
