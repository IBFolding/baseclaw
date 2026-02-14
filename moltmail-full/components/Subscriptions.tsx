'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Search, ExternalLink, Loader2, CheckCircle2, X, Crown } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSubscriptionsContract, useRegistryContract } from '@/hooks/useContracts';
import { formatDistanceToNow } from 'date-fns';

interface SubscriptionsProps {
  onClose?: () => void;
}

export function Subscriptions({ onClose }: SubscriptionsProps) {
  const { address, isConnected } = useAccount();
  const { 
    following, 
    followers, 
    followUser, 
    unfollowUser, 
    isFollowingUser, 
    isUnfollowing,
    refetchFollowing,
    refetchFollowers 
  } = useSubscriptionsContract();
  
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [followAddress, setFollowAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#6600ff]/20 flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-[#00f0ff]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">Connect your wallet to manage your subscriptions</p>
        </div>
      </div>
    );
  }

  const handleFollow = async () => {
    if (!followAddress || !followAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await followUser(followAddress);
      setSuccess(`Successfully followed ${followAddress.slice(0, 6)}...${followAddress.slice(-4)}`);
      setFollowAddress('');
      await refetchFollowing();
    } catch (err: any) {
      setError(err.message || 'Failed to follow user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowBack = async (addr: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await followUser(addr);
      setSuccess(`Successfully followed ${addr.slice(0, 6)}...${addr.slice(-4)}`);
      await refetchFollowing();
    } catch (err: any) {
      setError(err.message || 'Failed to follow user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfollow = async (userToUnfollow: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await unfollowUser(userToUnfollow);
      setSuccess(`Unfollowed ${userToUnfollow.slice(0, 6)}...${userToUnfollow.slice(-4)}`);
      await refetchFollowing();
    } catch (err: any) {
      setError(err.message || 'Failed to unfollow user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Filter lists based on search
  const followingList = Array.isArray(following) ? following : [];
  const followersList = Array.isArray(followers) ? followers : [];
  
  const filteredFollowing = followingList.filter((addr: string) => 
    addr.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFollowers = followersList.filter((addr: string) => 
    addr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#6600ff]/20 flex items-center justify-center">
            <Users size={20} className="text-[#00f0ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Subscriptions</h2>
            <p className="text-gray-500 text-sm">Manage who you follow and your followers</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-[#00f0ff]">{followingList.length}</div>
          <div className="text-sm text-gray-400">Following</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{followersList.length}</div>
          <div className="text-sm text-gray-400">Followers</div>
        </div>
      </div>

      {/* Follow New User */}
      <div className="px-6 pb-4">
        <div className="glass-card p-4">
          <label className="text-sm text-gray-400 mb-2 block">Follow New Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={followAddress}
              onChange={(e) => setFollowAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] text-sm"
            />
            <button
              onClick={handleFollow}
              disabled={isSubmitting || !followAddress}
              className="px-4 py-2 bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && isFollowingUser ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> {success}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search addresses..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'following' 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Following ({followingList.length})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'followers' 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Followers ({followersList.length})
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'following' ? (
          <div className="space-y-2">
            {filteredFollowing.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p>{searchQuery ? 'No matching addresses' : "You're not following anyone yet"}</p>
                <button
                  onClick={() => setFollowAddress('')}
                  className="mt-4 text-[#00f0ff] text-sm hover:underline"
                >
                  Follow your first address
                </button>
              </div>
            ) : (
              filteredFollowing.map((addr: string) => (
                <div
                  key={addr}
                  className="glass-card p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <div className="font-medium">{formatAddress(addr)}</div>
                      <div className="text-xs text-gray-500">
                        <a 
                          href={`https://basescan.org/address/${addr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#00f0ff] flex items-center gap-1"
                        >
                          View on Explorer <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollow(addr)}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Unfollow"
                  >
                    <UserMinus size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Crown size={32} className="mx-auto mb-2 opacity-50" />
                <p>{searchQuery ? 'No matching addresses' : "No followers yet"}</p>
                <p className="text-sm mt-2">Share your address to get followers!</p>
              </div>
            ) : (
              filteredFollowers.map((addr: string) => (
                <div
                  key={addr}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <div className="font-medium">{formatAddress(addr)}</div>
                      <div className="text-xs text-gray-500">
                        <a 
                          href={`https://basescan.org/address/${addr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#00f0ff] flex items-center gap-1"
                        >
                          View on Explorer <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollowBack(addr)}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg text-sm font-medium hover:bg-[#00f0ff]/30 transition-colors"
                  >
                    Follow Back
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
