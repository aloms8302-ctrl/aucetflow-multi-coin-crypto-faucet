import {
  CoinType,
  Claim,
  COIN_SPECS,
  AdminActivityLog,
  AdminUser,
  FaucetUser,
  AdminActivityAction,
  ReferralEarning,
  UserReferralData,
} from '../types/faucet';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEY_LOCAL_STATE = 'faucetflow_sandbox_state_v1';
const STORAGE_KEY_PENDING_REF = 'faucetflow_pending_ref';

export const DEMO_USERS: FaucetUser[] = [
  {
    id: 'e1a47df2-81bb-4f3b-8739-1f0f39872111',
    email: 'satoshi@faucetflow.io',
    username: 'satoshi99',
    isAdmin: false,
    referrer_id: null,
  },
  {
    id: 'b2c93847-19aa-4033-bbef-834927164920',
    email: 'alice@crypto.dev',
    username: 'alice_runner',
    isAdmin: false,
    referrer_id: 'e1a47df2-81bb-4f3b-8739-1f0f39872111', // Referred by Satoshi
  },
  {
    id: 'f9483719-72fe-4ab2-b283-938472910482',
    email: 'admin@faucetflow.io',
    username: 'root_admin',
    isAdmin: true,
    referrer_id: null,
  },
];

interface SandboxDatabase {
  users: FaucetUser[];
  currentUserId: string;
  balances: Record<string, Record<CoinType, number>>; // userId -> coin -> amount
  claims: Claim[];
  adminLogs: AdminActivityLog[];
  referralEarnings: ReferralEarning[];
}

function getInitialSandboxState(): SandboxDatabase {
  return {
    users: [...DEMO_USERS],
    currentUserId: DEMO_USERS[0].id,
    balances: {
      [DEMO_USERS[0].id]: {
        BTC: 0.00000008,
        LTC: 0.00000500,
        DOGE: 0.00004000,
        USDT: 0.00050000,
      },
      [DEMO_USERS[1].id]: {
        BTC: 0.00000025,
        LTC: 0.00001200,
        DOGE: 0.00012000,
        USDT: 0.00120000,
      },
      [DEMO_USERS[2].id]: {
        BTC: 0.00000150,
        LTC: 0.00008000,
        DOGE: 0.00080000,
        USDT: 0.01000000,
      },
    },
    claims: [
      {
        id: 'c8273641-a182-4ef8-8273-918237461928',
        user_id: DEMO_USERS[0].id,
        coin: 'BTC',
        amount: 0.00000001,
        claimed_at: new Date(Date.now() - 140 * 1000).toISOString(),
      },
      {
        id: 'b7162534-c293-4de7-9182-019283746501',
        user_id: DEMO_USERS[0].id,
        coin: 'LTC',
        amount: 0.000001,
        claimed_at: new Date(Date.now() - 320 * 1000).toISOString(),
      },
      {
        id: 'd9283746-1234-4abc-8def-129384756012',
        user_id: DEMO_USERS[1].id,
        coin: 'DOGE',
        amount: 0.00001,
        claimed_at: new Date(Date.now() - 500 * 1000).toISOString(),
      },
      {
        id: 'e0192837-9876-4fed-8cba-908172635412',
        user_id: DEMO_USERS[2].id,
        coin: 'USDT',
        amount: 0.0001,
        claimed_at: new Date(Date.now() - 860 * 1000).toISOString(),
      },
    ],
    adminLogs: [
      {
        id: 1,
        actor_user_id: DEMO_USERS[2].id,
        actor_email: DEMO_USERS[2].email,
        action: 'dashboard_view',
        details: { surface: 'admin_overview', ip_anonymized: '10.0.0.1' },
        created_at: new Date(Date.now() - 1200 * 1000).toISOString(),
      },
      {
        id: 2,
        actor_user_id: DEMO_USERS[2].id,
        actor_email: DEMO_USERS[2].email,
        action: 'users_view',
        details: { filter: 'all', count: 3 },
        created_at: new Date(Date.now() - 600 * 1000).toISOString(),
      },
    ],
    referralEarnings: [
      {
        id: 'r1a2b3c4-99aa-4488-8877-665544332211',
        referrer_id: DEMO_USERS[0].id, // Satoshi
        referee_id: DEMO_USERS[1].id, // Alice
        referee_email: DEMO_USERS[1].email,
        coin: 'BTC',
        amount: 0.000000001, // 10% of 0.00000001
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        id: 'r2b3c4d5-88bb-5599-7766-554433221100',
        referrer_id: DEMO_USERS[0].id, // Satoshi
        referee_id: DEMO_USERS[1].id, // Alice
        referee_email: DEMO_USERS[1].email,
        coin: 'DOGE',
        amount: 0.000001, // 10% of 0.00001
        created_at: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
      {
        id: 'r3c4d5e6-77cc-6600-6655-443322110099',
        referrer_id: DEMO_USERS[0].id, // Satoshi
        referee_id: DEMO_USERS[1].id, // Alice
        referee_email: DEMO_USERS[1].email,
        coin: 'USDT',
        amount: 0.00001, // 10% of 0.0001
        created_at: new Date(Date.now() - 10800 * 1000).toISOString(),
      },
    ],
  };
}

function loadSandboxDb(): SandboxDatabase {
  if (typeof window === 'undefined') return getInitialSandboxState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_STATE);
    if (!raw) {
      const init = getInitialSandboxState();
      localStorage.setItem(STORAGE_KEY_LOCAL_STATE, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.referralEarnings) {
      parsed.referralEarnings = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading sandbox state:', err);
    return getInitialSandboxState();
  }
}

function saveSandboxDb(db: SandboxDatabase) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_STATE, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving sandbox state:', err);
  }
}

