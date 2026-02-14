// API client for MoltMail backend
import { API_URL as CONTRACTS_API_URL } from '@/lib/contracts';

export const API_URL = CONTRACTS_API_URL;

export interface StakingData {
  address: string;
  staking: {
    stakedAmount: string;
    rewardsEarned: string;
    tier: number;
    stakedAt: number;
    isValid: boolean;
    lockedUntil: number;
    lockReason: string;
    minStake: string;
    totalStaked: string;
    pendingRewards: string;
  };
  tier: {
    current: number;
    minStake: string;
    apr: number;
    feeDiscount: number;
  };
  canVote: boolean;
}

export interface StakingStats {
  totalStaked: string;
  treasuryBalance: string;
  minStakeToVote: string;
  contracts: {
    staking: string;
    treasury: string;
  };
}

/**
 * Get API key from localStorage
 */
function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mmail_api_key');
  }
  return null;
}

/**
 * Fetch staking data for a user
 */
export async function fetchStakingData(address: string): Promise<StakingData> {
  const apiKey = getApiKey();
  
  const response = await fetch(`${API_URL}/staking/${address}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey || ''
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch staking data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch global staking stats
 */
export async function fetchStakingStats(): Promise<StakingStats> {
  const apiKey = getApiKey();
  
  const response = await fetch(`${API_URL}/staking/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey || ''
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch staking stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if user can vote
 */
export async function checkCanVote(address: string): Promise<{
  address: string;
  canVote: boolean;
  stakeAmount: string;
  minStakeToVote: string;
  hasEnoughStake: boolean;
}> {
  const apiKey = getApiKey();
  
  const response = await fetch(`${API_URL}/staking/${address}/can-vote`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey || ''
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to check voting eligibility: ${response.statusText}`);
  }

  return response.json();
}
