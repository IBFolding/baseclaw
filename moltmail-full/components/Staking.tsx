'use client';

import { useState } from 'react';
import { TrendingUp, Wallet, Clock, Gift, Zap, Shield, HelpCircle, Lock, Unlock, RotateCcw, CheckCircle2, Crown, Gem, Medal, Star } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useStakingInfo, getCurrentTier, getNextTier, calculateTierProgress, STAKING_TIERS } from '@/hooks/useStaking';
import { StakingModal } from './StakingModal';
import { formatDistanceToNow } from 'date-fns';

export function Staking() {
  const { address, isConnected } = useAccount();
  const { stakingInfo, isLoading, refetch } = useStakingInfo();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'stake' | 'unstake' | 'claim'>('stake');
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'rewards' | 'faq'>('overview');

  const handleStake = () => { setModalMode('stake'); setShowModal(true); };
  const handleUnstake = () => { setModalMode('unstake'); setShowModal(true); };
  const handleClaim = () => { setModalMode('claim'); setShowModal(true); };

  // Calculate total rewards
  const totalRewards = (stakingInfo?.rewardsEarned || 0) + (stakingInfo?.rewardsPending || 0);

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#6600ff]/20 flex items-center justify-center mx-auto mb-4">
            <Wallet size={40} className="text-[#00f0ff]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">Connect your wallet to view your MMAIL staking dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  const stakedAmount = stakingInfo?.stakedAmount || 0;
  const currentTier = getCurrentTier(stakedAmount);
  const nextTier = getNextTier(stakedAmount);
  const tierProgress = calculateTierProgress(stakedAmount, nextTier);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-[#00f0ff]" /> MMAIL Staking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Stake MMAIL to earn rewards and unlock benefits</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="p-2 hover:bg-white/5 rounded-lg">
          <HelpCircle size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Info Banner */}
      {showInfo && (
        <div className="mx-6 mt-4 p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-sm text-gray-300">
              <p className="mb-2 font-semibold text-[#00f0ff]">How Staking Works</p>
              <ol className="space-y-2 text-gray-400 list-decimal list-inside">
                <li><strong className="text-white">Validate:</strong> Stake minimum 100 MMAIL to validate your wallet and unlock platform features</li>
                <li><strong className="text-white">Earn:</strong> Receive a share of all subscription fees paid by users</li>
                <li><strong className="text-white">Higher Tier = More Rewards:</strong> Stakers earn proportionally more based on their tier level</li>
                <li><strong className="text-white">Revenue Split:</strong> 60% of all subscription fees go to stakers, distributed by tier weight</li>
              </ol>
              <p className="mt-3 text-xs text-gray-500">APY varies based on platform usage and total staked amount. Rewards accrue daily.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 mt-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
          {(['overview', 'tiers', 'rewards', 'faq'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:text-white'
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Total Staked</span>
                  <Lock size={16} className="text-[#00f0ff]" />
                </div>
                <div className="text-2xl font-bold">{stakedAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">MMAIL tokens</div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Available</span>
                  <Wallet size={16} className="text-green-400" />
                </div>
                <div className="text-2xl font-bold">{(stakingInfo?.availableToStake || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">MMAIL to stake</div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Rewards Available</span>
                  <Gift size={16} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-bold">{(stakingInfo?.rewardsPending || 0).toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">MMAIL pending claim</div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">APY</span>
                  <TrendingUp size={16} className="text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-[#00f0ff]">{stakingInfo?.apy || 0}%</div>
                <div className="text-xs text-gray-500 mt-1">Annual yield</div>
              </div>
            </div>

            {/* Current Tier Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {currentTier ? (
                    <>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTier.color}20` }}>
                        {currentTier.id === 'wood' && <span className="text-2xl">🪵</span>}
                        {currentTier.id === 'bronze' && <Medal size={24} style={{ color: currentTier.color }} />}
                        {currentTier.id === 'silver' && <Star size={24} style={{ color: currentTier.color }} />}
                        {currentTier.id === 'gold' && <Crown size={24} style={{ color: currentTier.color }} />}
                        {currentTier.id === 'platinum' && <Gem size={24} style={{ color: currentTier.color }} />}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Current Tier</div>
                        <div className="text-xl font-bold" style={{ color: currentTier.color }}>{currentTier.name}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><Shield size={24} className="text-gray-400" /></div>
                      <div><div className="text-sm text-gray-400">Current Tier</div><div className="text-xl font-bold text-gray-400">No Tier</div></div>
                    </>
                  )}
                </div>
                {nextTier && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Next Tier</div>
                    <div className="text-lg font-semibold" style={{ color: nextTier.color }}>{nextTier.name}</div>
                  </div>
                )}
              </div>

              {nextTier && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress to {nextTier.name}</span>
                    <span className="text-[#00f0ff]">{tierProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#6600ff]" style={{ width: `${tierProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stakedAmount.toLocaleString()} MMAIL</span>
                    <span>{nextTier.minAmount.toLocaleString()} MMAIL</span>
                  </div>
                </div>
              )}

              {currentTier && (
                <div className="flex flex-wrap gap-2">
                  {currentTier.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-400" /> {benefit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleStake} className="glow-btn flex items-center justify-center gap-2">
                <Lock size={18} /> Stake MMAIL
              </button>
              <button onClick={handleUnstake} className="py-3 px-6 bg-white/10 hover:bg-white/20 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Unlock size={18} /> Unstake
              </button>
              <button onClick={handleClaim} disabled={!stakingInfo?.rewardsPending || stakingInfo.rewardsPending <= 0} className="py-3 px-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg font-semibold flex items-center justify-center gap-2 text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <Gift size={18} /> Claim {(stakingInfo?.rewardsPending || 0).toFixed(2)} MMAIL
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Staking Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STAKING_TIERS.map((tier) => {
                const isCurrentTier = currentTier?.id === tier.id;
                const isLocked = stakedAmount < tier.minAmount;
                return (
                  <div key={tier.id} className={`glass-card p-5 relative ${isCurrentTier ? 'border-[#00f0ff]/50' : ''} ${isLocked ? 'opacity-60' : ''}`}>
                    {isCurrentTier && <div className="absolute top-3 right-3 px-2 py-1 bg-[#00f0ff] text-black text-xs font-bold rounded">CURRENT</div>}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                        {tier.id === 'wood' && <span className="text-xl">🪵</span>}
                        {tier.id === 'bronze' && <Medal size={20} style={{ color: tier.color }} />}
                        {tier.id === 'silver' && <Star size={20} style={{ color: tier.color }} />}
                        {tier.id === 'gold' && <Crown size={20} style={{ color: tier.color }} />}
                        {tier.id === 'platinum' && <Gem size={20} style={{ color: tier.color }} />}
                      </div>
                      <div>
                        <div className="font-bold text-lg" style={{ color: tier.color }}>{tier.name}</div>
                        <div className="text-xs text-gray-400">{tier.minAmount.toLocaleString()} MMAIL minimum</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle2 size={14} className="text-green-400" /> {benefit}
                        </div>
                      ))}
                    </div>
                    {isLocked && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Lock size={14} /> Need {(tier.minAmount - stakedAmount).toLocaleString()} more MMAIL
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center"><div className="text-3xl font-bold text-[#00f0ff]">{stakingInfo?.apr || 0}%</div><div className="text-sm text-gray-400 mt-1">Current APR</div></div>
              <div className="glass-card p-5 text-center"><div className="text-3xl font-bold text-purple-400">{(stakingInfo?.apy || 0).toFixed(1)}%</div><div className="text-sm text-gray-400 mt-1">Current APY</div></div>
              <div className="glass-card p-5 text-center"><div className="text-3xl font-bold text-green-400">Daily</div><div className="text-sm text-gray-400 mt-1">Reward distribution</div></div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-bold mb-4">Reward History</h3>
              {stakingInfo?.rewardHistory && stakingInfo.rewardHistory.length > 0 ? (
                <div className="space-y-3">
                  {stakingInfo.rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00f0ff]/20">
                          <TrendingUp size={14} className="text-[#00f0ff]" />
                        </div>
                        <div>
                          <div className="font-medium capitalize">{reward.type} Reward</div>
                          <div className="text-xs text-gray-500">{formatDistanceToNow(reward.timestamp, { addSuffix: true })}</div>
                        </div>
                      </div>
                      <div className="font-bold text-green-400">+{reward.amount.toFixed(2)} MMAIL</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No rewards yet. Start staking to earn!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
            {[
              { q: 'How does staking work?', a: 'When you stake MMAIL tokens, they are locked in the staking contract and you begin earning rewards based on your tier.' },
              { q: 'What is the cooldown period?', a: 'When you unstake, there is a 7-day cooldown period before your tokens become available.' },
              { q: 'How are rewards calculated?', a: 'Rewards come from 15% of all subscription revenue, distributed to stakers proportionally.' },
            ].map((faq, idx) => (
              <div key={idx} className="glass-card p-4">
                <div className="font-semibold text-[#00f0ff] mb-2">{faq.q}</div>
                <div className="text-sm text-gray-400">{faq.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StakingModal isOpen={showModal} onClose={() => setShowModal(false)} mode={modalMode} stakingInfo={stakingInfo} onSuccess={() => { refetch(); }} />
    </div>
  );
}
