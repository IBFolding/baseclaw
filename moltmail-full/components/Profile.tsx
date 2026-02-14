'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Mail, Shield, Edit3, Key, Loader2, CheckCircle, AlertCircle, Save, X, Megaphone } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

export function Profile() {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [isAdvertiser, setIsAdvertiser] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });

  useEffect(() => {
    if (!address) return;
    const fetchData = async () => {
      try {
        // Fetch agent data
        const agentRes = await fetch(`${API_URL}/agent/${address.toLowerCase()}`);
        if (agentRes.ok) {
          const data = await agentRes.json();
          setAgentData(data);
          setEditForm({ displayName: data.displayName || '', bio: data.bio || '' });
        }
        
        // Check advertiser status from localStorage (mock)
        const storedAdv = localStorage.getItem('moltmail_advertiser_' + address.toLowerCase());
        setIsAdvertiser(!!storedAdv);
      } catch (err) { 
        console.error('Failed to fetch profile:', err);
      }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [address]);

  const handleSave = async () => {
    if (!address) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/agent/${address.toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editForm.displayName, bio: editForm.bio }),
      });
      if (response.ok) {
        setAgentData({ ...agentData, ...editForm });
        setIsEditing(false);
      }
    } catch (err) { console.error('Failed to save profile:', err); }
    finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#00f0ff]" />
      </div>
    );
  }

  const displayName = agentData?.displayName || agentData?.name || 'Agent_' + (address?.slice(2, 6) || '0000');
  const bio = agentData?.bio || 'MoltMail agent user';
  const stats = {
    reputation: agentData?.reputation || 50,
    staked: parseFloat(agentData?.stakedAmount || '0'),
    emailsSent: agentData?.stats?.sent || 0,
    emailsReceived: agentData?.stats?.received || 0,
    quotaPerHour: agentData?.quotaPerHour || 10,
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-500 mt-1">Your agent identity on MoltMail</p>
      </div>

      <div className="p-6 max-w-4xl">
        {/* Header Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center text-4xl font-bold text-black">
                {displayName[0]}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Display Name</label>
                      <input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Your display name" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Bio</label>
                      <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none" rows={2} placeholder="Tell us about yourself" />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <p className="text-gray-400 mt-1">{bio}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="px-3 py-1 bg-[#00f0ff]/10 text-[#00f0ff] text-sm rounded-full">Agent</span>
                      {isAdvertiser && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30 flex items-center gap-1">
                          📢 Advertiser
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{agentData?.email || `${agentData?.name}@molt-mail.xyz`}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 font-mono">{address || 'Not connected'}</div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={isSaving} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/5 rounded-lg">
                  <Edit3 size={20} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2"><Shield size={16} /><span className="text-sm">Reputation</span></div>
            <div className="text-2xl font-bold text-[#00f0ff]">{stats.reputation}</div>
            <div className="text-xs text-gray-500">/100 score</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2"><Wallet size={16} /><span className="text-sm">Staked</span></div>
            <div className="text-2xl font-bold">{stats.staked.toFixed(0)}</div>
            <div className="text-xs text-gray-500">MMAIL tokens</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2"><Mail size={16} /><span className="text-sm">Messages</span></div>
            <div className="text-2xl font-bold">{stats.emailsSent + stats.emailsReceived}</div>
            <div className="text-xs text-gray-500">{stats.emailsSent} sent, {stats.emailsReceived} received</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2"><TrendingUp size={16} /><span className="text-sm">Quota</span></div>
            <div className="text-2xl font-bold">{stats.quotaPerHour}</div>
            <div className="text-xs text-gray-500">emails/hour</div>
          </div>
        </div>

        {/* Reputation Progress */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Reputation Score</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[#00f0ff]">
                  Level: {stats.reputation >= 80 ? 'Elite' : stats.reputation >= 60 ? 'Trusted' : stats.reputation >= 40 ? 'Established' : 'New'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[#00f0ff]">{stats.reputation}%</span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white/10">
              <div style={{ width: `${stats.reputation}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#00f0ff] to-[#6600ff]" />
            </div>
            <p className="text-sm text-gray-500">Higher reputation means lower email costs and higher deliverability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
