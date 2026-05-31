import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// CONTRACT_CONFIG - auto-populated by BaseClaw
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = []; // Auto-populated by BaseClaw

export default function StakingPage() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  
  const { data: totalStaked } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalStaked',
  });
  
  const { data: userStake } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'stakes',
    args: [address],
  });
  
  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'earned',
    args: [address],
  });
  
  const { data: rewardRate } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'rewardRate',
  });
  
  const { writeContract: stake } = useWriteContract();
  const { writeContract: unstake } = useWriteContract();
  const { writeContract: claimRewards } = useWriteContract();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Staking Pool
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Total Staked</label>
                <p className="text-2xl font-mono">{totalStaked ? formatEther(totalStaked) : '0'} ETH</p>
              </div>
              <div>
                <label className="text-sm font-medium">Reward Rate</label>
                <p className="text-2xl font-mono">{rewardRate ? formatEther(rewardRate) : '0'} / day</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Stake</label>
                <p className="text-2xl font-mono">{userStake ? formatEther(userStake.amount) : '0'} ETH</p>
              </div>
              <div>
                <label className="text-sm font-medium">Pending Rewards</label>
                <p className="text-2xl font-mono text-green-600">{pendingRewards ? formatEther(pendingRewards) : '0'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Stake</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={stakeAmount} 
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount to stake"
              />
              <Button 
                onClick={() => stake({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'stake',
                  value: parseEther(stakeAmount || '0'),
                })}
                className="w-full"
              >
                Stake ETH
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Unstake & Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={unstakeAmount} 
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Amount to unstake"
              />
              <Button 
                onClick={() => unstake({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'withdraw',
                  args: [parseEther(unstakeAmount || '0')],
                })}
                className="w-full"
                variant="secondary"
              >
                Unstake
              </Button>
              <Button 
                onClick={() => claimRewards({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'getReward',
                })}
                className="w-full"
                variant="outline"
              >
                Claim Rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
