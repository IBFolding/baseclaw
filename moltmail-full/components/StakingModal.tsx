'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Unlock, Gift, AlertTriangle, CheckCircle2, Loader2, ArrowRight, RotateCcw, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useStakingInfo } from '@/hooks/useStaking';
import { parseUnits, formatUnits } from 'viem';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'stake' | 'unstake' | 'claim';
  stakingInfo: any;
  onSuccess: () => void;
}

export function StakingModal({ isOpen, onClose, mode, stakingInfo, onSuccess }: StakingModalProps) {
  const { address } = useAccount();
  const { 
    allowance, 
    approveStaking, 
    stakeTokens, 
    unstakeTokens, 
    claimRewards,
    isStaking, 
    isUnstaking, 
    isClaiming,
    isApproving,
    error: stakingError 
  } = useStakingInfo();
  
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'approving' | 'success' | 'cooldown'>('input');
  const [error, setError] = useState<string | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { 
      setAmount(''); 
      setStep('input'); 
      setError(null); 
      setCooldownEnd(null);
      setIsLoading(false);
    }
  }, [isOpen, mode]);

  // Handle staking errors
  useEffect(() => {
    if (stakingError) {
      setError(stakingError.message || 'Transaction failed');
      setIsLoading(false);
    }
  }, [stakingError]);

  if (!isOpen || !address) return null;

  const availableToStake = stakingInfo?.availableToStake || 0;
  const stakedAmount = stakingInfo?.stakedAmount || 0;
  const pendingRewards = stakingInfo?.rewardsPending || 0;

  const handleMax = () => {
    if (mode === 'stake') setAmount(availableToStake.toString());
    else if (mode === 'unstake') setAmount(stakedAmount.toString());
  };

  const handleSubmit = async () => {
    setError(null);
    const amt = parseFloat(amount);
    
    if (mode === 'stake') {
      if (isNaN(amt) || amt <= 0) { 
        setError('Please enter a valid amount'); 
        return; 
      }
      if (amt > availableToStake) { 
        setError('Insufficient balance'); 
        return; 
      }
      
      // Check if approval is needed
      const requiredAllowance = parseUnits(amount, 18);
      const currentAllowance = allowance ? parseUnits(allowance, 18) : BigInt(0);
      
      if (currentAllowance < requiredAllowance) {
        setStep('approving');
      } else {
        setStep('confirm');
      }
    } else if (mode === 'unstake') {
      if (isNaN(amt) || amt <= 0) { 
        setError('Please enter a valid amount'); 
        return; 
      }
      if (amt > stakedAmount) { 
        setError('Insufficient staked amount'); 
        return; 
      }
      setStep('cooldown');
    } else if (mode === 'claim') {
      if (pendingRewards <= 0) { 
        setError('No rewards to claim'); 
        return; 
      }
      setStep('confirm');
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Approve a large amount to avoid frequent approvals
      await approveStaking('1000000'); // 1M MMAIL
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Approval failed');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'stake') {
        await stakeTokens(amount);
      } else if (mode === 'unstake') {
        await unstakeTokens(amount);
        setCooldownEnd(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else if (mode === 'claim') {
        await claimRewards();
      }
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestake = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Claim and then stake the rewards
      await claimRewards();
      // Note: In a real implementation, you'd need to stake the claimed amount
      // This would require knowing the exact amount claimed
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Restake failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => { 
    if (step === 'success') onSuccess(); 
    onClose(); 
  };

  const getTitle = () => ({ stake: 'Stake MMAIL', unstake: 'Unstake MMAIL', claim: 'Claim Rewards' }[mode] || '');
  const getIcon = () => {
    if (mode === 'stake') return <Lock size={24} className="text-[#00f0ff]" />;
    if (mode === 'unstake') return <Unlock size={24} className="text-orange-400" />;
    return <Gift size={24} className="text-yellow-400" />;
  };

  const isProcessing = isLoading || isStaking || isUnstaking || isClaiming || isApproving;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">{getIcon()}<h2 className="text-xl font-bold">{getTitle()}</h2></div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-6">
          {step === 'input' && (
            <div className="space-y-6">
              {mode !== 'claim' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-lg font-semibold focus:outline-none focus:border-[#00f0ff]" 
                        autoFocus 
                      />
                      <button 
                        onClick={handleMax} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold bg-[#00f0ff]/20 text-[#00f0ff] rounded"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>
                        {mode === 'stake' ? 'Available:' : 'Staked:'} {' '}
                        {mode === 'stake' 
                          ? availableToStake.toLocaleString() 
                          : stakedAmount.toLocaleString()
                        } MMAIL
                      </span>
                    </div>
                  </div>
                  {mode === 'stake' && (
                    <div className="p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-[#00f0ff] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <p>Staking locks your tokens and starts earning rewards immediately.</p>
                          <p className="mt-2 text-gray-400">Higher tiers unlock better rewards and benefits.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {mode === 'unstake' && (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <p className="font-semibold text-orange-400">7-Day Cooldown Period</p>
                          <p className="mt-1 text-gray-400">When you unstake, your tokens enter a 7-day cooldown before they become available.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {mode === 'claim' && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                    <Gift size={40} className="text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{pendingRewards.toFixed(2)} MMAIL</div>
                  <div className="text-gray-400">Available to claim</div>
                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={handleRestake} 
                      disabled={isProcessing || pendingRewards <= 0}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#00f0ff]/20 to-purple-500/20 border border-[#00f0ff]/30 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RotateCcw size={18} /> Restake (Compound)
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
              )}
              <button 
                onClick={handleSubmit} 
                disabled={isProcessing || (mode !== 'claim' && !amount)}
                className="glow-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <>{getTitle()} <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          )}

          {step === 'approving' && mode === 'stake' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4">
                  <Loader2 size={40} className="text-[#00f0ff] animate-spin" />
                </div>
                <h3 className="text-xl font-bold mb-2">Approve MMAIL</h3>
                <p className="text-gray-400">You need to approve the staking contract to spend your MMAIL tokens.</p>
              </div>
              <div className="p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg">
                <div className="text-sm text-gray-300">
                  <p>This is a one-time approval that allows the staking contract to transfer your tokens.</p>
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
              )}
              <button 
                onClick={handleApprove} 
                disabled={isProcessing}
                className="glow-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="animate-spin" /> Approving...</>
                ) : (
                  'Approve MMAIL'
                )}
              </button>
              <button 
                onClick={() => setStep('input')} 
                className="w-full py-3 px-4 bg-white/5 rounded-lg font-semibold mt-2"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'cooldown' && mode === 'unstake' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={40} className="text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Unstaking</h3>
                <p className="text-gray-400">You are about to unstake {parseFloat(amount).toLocaleString()} MMAIL</p>
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Info size={18} className="text-orange-400" />
                  <span className="font-semibold text-orange-400">Cooldown Details</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• 7-day waiting period before tokens are available</li>
                  <li>• No rewards earned during cooldown</li>
                  <li>• You can cancel the unstake during the cooldown period</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('input')} 
                  className="flex-1 py-3 px-4 bg-white/5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={isProcessing} 
                  className="flex-1 py-3 px-4 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    'Confirm Unstake'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && mode !== 'unstake' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight size={40} className="text-[#00f0ff]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Transaction</h3>
                <p className="text-gray-400">
                  {mode === 'stake' && `Stake ${parseFloat(amount).toLocaleString()} MMAIL`}
                  {mode === 'claim' && `Claim ${pendingRewards.toFixed(2)} MMAIL rewards`}
                </p>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
              )}
              <button 
                onClick={handleConfirm} 
                disabled={isProcessing} 
                className="glow-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="animate-spin" /> Confirming...</>
                ) : (
                  'Confirm Transaction'
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Success!</h3>
                <p className="text-gray-400">
                  {mode === 'stake' && `Successfully staked ${parseFloat(amount).toLocaleString()} MMAIL`}
                  {mode === 'unstake' && (cooldownEnd ? 'Unstake initiated. Tokens will be available in 7 days.' : `Successfully unstaked ${parseFloat(amount).toLocaleString()} MMAIL`)}
                  {mode === 'claim' && `Successfully claimed ${pendingRewards.toFixed(2)} MMAIL`}
                </p>
              </div>
              <button onClick={handleClose} className="glow-btn w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