// In-memory advisory locks tracking
const inFlightAdvisoryLocks = new Set<string>();

export interface ClaimResult {
  success: boolean;
  message: string;
  claim?: Claim;
  newBalance?: number;
  timeRemaining?: number;
  advisoryLockUsed?: boolean;
}

export class FaucetEngine {
  /**
   * Claim reward for specific coin with 60s cooldown and pg_advisory_xact_lock protection
   */
  static async claimReward(
    coin: CoinType,
    user: FaucetUser
  ): Promise<ClaimResult> {
    const supabase = getSupabaseClient();

    // 1. Live Supabase execution if configured
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('claim_reward', {
          p_coin: coin,
        });

        if (error) {
          // Parse cooldown or authentication exceptions from PostgreSQL
          const isCooldown = error.message.toLowerCase().includes('wait');
          return {
            success: false,
            message: error.message,
            timeRemaining: isCooldown ? 60 : undefined,
          };
        }

        return {
          success: true,
          message: `Successfully claimed ${COIN_SPECS[coin].rewardDisplay} ${coin}!`,
          claim: {
            id: (data as { id?: string })?.id || crypto.randomUUID(),
            user_id: user.id,
            coin: coin,
            amount: COIN_SPECS[coin].rewardAmount,
            claimed_at: (data as { claimed_at?: string })?.claimed_at || new Date().toISOString(),
          },
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `RPC error: ${message}`,
        };
      }
    }

    // 2. High-fidelity PostgreSQL Sandbox Engine (mirrors schema function exactly)
    const lockKey = `${user.id}:${coin}`;
    if (inFlightAdvisoryLocks.has(lockKey)) {
      return {
        success: false,
        message: 'Concurrent claim blocked by pg_advisory_xact_lock.',
      };
    }

    inFlightAdvisoryLocks.add(lockKey);

    // Simulate advisory lock transaction window
    await new Promise((r) => setTimeout(r, 220));

    try {
      const db = loadSandboxDb();

      // Check user claims for cooldown (1 hour = 3600 seconds)
      const COOLDOWN_SECONDS = 3600;
      const userClaims = db.claims
        .filter((c) => c.user_id === user.id && c.coin === coin)
        .sort(
          (a, b) =>
            new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime()
        );

      const lastClaim = userClaims[0];
      if (lastClaim) {
        const lastTime = new Date(lastClaim.claimed_at).getTime();
        const diffSeconds = (Date.now() - lastTime) / 1000;
        if (diffSeconds < COOLDOWN_SECONDS) {
          const waitTime = Math.ceil(COOLDOWN_SECONDS - diffSeconds);
          const mins = Math.floor(waitTime / 60);
          const secs = waitTime % 60;
          const waitDisplay = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          return {
            success: false,
            message: `Please wait ${waitDisplay} before making another claim for this coin (1-hour cooldown).`,
            timeRemaining: waitTime,
            advisoryLockUsed: true,
          };
        }
      }

      // Calculate reward
      const reward = COIN_SPECS[coin].rewardAmount;

      // Update balances table: ON CONFLICT(user_id, coin) DO UPDATE SET amount = amount + excluded.amount
      if (!db.balances[user.id]) {
        db.balances[user.id] = { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
      }
      const prevBal = db.balances[user.id][coin] || 0;
      const newBal = Number((prevBal + reward).toFixed(12));
      db.balances[user.id][coin] = newBal;

      // Insert into claims
      const newClaim: Claim = {
        id: crypto.randomUUID(),
        user_id: user.id,
        coin: coin,
        amount: reward,
        claimed_at: new Date().toISOString(),
      };
      db.claims.unshift(newClaim);

      // 10% Referral Bonus Calculation & Payout
      const userRecord = db.users.find((u) => u.id === user.id);
      const referrerId = userRecord?.referrer_id || user.referrer_id;
      if (referrerId && referrerId !== user.id) {
        const bonus10Pct = Number((reward * 0.10).toFixed(12));
        if (bonus10Pct > 0) {
          if (!db.balances[referrerId]) {
            db.balances[referrerId] = { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
          }
          const prevRefBal = db.balances[referrerId][coin] || 0;
          db.balances[referrerId][coin] = Number((prevRefBal + bonus10Pct).toFixed(12));

          if (!db.referralEarnings) {
            db.referralEarnings = [];
          }
          db.referralEarnings.unshift({
            id: crypto.randomUUID(),
            referrer_id: referrerId,
            referee_id: user.id,
            referee_email: user.email,
            coin: coin,
            amount: bonus10Pct,
            created_at: new Date().toISOString(),
          });
        }
      }

      saveSandboxDb(db);

      return {
        success: true,
        message: `Claimed +${COIN_SPECS[coin].rewardDisplay} ${coin} (${COIN_SPECS[coin].unitNickname})!`,
        claim: newClaim,
        newBalance: newBal,
        advisoryLockUsed: true,
      };
    } finally {
      inFlightAdvisoryLocks.delete(lockKey);
    }
  }

  /**
   * Fetch user balances
   */
  static async getBalances(
    user: FaucetUser
  ): Promise<Record<CoinType, number>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('balances')
          .select('coin, amount')
          .eq('user_id', user.id);

        if (!error && data) {
          const map: Record<CoinType, number> = {
            BTC: 0,
            LTC: 0,
            DOGE: 0,
            USDT: 0,
          };
          data.forEach((row: { coin: CoinType; amount: string | number }) => {
            if (row.coin in map) {
              map[row.coin] = parseFloat(String(row.amount)) || 0;
            }
          });
          return map;
        }
      } catch (err) {
        console.error('Supabase getBalances error:', err);
      }
    }

    const db = loadSandboxDb();
    return db.balances[user.id] || { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
  }

  /**
   * Fetch claims history for user or all if admin
   */
  static async getClaims(user: FaucetUser, allForAdmin = false): Promise<Claim[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('claims').select('*').order('claimed_at', { ascending: false }).limit(100);
        if (!allForAdmin || !user.isAdmin) {
          query = query.eq('user_id', user.id);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            coin: item.coin,
            amount: parseFloat(item.amount) || 0,
            claimed_at: item.claimed_at,
          }));
        }
      } catch (err) {
        console.error('Supabase getClaims error:', err);
      }
    }

    const db = loadSandboxDb();
    if (allForAdmin && user.isAdmin) {
      return [...db.claims];
    }
    return db.claims.filter((c) => c.user_id === user.id);
  }

  /**
   * Fetch cooldown status for each coin for user
   */
  static async getCooldowns(user: FaucetUser): Promise<Record<CoinType, number>> {
    const claims = await this.getClaims(user, false);
    const result: Record<CoinType, number> = {
      BTC: 0,
      LTC: 0,
      DOGE: 0,
      USDT: 0,
    };

    const coins: CoinType[] = ['BTC', 'LTC', 'DOGE', 'USDT'];
    const now = Date.now();

    for (const coin of coins) {
      const coinClaims = claims.filter((c) => c.coin === coin);
      if (coinClaims.length > 0) {
        const lastClaimTime = new Date(coinClaims[0].claimed_at).getTime();
        const elapsed = (now - lastClaimTime) / 1000;
        const COOLDOWN_SECONDS = 3600;
        if (elapsed < COOLDOWN_SECONDS) {
          result[coin] = Math.ceil(COOLDOWN_SECONDS - elapsed);
        }
      }
    }

    return result;
  }

  /**
   * Admin RPC: admin_list_users()
   */
  static async adminListUsers(): Promise<AdminUser[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_list_users');
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.error('admin_list_users RPC error:', err);
      }
    }

    const db = loadSandboxDb();
    return db.users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      created_at: new Date(Date.now() - 3600 * 24 * 7 * 1000).toISOString(),
    }));
  }

  /**
   * Admin RPC: admin_log_activity(p_action, p_details)
   */
  static async adminLogActivity(
    action: AdminActivityAction,
    details: Record<string, unknown> = {},
    actorUser?: FaucetUser
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.rpc('admin_log_activity', {
          p_action: action,
          p_details: details,
        });
        return;
      } catch (err) {
        console.error('admin_log_activity RPC error:', err);
      }
    }

    const db = loadSandboxDb();
    const newLog: AdminActivityLog = {
      id: db.adminLogs.length + 1,
      actor_user_id: actorUser ? actorUser.id : null,
      actor_email: actorUser ? actorUser.email : 'admin@faucetflow.io',
      action: action,
      details: details,
      created_at: new Date().toISOString(),
    };
    db.adminLogs.unshift(newLog);
    if (db.adminLogs.length > 200) db.adminLogs.pop();
    saveSandboxDb(db);
  }

  /**
   * Admin RPC: admin_list_activity_logs()
   */
  static async adminListActivityLogs(): Promise<AdminActivityLog[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('admin_list_activity_logs');
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.error('admin_list_activity_logs RPC error:', err);
      }
    }

    const db = loadSandboxDb();
    return [...db.adminLogs];
  }

  /**
   * Check if current user is admin
   */
  static async checkIsAdmin(user: FaucetUser): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (!error && typeof data === 'boolean') {
          return data;
        }
      } catch (err) {
        console.error('is_admin RPC error:', err);
      }
    }
    return user.isAdmin;
  }

  /**
  /**
   * Self-service registration with ANY email - no admin approval required
   */
  static async signUpUser(
    email: string,
    password?: string,
    username?: string
  ): Promise<{ success: boolean; user?: FaucetUser; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username?.trim() || cleanEmail.split('@')[0];

    const supabase = getSupabaseClient();
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { username: cleanUsername },
          },
        });
        if (error) {
          return { success: false, message: error.message };
        }
        if (data.user) {
          const user: FaucetUser = {
            id: data.user.id,
            email: cleanEmail,
            username: cleanUsername,
            isAdmin: false,
          };
          return {
            success: true,
            user,
            message: 'Account created successfully! Welcome to FaucetFlow.',
          };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, message: msg };
      }
    }

    // Local / Sandbox engine self-signup
    const db = loadSandboxDb();
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      return {
        success: true,
        user: existing,
        message: `Welcome back, ${existing.username || existing.email}!`,
      };
    }

    // Resolve referrer if present
    let assignedReferrerId: string | null = null;
    const pendingRef =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY_PENDING_REF)
        : null;

    if (pendingRef) {
      const cleanRef = pendingRef.trim().toLowerCase();
      const referrerUser = db.users.find(
        (u) =>
          u.id.toLowerCase() === cleanRef ||
          u.username.toLowerCase() === cleanRef ||
          u.email.toLowerCase() === cleanRef
      );
      if (referrerUser) {
        assignedReferrerId = referrerUser.id;
      }
    }

    const newUser: FaucetUser = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      username: cleanUsername,
      isAdmin: false,
      referrer_id: assignedReferrerId,
    };

    db.users.push(newUser);
    // Initialize 0 balances for all 4 coins (matches PostgreSQL handle_new_user trigger)
    db.balances[newUser.id] = {
      BTC: 0,
      LTC: 0,
      DOGE: 0,
      USDT: 0,
    };
    db.currentUserId = newUser.id;
    saveSandboxDb(db);

    return {
      success: true,
      user: newUser,
      message: 'Account created instantly! Ready to claim faucet rewards.',
    };
  }

  /**
   * Sign in with email
   */
  static async signInUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: FaucetUser; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    const supabase = getSupabaseClient();
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        if (data.user) {
          const isAdmin = await this.checkIsAdmin({
            id: data.user.id,
            email: cleanEmail,
            username: data.user.user_metadata?.username || cleanEmail.split('@')[0],
            isAdmin: false,
          });
          return {
            success: true,
            user: {
              id: data.user.id,
              email: cleanEmail,
              username: data.user.user_metadata?.username || cleanEmail.split('@')[0],
              isAdmin,
            },
            message: 'Signed in successfully.',
          };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, message: msg };
      }
    }

    const db = loadSandboxDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      db.currentUserId = user.id;
      saveSandboxDb(db);
      return {
        success: true,
        user,
        message: `Welcome back, ${user.username || user.email}!`,
      };
    }

    // Auto-create account if not found so user is never blocked
    return this.signUpUser(cleanEmail, password);
  }

  /**
   * Verify access for separate Admin Portal
   */
  static verifyAdminPasscode(passcode: string): boolean {
    const trimmed = passcode.trim();
    // Default admin passcodes
    return trimmed === 'admin123' || trimmed === 'faucetflow@admin' || trimmed === 'root';
  }

  static getUserBalancesMap(): Record<string, Record<CoinType, number>> {
    const db = loadSandboxDb();
    return db.balances;
  }

  static getSandboxUsers(): FaucetUser[] {
    const db = loadSandboxDb();
    return db.users;
  }

  static addSandboxUser(email: string, username: string): FaucetUser {
    const db = loadSandboxDb();
    const newUser: FaucetUser = {
      id: crypto.randomUUID(),
      email,
      username,
      isAdmin: false,
    };
    db.users.push(newUser);
    db.balances[newUser.id] = { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
    saveSandboxDb(db);
    return newUser;
  }

  static toggleAdminRole(userId: string): boolean {
    const db = loadSandboxDb();
    const target = db.users.find((u) => u.id === userId);
    if (target) {
      target.isAdmin = !target.isAdmin;
      saveSandboxDb(db);
      return target.isAdmin;
    }
    return false;
  }

  /**
   * Capture referral code from URL if present (?ref=... or ?invite=...)
   */
  static captureReferralFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('invite');
      if (ref) {
        const clean = ref.trim();
        localStorage.setItem(STORAGE_KEY_PENDING_REF, clean);
        return clean;
      }
      return localStorage.getItem(STORAGE_KEY_PENDING_REF);
    } catch {
      return null;
    }
  }

  static getPendingReferrerName(): string | null {
    if (typeof window === 'undefined') return null;
    const refCode = localStorage.getItem(STORAGE_KEY_PENDING_REF);
    if (!refCode) return null;
    const db = loadSandboxDb();
    const user = db.users.find(
      (u) =>
        u.id.toLowerCase() === refCode.toLowerCase() ||
        u.username.toLowerCase() === refCode.toLowerCase() ||
        u.email.toLowerCase() === refCode.toLowerCase()
    );
    return user ? (user.username || user.email) : refCode;
  }

  /**
   * Generate user's unique invite/referral link
   */
  static generateInviteLink(user: FaucetUser): string {
    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://faucetflow.io';
    const code = user.username || user.id.slice(0, 8);
    return `${baseUrl}?ref=${encodeURIComponent(code)}`;
  }

  /**
   * Get user referral statistics, earnings and referral list
   */
  static getReferralData(user: FaucetUser): UserReferralData {
    const db = loadSandboxDb();
    const code = user.username || user.id.slice(0, 8);
    const inviteUrl = this.generateInviteLink(user);

    // Find all users who were referred by this user
    const referredUsers = db.users.filter((u) => u.referrer_id === user.id);

    // Find all 10% bonus earnings
    const earnings = (db.referralEarnings || []).filter(
      (e) => e.referrer_id === user.id
    );

    const earningsByCoin: Record<CoinType, number> = {
      BTC: 0,
      LTC: 0,
      DOGE: 0,
      USDT: 0,
    };

    let totalEarnedUsd = 0;
    for (const item of earnings) {
      if (item.coin in earningsByCoin) {
        earningsByCoin[item.coin] = Number(
          (earningsByCoin[item.coin] + item.amount).toFixed(12)
        );
        const spec = COIN_SPECS[item.coin];
        if (spec) {
          totalEarnedUsd += item.amount * spec.estUsdPrice;
        }
      }
    }

    return {
      referralCode: code,
      inviteUrl,
      totalReferrals: referredUsers.length,
      totalEarnedUsd,
      earningsByCoin,
      earningsHistory: earnings,
    };
  }

  static resetSandboxData(): void {
    if (typeof window !== 'undefined') {
      const init = getInitialSandboxState();
      localStorage.setItem(STORAGE_KEY_LOCAL_STATE, JSON.stringify(init));
    }
  }
}
