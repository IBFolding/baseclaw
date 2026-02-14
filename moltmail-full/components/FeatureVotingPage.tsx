'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Plus, Clock, CheckCircle, Wallet, AlertCircle, Users, Briefcase, Coins, Lock, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { API_URL, CONTRACTS, FEATURE_REGISTRY_ABI, MMAIL_TOKEN_ABI } from '@/lib/contracts';

interface Proposal {
  id: number;
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  status: string;
  forVotes: string;
  againstVotes: string;
  votingEnds: string;
  claimedBy: string | null;
  workUrl: string | null;
  completedAt: string | null;
  totalRewardPool: string;
  bondAmount: string;
  createdAt: string;
}

interface FeatureVotingPageProps {
  onBack: () => void;
}

export function FeatureVotingPage({ onBack }: FeatureVotingPageProps) {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'approved' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });
  const [mmailBalance, setMmailBalance] = useState('0');
  const [mmailAllowance, setMmailAllowance] = useState('0');

  // Contract reads
  const { data: balanceData } = useReadContract({
    address: CONTRACTS.mmailToken,
    abi: MMAIL_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: allowanceData } = useReadContract({
    address: CONTRACTS.mmailToken,
    abi: MMAIL_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.featureRegistry] : undefined,
  });

  // Contract writes
  const { writeContract: approveMMAIL } = useWriteContract();
  const { writeContract: createProposal } = useWriteContract();
  const { writeContract: vote } = useWriteContract();
  const { writeContract: claimWork } = useWriteContract();
  const { writeContract: submitWork } = useWriteContract();

  useEffect(() => {
    if (balanceData) setMmailBalance(formatEther(balanceData as bigint));
    if (allowanceData) setMmailAllowance(formatEther(allowanceData as bigint));
  }, [balanceData, allowanceData]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_URL}/features`);
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    approveMMAIL({
      address: CONTRACTS.mmailToken,
      abi: MMAIL_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACTS.featureRegistry, parseEther('50')],
    });
  };

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) return;
    
    createProposal({
      address: CONTRACTS.featureRegistry,
      abi: FEATURE_REGISTRY_ABI,
      functionName: 'createProposal',
      args: [newProposal.title, newProposal.description],
    }, {
      onSuccess: async (txHash) => {
        // Submit to backend
        try {
          await fetch(`${API_URL}/features`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newProposal.title,
              description: newProposal.description,
              bondAmount: 50,
              txHash,
            }),
          });
          setShowCreateModal(false);
          setNewProposal({ title: '', description: '' });
          fetchProposals();
        } catch (error) {
          console.error('Failed to submit to backend:', error);
        }
      }
    });
  };

  const handleVote = (proposalId: number, support: boolean) => {
    vote({
      address: CONTRACTS.featureRegistry,
      abi: FEATURE_REGISTRY_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId), support],
    });
  };

  const handleClaimWork = (proposalId: number) => {
    claimWork({
      address: CONTRACTS.featureRegistry,
      abi: FEATURE_REGISTRY_ABI,
      functionName: 'claimWork',
      args: [BigInt(proposalId)],
    });
  };

  const filteredProposals = proposals.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return p.status === 'Active';
    if (activeTab === 'approved') return ['Approved', 'Claimed', 'InProgress'].includes(p.status);
    if (activeTab === 'completed') return ['Completed', 'Rewarded'].includes(p.status);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00f0ff]"></div>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <ProposalDetail 
        proposal={selectedProposal} 
        onBack={() => setSelectedProposal(null)}
        onVote={handleVote}
        onClaim={() => handleClaimWork(selectedProposal.proposalId)}
        isConnected={isConnected}
        mmailBalance={mmailBalance}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">FeatureDAO</h1>
            <p className="text-sm text-gray-500">Governance for MoltMail features</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glow-btn flex items-center gap-2"
          disabled={!isConnected || parseFloat(mmailBalance) < 50}
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total Proposals</p>
          <p className="text-2xl font-bold">{proposals.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-[#00f0ff]">{proposals.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-[#00ff80]">{proposals.filter(p => ['Approved', 'Claimed', 'InProgress'].includes(p.status)).length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Your MMAIL</p>
          <p className="text-2xl font-bold text-[#ff00ff]">{parseInt(mmailBalance).toLocaleString()}</p>
        </div>
      </div>

      {/* Reward Split Info */}
      <div className="glass-card p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-400">Reward Distribution</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#00f0ff]/10 rounded p-2">
            <p className="text-lg font-bold text-[#00f0ff]">55%</p>
            <p className="text-xs text-gray-500">Workers</p>
          </div>
          <div className="bg-[#00ff80]/10 rounded p-2">
            <p className="text-lg font-bold text-[#00ff80]">20%</p>
            <p className="text-xs text-gray-500">Voters</p>
          </div>
          <div className="bg-red-500/10 rounded p-2">
            <p className="text-lg font-bold text-red-400">10%</p>
            <p className="text-xs text-gray-500">Burn 🔥</p>
          </div>
          <div className="bg-[#6600ff]/10 rounded p-2">
            <p className="text-lg font-bold text-[#6600ff]">15%</p>
            <p className="text-xs text-gray-500">Treasury</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'approved', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 mb-4">No proposals found</p>
            <button onClick={() => setShowCreateModal(true)} className="glow-btn">
              Create the first proposal
            </button>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              onClick={() => setSelectedProposal(proposal)}
              className="glass-card p-6 cursor-pointer hover:border-[#00f0ff]/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-sm">#{proposal.proposalId}</span>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{proposal.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <VoteBar forVotes={proposal.forVotes} againstVotes={proposal.againstVotes} />
                    {parseFloat(proposal.totalRewardPool) > 0 && (
                      <span className="text-[#ff00ff]">
                        {parseInt(proposal.totalRewardPool).toLocaleString()} MMAIL reward
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Create Proposal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00f0ff] focus:outline-none"
                  placeholder="Enter proposal title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00f0ff] focus:outline-none h-32"
                  placeholder="Describe your proposal"
                />
              </div>

              <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-lg p-4">
                <p className="text-sm text-[#00f0ff]">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Requires 50 MMAIL bond. This will be returned if approved.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {parseFloat(mmailAllowance) < 50 ? (
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg hover:bg-[#00f0ff]/30 transition-colors"
                  >
                    Approve 50 MMAIL
                  </button>
                ) : (
                  <button
                    onClick={handleCreateProposal}
                    disabled={!newProposal.title || !newProposal.description}
                    className="flex-1 glow-btn disabled:opacity-50"
                  >
                    Create Proposal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Active': 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30',
    'Approved': 'bg-[#00ff80]/20 text-[#00ff80] border-[#00ff80]/30',
    'Claimed': 'bg-[#6600ff]/20 text-[#6600ff] border-[#6600ff]/30',
    'InProgress': 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/30',
    'Completed': 'bg-[#00ff80]/20 text-[#00ff80] border-[#00ff80]/30',
    'Rewarded': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-white/10 text-gray-400'}`}>
      {status}
    </span>
  );
}

