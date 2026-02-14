'use client';

import { useState, useEffect } from 'react';
import { useStakingContract, useMMAILToken, useTreasuryContract } from './useContracts';

export interface StakingInfo {
  stakedAmount: number;
  availableToStake: number;
  rewardsEarned: number;
  rewardsPending: number;
  apy: number;
  apr: number;
  cooldownEnd: number | null;
  tier: number;
  isValid: boolean;
  rewardHistory: any[];
}

export const STAKING_TIERS = [
  { id: 'wood', name: 'Wood', minAmount: 100, apr: 1, color: '#8B4513', benefits: ['Free user access', '1% APR', 'Basic features'] },
  { id: 'bronze', name: 'Bronze', minAmount: 500, apr: 5, color: '#cd7f32', benefits: ['Basic staking rewards', '5% APR', '3% fee discount', 'Validated profile'] },
  { id: 'silver', name: 'Silver', minAmount: 1000, apr: 8, color: '#c0c0c0', benefits: ['Enhanced staking rewards', '8% APR', '5% fee discount'] },
  { id: 'gold', name: 'Gold', minAmount: 5000, apr: 12, color: '#ffd700', benefits: ['Premium rewards', '12% APR', '10% fee discount', 'Priority support'] },
  { id: 'platinum', name: 'Platinum', minAmount: 20000, apr: 20, color: '#e5e4e2', benefits: ['Maximum rewards', '20% APR', '15% fee discount', 'Exclusive features', 'Direct team access'] },
];

export function useStakingInfo() {
  const { 
    stakeInfo, 
    minStake, 
    isStaking, 
    isUnstaking, 
    isClaiming,
    stakeTokens, 
    unstakeTokens, 
    claimStakingRewards,
    stakeTxHash,
    unstakeTxHash,
    claimTxHash,
    error, 
    refetchStake 
  } = useStakingContract();
  
  const { 
    balance, 
    allowance, 
    approveStaking, 
    isApproving, 
    refetchBalance, 
    refetchAllowance 
  } = useMMAILToken();
  
  const { 
    pendingRewards, 
    claimTreasuryRewards, 
    isClaiming: isClaimingTreasury, 
    refetchRewards 
  } = useTreasuryContract();
  
  const [isLoading, setIsLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState<{
    hash?: string;
    status: 'idle' | 'pending' | 'success' | 'error';
    error?: string;
  }>({ status: 'idle' });

  // Track transaction status
  useEffect(() => {
    if (stakeTxHash || unstakeTxHash || claimTxHash) {
      setTransactionStatus({ 
        hash: (stakeTxHash || unstakeTxHash || claimTxHash) as string, 
        status: 'pending' 
      });
    }
  }, [stakeTxHash, unstakeTxHash, claimTxHash]);

  useEffect(() => {
    // Set loading to false once data is loaded
    if (stakeInfo !== undefined && balance !== undefined && pendingRewards !== undefined) {
      setIsLoading(false);
    }
  }, [stakeInfo, balance, pendingRewards]);

  // Calculate APY based on tier
  const stakedAmount = parseFloat(stakeInfo?.amount || '0');
  const currentTier = getCurrentTier(stakedAmount);
  const apr = currentTier?.apr || 1;
  const apy = apr; // For simplicity, APY ≈ APR for this model

  const stakingInfo: StakingInfo | null = stakeInfo ? {
    stakedAmount: stakedAmount,
    availableToStake: parseFloat(balance) || 0,
    rewardsEarned: parseFloat(stakeInfo?.rewards || '0'), // From staking contract
    rewardsPending: parseFloat(pendingRewards || '0'), // From treasury contract
    apy: apy,
    apr: apr,
    cooldownEnd: stakeInfo.lockedUntil > 0 ? stakeInfo.lockedUntil * 1000 : null, // Convert to milliseconds
    tier: stakeInfo.tier || 0,
    isValid: stakeInfo.isValid || false,
    rewardHistory: [], // TODO: Fetch from events or backend
  } : {
    stakedAmount: 0,
    availableToStake: parseFloat(balance) || 0,
    rewardsEarned: 0,
    rewardsPending: parseFloat(pendingRewards || '0'),
    apy: 1,
    apr: 1,
    cooldownEnd: null,
    tier: 0,
    isValid: false,
    rewardHistory: [],
  };

  // Combined claim function - claims from both staking and treasury
  const claimAllRewards = async () => {
    try {
      // Claim from staking contract
      await claimStakingRewards();
      // Claim from treasury contract
      await claimTreasuryRewards();
    } catch (err) {
      console.error('Error claiming rewards:', err);
      throw err;
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await Promise.all([
      refetchStake(),
      refetchBalance(),
      refetchAllowance(),
      refetchRewards()
    ]);
    setIsLoading(false);
  };

  return {
    stakingInfo,
    isLoading,
    minStake: parseFloat(minStake),
    allowance,
    stakeTokens,
    unstakeTokens,
    claimRewards: claimAllRewards,
    approveStaking,
    isStaking,
    isUnstaking,
    isClaiming: isClaiming || isClaimingTreasury,
    isApproving,
    error,
    transactionStatus,
    refetch
  };
}

export function getCurrentTier(stakedAmount: number) {
  return [...STAKING_TIERS].reverse().find(t => stakedAmount >= t.minAmount) || STAKING_TIERS[0];
}

export function getNextTier(stakedAmount: number) {
  return STAKING_TIERS.find(t => stakedAmount < t.minAmount) || null;
}

export function calculateTierProgress(stakedAmount: number, nextTier: typeof STAKING_TIERS[0] | null) {
  if (!nextTier) return 100;
  const prevTier = STAKING_TIERS[STAKING_TIERS.indexOf(nextTier) - 1];
  const prevMin = prevTier?.minAmount || 0;
  const range = nextTier.minAmount - prevMin;
  const progress = stakedAmount - prevMin;
  return Math.min((progress / range) * 100, 100);
}

export function getFeeDiscount(tierId: string): number {
  const discounts: Record<string, number> = {
    'wood': 0,
    'bronze': 3,
    'silver': 5,
    'gold': 10,
    'platinum': 15
  };
  return discounts[tierId] || 0;
}
