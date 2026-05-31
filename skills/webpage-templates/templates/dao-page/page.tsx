import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// CONTRACT_CONFIG - auto-populated by BaseClaw
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = []; // Auto-populated by BaseClaw

export default function DAOPage() {
  const { address } = useAccount();
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalTarget, setProposalTarget] = useState('');
  const [proposalValue, setProposalValue] = useState('');
  
  const { data: proposalCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'proposalCount',
  });
  
  const { data: votingPower } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVotes',
    args: [address],
  });
  
  const { writeContract: createProposal } = useWriteContract();
  const { writeContract: vote } = useWriteContract();
  const { writeContract: execute } = useWriteContract();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          DAO Governance
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>DAO Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Total Proposals</label>
                <p className="text-2xl font-mono">{proposalCount ? proposalCount.toString() : '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Your Voting Power</label>
                <p className="text-2xl font-mono">{votingPower ? formatEther(votingPower) : '0'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Create Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={proposalDesc} 
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Proposal description"
              />
              <Input 
                value={proposalTarget} 
                onChange={(e) => setProposalTarget(e.target.value)}
                placeholder="Target address"
              />
              <Input 
                value={proposalValue} 
                onChange={(e) => setProposalValue(e.target.value)}
                placeholder="Value (ETH)"
              />
              <Button 
                onClick={() => createProposal({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'propose',
                  args: [proposalTarget, parseEther(proposalValue || '0'), proposalDesc],
                })}
                className="w-full"
              >
                Create Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