function VoteBar({ forVotes, againstVotes }: { forVotes: string; againstVotes: string }) {
  const forV = parseFloat(forVotes);
  const againstV = parseFloat(againstVotes);
  const total = forV + againstV;
  const percentage = total > 0 ? (forV / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff80]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-gray-400">{total.toLocaleString()} votes</span>
    </div>
  );
}

function ProposalDetail({ proposal, onBack, onVote, onClaim, isConnected, mmailBalance }: any) {
  const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes);
  const forPercentage = totalVotes > 0 ? (parseFloat(proposal.forVotes) / totalVotes) * 100 : 50;
  const isVotingActive = proposal.status === 'Active' && new Date(proposal.votingEnds) > new Date();

  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to proposals
      </button>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-500">#{proposal.proposalId}</span>
          <StatusBadge status={proposal.status} />
        </div>

        <h1 className="text-2xl font-bold mb-4">{proposal.title}</h1>
        <p className="text-gray-300 whitespace-pre-wrap mb-6">{proposal.description}</p>

        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold mb-4">Voting</h3>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#00ff80]">For: {parseFloat(proposal.forVotes).toLocaleString()}</span>
            <span className="text-red-400">Against: {parseFloat(proposal.againstVotes).toLocaleString()}</span>
          </div>
          
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff80]"
              style={{ width: `${forPercentage}%` }}
            />
          </div>

          {isVotingActive && isConnected && (
            <div className="flex gap-3">
              <button 
                onClick={() => onVote(proposal.proposalId, true)}
                className="flex-1 py-2 bg-[#00ff80]/20 text-[#00ff80] border border-[#00ff80]/30 rounded-lg hover:bg-[#00ff80]/30 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 inline mr-2" />
                Vote For
              </button>
              <button 
                onClick={() => onVote(proposal.proposalId, false)}
                className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <ThumbsDown className="w-4 h-4 inline mr-2" />
                Vote Against
              </button>
            </div>
          )}
        </div>

        {proposal.status === 'Approved' && !proposal.claimedBy && (
          <div className="glass-card p-4 mb-6">
            <h3 className="font-semibold mb-2">Claim Work</h3>
            <p className="text-gray-400 text-sm mb-4">This proposal is approved and ready for development.</p>
            <button onClick={onClaim} className="glow-btn w-full">
              Claim This Work
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Bond Amount</p>
            <p className="text-xl font-bold">{parseInt(proposal.bondAmount).toLocaleString()} MMAIL</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Reward Pool</p>
            <p className="text-xl font-bold text-[#ff00ff]">{parseInt(proposal.totalRewardPool || '0').toLocaleString()} MMAIL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
