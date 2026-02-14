'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { 
  CONTRACT_ADDRESSES, 
  STAKING_ABI, 
  ADS_ABI, 
  TREASURY_ABI, 
  ERC20_ABI,
  REGISTRY_ABI,
  FEES_ABI,
  SUBSCRIPTIONS_ABI
} from '@/lib/contracts';

const NETWORK = 'baseSepolia';
const ADDRESSES = CONTRACT_ADDRESSES[NETWORK];

// ==================== STAKING HOOK ====================

export function useStakingContract() {
  const { address } = useAccount();
  
  // Read user's stake info using getStakeInfo instead of stakes for better compatibility
  const { data: stakeInfoRaw, refetch: refetchStake } = useReadContract({
    address: ADDRESSES.MoltMailStaking as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read stakes struct for lock information
  const { data: stakesStruct, refetch: refetchStakes } = useReadContract({
    address: ADDRESSES.MoltMailStaking as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read minimum stake
  const { data: minStake } = useReadContract({
    address: ADDRESSES.MoltMailStaking as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'MIN_STAKE',
    query: { enabled: true }
  });

  // Stake tokens
  const { writeContract: stake, isPending: isStaking, error: stakeError, data: stakeTxHash } = useWriteContract();
  
  // Unstake tokens
  const { writeContract: unstake, isPending: isUnstaking, error: unstakeError, data: unstakeTxHash } = useWriteContract();
  
  // Claim rewards from staking contract
  const { writeContract: claimStaking, isPending: isClaimingStaking, error: claimStakingError, data: claimStakingTxHash } = useWriteContract();

  const stakeTokens = useCallback(async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    const parsedAmount = parseUnits(amount, 18);
    stake({
      address: ADDRESSES.MoltMailStaking as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [parsedAmount]
    });
  }, [address, stake]);

  const unstakeTokens = useCallback(async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    const parsedAmount = parseUnits(amount, 18);
    unstake({
      address: ADDRESSES.MoltMailStaking as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [parsedAmount]
    });
  }, [address, unstake]);

  const claimStakingRewards = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    claimStaking({
      address: ADDRESSES.MoltMailStaking as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'claimRewards'
    });
  }, [address, claimStaking]);

  // Parse stakeInfo from getStakeInfo - returns [amount, rewards, tier]
  const parsedStakeInfo = stakeInfoRaw ? {
    amount: formatUnits((stakeInfoRaw as unknown as [bigint, bigint, number])[0], 18),
    rewards: formatUnits((stakeInfoRaw as unknown as [bigint, bigint, number])[1], 18),
    tier: (stakeInfoRaw as unknown as [bigint, bigint, number])[2]
  } : null;

  // Parse stakes struct for lock information - returns {amount, stakedAt, isValid, lockedUntil, lockReason}
  const parsedStakesStruct = stakesStruct ? {
    amount: formatUnits((stakesStruct as unknown as { amount: bigint; stakedAt: bigint; isValid: boolean; lockedUntil: bigint; lockReason: string }).amount, 18),
    stakedAt: Number((stakesStruct as unknown as { amount: bigint; stakedAt: bigint; isValid: boolean; lockedUntil: bigint; lockReason: string }).stakedAt),
    isValid: (stakesStruct as unknown as { amount: bigint; stakedAt: bigint; isValid: boolean; lockedUntil: bigint; lockReason: string }).isValid,
    lockedUntil: Number((stakesStruct as unknown as { amount: bigint; stakedAt: bigint; isValid: boolean; lockedUntil: bigint; lockReason: string }).lockedUntil),
    lockReason: (stakesStruct as unknown as { amount: bigint; stakedAt: bigint; isValid: boolean; lockedUntil: bigint; lockReason: string }).lockReason
  } : null;

  return {
    stakeInfo: parsedStakeInfo || parsedStakesStruct ? {
      amount: parsedStakeInfo?.amount || parsedStakesStruct?.amount || '0',
      rewards: parsedStakeInfo?.rewards || '0',
      tier: parsedStakeInfo?.tier || 0,
      stakedAt: parsedStakesStruct?.stakedAt || 0,
      isValid: parsedStakesStruct?.isValid || false,
      lockedUntil: parsedStakesStruct?.lockedUntil || 0,
      lockReason: parsedStakesStruct?.lockReason || ''
    } : null,
    minStake: minStake ? formatUnits(minStake as bigint, 18) : '100',
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    isStaking,
    isUnstaking,
    isClaiming: isClaimingStaking,
    stakeTxHash,
    unstakeTxHash,
    claimTxHash: claimStakingTxHash,
    error: stakeError || unstakeError || claimStakingError,
    refetchStake: async () => {
      await refetchStake();
      await refetchStakes();
    }
  };
}

// ==================== TOKEN HOOK ====================

