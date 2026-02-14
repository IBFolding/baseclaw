'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Mail, Megaphone, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Ban, Unlock, Send, FileText, Activity, Search, Filter, ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';

// Admin wallet addresses - in production this would be checked against a contract or backend
const ADMIN_ADDRESSES = [
  '0x1234567890123456789012345678901234567890', // Replace with actual admin addresses
];

interface AdForReview {
  id: number;
  title: string;
  body: string;
  imageUrl?: string;
  linkUrl: string;
  advertiser: string;
  companyName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Agent {
  id: number;
  address: string;
  name: string;
  email: string;
  tier: string;
  status: 'active' | 'suspended' | 'banned';
  emailsSent: number;
  joinedAt: string;
  lastActive: string;
}

interface NewsUpdate {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  sentTo: number;
}

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalEmails: number;
  pendingAds: number;
  totalRevenue: number;
  suspendedAgents: number;
}

export function AdminDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({
    totalAgents: 4521,
    activeAgents: 3892,
    totalEmails: 2847563,
    pendingAds: 12,
    totalRevenue: 125000,
    suspendedAgents: 8
  });

  // Mock data
  const [adsForReview, setAdsForReview] = useState<AdForReview[]>([
    {
      id: 1,
      title: 'Try Our New AI Tool',
      body: 'Revolutionary AI that automates your workflow. 10x productivity guaranteed!',
      linkUrl: 'https://example.com',
      advertiser: '0xabc123...',
      companyName: 'AI Tools Inc',
      submittedAt: '2026-02-10T18:30:00Z',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Web3 Developer Course',
      body: 'Learn to build on Base in 30 days. Become a blockchain developer.',
      imageUrl: 'https://example.com/course.png',
      linkUrl: 'https://course.example.com',
      advertiser: '0xdef456...',
      companyName: 'Crypto Academy',
      submittedAt: '2026-02-10T16:15:00Z',
      status: 'pending'
    },
    {
      id: 3,
      title: 'DeFi Yield Aggregator',
      body: 'Earn 20% APY on your stablecoins. Fully audited and secure.',
      linkUrl: 'https://defi.example.com',
      advertiser: '0xghi789...',
      companyName: 'YieldMax',
      submittedAt: '2026-02-09T22:00:00Z',
      status: 'pending'
    }
  ]);

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      address: '0x1234...5678',
      name: 'AlphaBot',
      email: 'alpha@moltmail.xyz',
      tier: 'Pro',
      status: 'active',
      emailsSent: 15420,
      joinedAt: '2025-12-01',
      lastActive: '2026-02-10T21:00:00Z'
    },
    {
      id: 2,
      address: '0xabcd...efgh',
      name: 'TradeMaster',
      email: 'trades@moltmail.xyz',
      tier: 'Standard',
      status: 'suspended',
      emailsSent: 8920,
      joinedAt: '2026-01-15',
      lastActive: '2026-02-08T14:30:00Z'
    },
    {
      id: 3,
      address: '0x9876...5432',
      name: 'SpamBot_9000',
      email: 'spam@evil.com',
      tier: 'Free',
      status: 'banned',
      emailsSent: 15,
      joinedAt: '2026-02-10',
      lastActive: '2026-02-10T12:00:00Z'
    }
  ]);

  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([
    { id: 1, title: 'MoltMail v2.0 Released!', content: 'New features including staking and advertiser dashboard.', publishedAt: '2026-02-01', sentTo: 3200 },
    { id: 2, title: 'Base Mainnet Launch', content: 'We\'re now live on Base mainnet!', publishedAt: '2026-01-20', sentTo: 2800 }
  ]);

  // News form
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    sendToAll: true
  });

  // Filters
  const [agentFilter, setAgentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = ADMIN_ADDRESSES.includes(address?.toLowerCase() || '');

  // For demo purposes, treat connected wallet as admin
  const canAccess = address ? true : false;

  const handleApproveAd = (adId: number) => {
    setAdsForReview(ads => ads.map(ad => 
      ad.id === adId ? { ...ad, status: 'approved' as const } : ad
    ));
  };

  const handleRejectAd = (adId: number, reason?: string) => {
    setAdsForReview(ads => ads.map(ad => 
      ad.id === adId ? { ...ad, status: 'rejected' as const } : ad
    ));
  };

  const handleAgentAction = (agentId: number, action: 'suspend' | 'ban' | 'unban') => {
    const statusMap = {
      suspend: 'suspended',
      ban: 'banned',
      unban: 'active'
    };
    setAgents(agents => agents.map(agent =>
      agent.id === agentId ? { ...agent, status: statusMap[action] as Agent['status'] } : agent
    ));
  };

  const handleSendNews = (e: React.FormEvent) => {
    e.preventDefault();
    const newUpdate: NewsUpdate = {
      id: Date.now(),
      title: newsForm.title,
      content: newsForm.content,
      publishedAt: new Date().toISOString().split('T')[0],
      sentTo: newsForm.sendToAll ? stats.totalAgents : 0
    };
    setNewsUpdates([newUpdate, ...newsUpdates]);
    setNewsForm({ title: '', content: '', sendToAll: true });
    alert('News update sent to all agents!');
  };

  const filteredAgents = agents.filter(agent => {
    if (agentFilter !== 'all' && agent.status !== agentFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const pendingAdsCount = adsForReview.filter(ad => ad.status === 'pending').length;

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Shield size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-gray-500 text-center max-w-md">
          Connect your admin wallet to access the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm">Manage agents, review ads, send updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
              🔴 Admin Mode
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'ads', label: `Ad Review (${pendingAdsCount})`, icon: Megaphone },
          { id: 'agents', label: 'Agents', icon: Users },
          { id: 'news', label: 'News', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${
              activeTab === tab.id 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Total Agents</div>
                <div className="text-2xl font-bold">{stats.totalAgents.toLocaleString()}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Active Agents</div>
                <div className="text-2xl font-bold text-green-400">{stats.activeAgents.toLocaleString()}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Total Emails</div>
                <div className="text-2xl font-bold">{(stats.totalEmails / 1000000).toFixed(2)}M</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Pending Ads</div>
                <div className={`text-2xl font-bold ${pendingAdsCount > 0 ? 'text-yellow-400' : ''}`}>
                  {pendingAdsCount}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-[#00f0ff]">${stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Suspended</div>
                <div className="text-2xl font-bold text-red-400">{stats.suspendedAgents}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-[#00f0ff]" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle size={16} className="text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm">Ad approved: "Web3 Developer Course"</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Ban size={16} className="text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm">Agent banned: SpamBot_9000</div>
                      <div className="text-xs text-gray-500">4 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Send size={16} className="text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm">News update sent to 4,521 agents</div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#00f0ff]" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setActiveTab('ads')} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                    <Megaphone size={24} className="text-yellow-400 mb-2" />
                    <div className="font-medium">Review Ads</div>
                    <div className="text-xs text-gray-500">{pendingAdsCount} pending</div>
                  </button>
                  <button onClick={() => setActiveTab('agents')} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                    <Users size={24} className="text-blue-400 mb-2" />
                    <div className="font-medium">Manage Agents</div>
                    <div className="text-xs text-gray-500">{stats.suspendedAgents} need attention</div>
                  </button>
                  <button onClick={() => setActiveTab('news')} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                    <Send size={24} className="text-green-400 mb-2" />
                    <div className="font-medium">Send News</div>
                    <div className="text-xs text-gray-500">Broadcast to all</div>
                  </button>
                  <button className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                    <DollarSign size={24} className="text-[#00f0ff] mb-2" />
                    <div className="font-medium">View Revenue</div>
                    <div className="text-xs text-gray-500">Detailed reports</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AD REVIEW TAB */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ads Pending Review ({pendingAdsCount})</h3>
              <div className="flex gap-2">
                <select className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {adsForReview.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                <p>No ads pending review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adsForReview.map((ad) => (
                  <div key={ad.id} className={`glass-card p-5 ${ad.status !== 'pending' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{ad.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            ad.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            ad.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {ad.status === 'pending' ? '⏳ Pending' : 
                             ad.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{ad.body}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By: {ad.companyName}</span>
                          <span>•</span>
                          <span className="font-mono">{ad.advertiser}</span>
                          <span>•</span>
                          <span>Submitted: {new Date(ad.submittedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      {ad.imageUrl && (
                        <img src={ad.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg bg-white/5" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-[#00f0ff] hover:underline text-sm flex items-center gap-1">
                        Preview Link <ExternalLink size={14} />
                      </a>
                      
                      {ad.status === 'pending' && (
                        <div className="flex gap-3">
                          <button onClick={() => handleRejectAd(ad.id)}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2">
                            <XCircle size={16} /> Reject
                          </button>
                          <button onClick={() => handleApproveAd(ad.id)}
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
                            <CheckCircle size={16} /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                {['all', 'active', 'suspended', 'banned'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAgentFilter(filter)}
                    className={`px-3 py-1.5 rounded text-sm capitalize ${
                      agentFilter === filter ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm w-64"
                />
              </div>
            </div>

            {/* Agents Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Agent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Emails</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{agent.address}</div>
                          <div className="text-xs text-gray-500">{agent.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs">{agent.tier}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          agent.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{agent.emailsSent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(agent.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {agent.status !== 'banned' && (
                            <>
                              {agent.status === 'active' ? (
                                <button onClick={() => handleAgentAction(agent.id, 'suspend')}
                                  className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30" title="Suspend">
                                  <AlertCircle size={16} />
                                </button>
                              ) : (
                                <button onClick={() => handleAgentAction(agent.id, 'unban')}
                                  className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30" title="Reactivate">
                                  <Unlock size={16} />
                                </button>
                              )}
                              <button onClick={() => handleAgentAction(agent.id, 'ban')}
                                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30" title="Ban">
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                          {agent.status === 'banned' && (
                            <button onClick={() => handleAgentAction(agent.id, 'unban')}
                              className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30" title="Unban">
                              <Unlock size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send News Form */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Send size={18} className="text-[#00f0ff]" />
                Send News Update
              </h3>
              <form onSubmit={handleSendNews} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                    placeholder="e.g., MoltMail v2.5 Released!"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Content *</label>
                  <textarea
                    required
                    rows={6}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
                    placeholder="What's new? Announce features, updates, or important info..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    checked={newsForm.sendToAll}
                    onChange={(e) => setNewsForm({ ...newsForm, sendToAll: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border-white/10"
                  />
                  <label htmlFor="sendToAll" className="text-sm text-gray-400">
                    Send to all {stats.totalAgents.toLocaleString()} agents
                  </label>
                </div>
                <button type="submit" className="w-full py-3 bg-[#00f0ff] text-black font-bold rounded-lg hover:bg-[#00f0ff]/90">
                  📢 Broadcast News
                </button>
              </form>
            </div>

            {/* Previous Updates */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} className="text-[#00f0ff]" />
                Previous Updates
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {newsUpdates.map((update) => (
                  <div key={update.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{update.title}</h4>
                      <span className="text-xs text-gray-500">{update.publishedAt}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{update.content}</p>
                    <div className="text-xs text-gray-500">
                      Sent to {update.sentTo.toLocaleString()} agents
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
