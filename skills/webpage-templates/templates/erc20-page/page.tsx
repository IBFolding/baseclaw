import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// CONTRACT_CONFIG - auto-populated by BaseClaw
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = []; // Auto-populated by BaseClaw

export default function TokenPage() {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'name',
  });
  
  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'symbol',
  });
  
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });
  
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  const { writeContract: transfer } = useWriteContract();
  const { writeContract: mint } = useWriteContract();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {name || 'Token'} ({symbol || 'TKN'})
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Supply</Label>
                <p className="text-2xl font-mono">{totalSupply ? formatEther(totalSupply) : '0'}</p>
              </div>
              <div>
                <Label>Your Balance</Label>
                <p className="text-2xl font-mono">{balance ? formatEther(balance) : '0'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient</Label>
                <Input 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <Button 
                onClick={() => transfer({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'transfer',
                  args: [recipient, parseEther(amount)],
                })}
                className="w-full"
              >
                Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