export function useMMAILToken() {
  const { address } = useAccount();

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ADDRESSES.MoltMailToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read allowance for staking contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.MoltMailToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ADDRESSES.MoltMailStaking] : undefined,
    query: { enabled: !!address }
  });

  // Approve tokens
  const { writeContract: approve, isPending: isApproving, error: approveError } = useWriteContract();

  const approveStaking = useCallback(async (amount: string) => {
    if (!address) return;
    const parsedAmount = parseUnits(amount, 18);
    approve({
      address: ADDRESSES.MoltMailToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ADDRESSES.MoltMailStaking, parsedAmount]
    });
  }, [address, approve]);

  return {
    balance: balance ? formatUnits(balance as bigint, 18) : '0',
    allowance: allowance ? formatUnits(allowance as bigint, 18) : '0',
    approveStaking,
    isApproving,
    approveError,
    refetchBalance,
    refetchAllowance
  };
}

// ==================== ADS CONTRACT HOOK ====================

export function useAdsContract() {
  const { address } = useAccount();

  // Read cost per view
  const { data: costPerView } = useReadContract({
    address: ADDRESSES.MoltMailAds as `0x${string}`,
    abi: ADS_ABI,
    functionName: 'costPerView',
    query: { enabled: true }
  });

  // Read min ad spend
  const { data: minAdSpend } = useReadContract({
    address: ADDRESSES.MoltMailAds as `0x${string}`,
    abi: ADS_ABI,
    functionName: 'minAdSpend',
    query: { enabled: true }
  });

  // Read advertiser campaigns
  const { data: campaigns, refetch: refetchCampaigns } = useReadContract({
    address: ADDRESSES.MoltMailAds as `0x${string}`,
    abi: ADS_ABI,
    functionName: 'getAdvertiserCampaigns',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Create campaign
  const { writeContract: createCampaign, isPending: isCreating, error: createError } = useWriteContract();

  const createAdCampaign = useCallback(async (title: string, contentHash: string, budget: string, duration: number) => {
    if (!address) return;
    const parsedBudget = parseUnits(budget, 6); // USDC has 6 decimals
    createCampaign({
      address: ADDRESSES.MoltMailAds as `0x${string}`,
      abi: ADS_ABI,
      functionName: 'createCampaign',
      args: [title, contentHash, parsedBudget, BigInt(duration)]
    });
  }, [address, createCampaign]);

  return {
    costPerView: costPerView ? formatUnits(costPerView as bigint, 6) : '3',
    minAdSpend: minAdSpend ? formatUnits(minAdSpend as bigint, 6) : '50',
    campaigns: campaigns || [],
    createAdCampaign,
    isCreating,
    createError,
    refetchCampaigns
  };
}

// ==================== TREASURY HOOK ====================

export function useTreasuryContract() {
  const { address } = useAccount();

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: ADDRESSES.MoltMailTreasury as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Claim rewards
  const { writeContract: claim, isPending: isClaiming, error: claimError } = useWriteContract();

  const claimTreasuryRewards = useCallback(async () => {
    if (!address) return;
    claim({
      address: ADDRESSES.MoltMailTreasury as `0x${string}`,
      abi: TREASURY_ABI,
      functionName: 'claimRewards'
    });
  }, [address, claim]);

  return {
    pendingRewards: pendingRewards ? formatUnits(pendingRewards as bigint, 18) : '0',
    claimTreasuryRewards,
    isClaiming,
    claimError,
    refetchRewards
  };
}

// ==================== REGISTRY HOOK ====================

export function useRegistryContract() {
  const { address } = useAccount();

  // Check if registered
  const { data: isRegistered, refetch: refetchRegistration } = useReadContract({
    address: ADDRESSES.MoltMailRegistry as `0x${string}`,
    abi: REGISTRY_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get user profile
  const { data: profile, refetch: refetchProfile } = useReadContract({
    address: ADDRESSES.MoltMailRegistry as `0x${string}`,
    abi: REGISTRY_ABI,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isRegistered === true }
  });

  // Register
  const { writeContract: register, isPending: isRegistering, error: registerError } = useWriteContract();

  // Set public key
  const { writeContract: setPublicKey, isPending: isSettingKey, error: keyError } = useWriteContract();

  const registerUser = useCallback(async (displayName: string) => {
    if (!address) return;
    register({
      address: ADDRESSES.MoltMailRegistry as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: 'register',
      args: [displayName]
    });
  }, [address, register]);

  const updatePublicKey = useCallback(async (publicKey: string) => {
    if (!address) return;
    setPublicKey({
      address: ADDRESSES.MoltMailRegistry as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: 'setPublicKey',
      args: [publicKey]
    });
  }, [address, setPublicKey]);

  return {
    isRegistered: isRegistered || false,
    profile: profile ? {
      displayName: (profile as unknown as string[])[0],
      publicKey: (profile as unknown as string[])[1]
    } : null,
    registerUser,
    updatePublicKey,
    isRegistering,
    isSettingKey,
    error: registerError || keyError,
    refetchRegistration,
    refetchProfile
  };
}

// ==================== SUBSCRIPTIONS HOOK ====================

export function useSubscriptionsContract() {
  const { address } = useAccount();

  // Get following list
  const { data: following, refetch: refetchFollowing } = useReadContract({
    address: ADDRESSES.MoltMailSubscriptions as `0x${string}`,
    abi: SUBSCRIPTIONS_ABI,
    functionName: 'getFollowing',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get followers list
  const { data: followers, refetch: refetchFollowers } = useReadContract({
    address: ADDRESSES.MoltMailSubscriptions as `0x${string}`,
    abi: SUBSCRIPTIONS_ABI,
    functionName: 'getFollowers',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Check if following
  const { data: isFollowing } = useReadContract({
    address: ADDRESSES.MoltMailSubscriptions as `0x${string}`,
    abi: SUBSCRIPTIONS_ABI,
    functionName: 'isFollowing',
    args: address ? [address, ADDRESSES.MoltMailRegistry] : undefined,
    query: { enabled: !!address }
  });

  // Follow user
  const { writeContract: follow, isPending: isFollowingUser, error: followError } = useWriteContract();

  // Unfollow user
  const { writeContract: unfollow, isPending: isUnfollowing, error: unfollowError } = useWriteContract();

  const followUser = useCallback(async (userToFollow: string) => {
    if (!address) return;
    follow({
      address: ADDRESSES.MoltMailSubscriptions as `0x${string}`,
      abi: SUBSCRIPTIONS_ABI,
      functionName: 'follow',
      args: [userToFollow as `0x${string}`]
    });
  }, [address, follow]);

  const unfollowUser = useCallback(async (userToUnfollow: string) => {
    if (!address) return;
    unfollow({
      address: ADDRESSES.MoltMailSubscriptions as `0x${string}`,
      abi: SUBSCRIPTIONS_ABI,
      functionName: 'unfollow',
      args: [userToUnfollow as `0x${string}`]
    });
  }, [address, unfollow]);

  return {
    following: following || [],
    followers: followers || [],
    isFollowing: isFollowing || false,
    followUser,
    unfollowUser,
    isFollowingUser,
    isUnfollowing,
    error: followError || unfollowError,
    refetchFollowing,
    refetchFollowers
  };
}

// ==================== FEES HOOK ====================

export function useFeesContract() {
  const { address } = useAccount();

  // Calculate fee
  const { data: calculatedFee, refetch: refetchFee } = useReadContract({
    address: ADDRESSES.MoltMailFees as `0x${string}`,
    abi: FEES_ABI,
    functionName: 'calculateFee',
    args: address ? [address, ADDRESSES.MoltMailRegistry, 0] : undefined,
    query: { enabled: !!address }
  });

  // Get MMAIL token address
  const { data: mmailToken } = useReadContract({
    address: ADDRESSES.MoltMailFees as `0x${string}`,
    abi: FEES_ABI,
    functionName: 'mmailToken',
    query: { enabled: true }
  });

  // Pay fee
  const { writeContract: payFee, isPending: isPaying, error: payError } = useWriteContract();

  const payMessageFee = useCallback(async (recipient: string, tier: number = 0) => {
    if (!address) return;
    payFee({
      address: ADDRESSES.MoltMailFees as `0x${string}`,
      abi: FEES_ABI,
      functionName: 'payFee',
      args: [address, recipient as `0x${string}`, tier]
    });
  }, [address, payFee]);

  return {
    calculatedFee: calculatedFee ? formatUnits(calculatedFee as bigint, 18) : '0',
    mmailToken,
    payMessageFee,
    isPaying,
    payError,
    refetchFee
  };
}

// ==================== CONTRACT STATUS HOOK ====================

export function useContractStatus() {
  const [status, setStatus] = useState({
    isChecking: true,
    connected: false,
    contracts: {} as Record<string, boolean>
  });

  const checkContracts = useCallback(async () => {
    const contracts = {
      MoltMailToken: !!ADDRESSES.MoltMailToken,
      MoltMailRegistry: !!ADDRESSES.MoltMailRegistry,
      MoltMailFees: !!ADDRESSES.MoltMailFees,
      MoltMailSubscriptions: !!ADDRESSES.MoltMailSubscriptions,
      MoltMailStaking: !!ADDRESSES.MoltMailStaking,
      MoltMailTreasury: !!ADDRESSES.MoltMailTreasury,
      MoltMailAds: !!ADDRESSES.MoltMailAds,
    };

    setStatus({
      isChecking: false,
      connected: Object.values(contracts).every(Boolean),
      contracts
    });
  }, []);

  useEffect(() => {
    checkContracts();
  }, [checkContracts]);

  return { ...status, refetch: checkContracts };
}
