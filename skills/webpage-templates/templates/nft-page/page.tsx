import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// CONTRACT_CONFIG - auto-populated by BaseClaw
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = []; // Auto-populated by BaseClaw

export default function NFTPage() {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState('');
  
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
  
  const { data: ownerOf } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ownerOf',
    args: [tokenId ? BigInt(tokenId) : 0n],
  });
  
  const { writeContract: mint } = useWriteContract();
  const { writeContract: transfer } = useWriteContract();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {name || 'NFT Collection'} ({symbol || 'NFT'})
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Total Minted</label>
                <p className="text-2xl font-mono">{totalSupply ? totalSupply.toString() : '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Contract Address</label>
                <p className="text-sm font-mono break-all">{CONTRACT_ADDRESS}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mint NFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => mint({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'mint',
                  args: [address],
                  value: parseEther('0.01'),
                })}
                className="w-full"
              >
                Mint NFT (0.01 ETH)
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lookup Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={tokenId} 
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Token ID"
              />
              {ownerOf && (
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-sm font-mono break-all">{ownerOf}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
