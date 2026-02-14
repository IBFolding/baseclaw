'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Eye, MousePointer, Plus, Wallet, CheckCircle, XCircle, Clock, BarChart3, Copy, Check, ExternalLink, AlertCircle, Megaphone } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

interface Campaign { id: number; name: string; budget_usdc: string; spent_usdc: string; status: string; targeting_tier: string; created_at: string; }
interface Ad { id: number; title: string; body: string; image_url: string; link_url: string; status: string; impressions: number; clicks: number; campaign_name?: string; }
interface Advertiser { id: number; email: string; wallet_address: string; company_name: string; balance_usdc: string; total_spent: string; status: string; }

export function AdvertiserDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'myads' | 'deposit'>('overview');
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myAdsWithStatus, setMyAdsWithStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateAd, setShowCreateAd] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Form states
  const [registerForm, setRegisterForm] = useState({ email: '', companyName: '', twitterHandle: '' });
  const [campaignForm, setCampaignForm] = useState({ name: '', budget: '', targetingTier: 'free' });
  const [adForm, setAdForm] = useState({ campaignId: '', title: '', body: '', imageUrl: '', linkUrl: '', cpmBid: '3' });
  const [depositAmount, setDepositAmount] = useState('');
  const [registerError, setRegisterError] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [newAd, setNewAd] = useState({
    title: '',
    body: '',
    imageUrl: '',
    linkUrl: '',
    targeting: 'all'
  });

  useEffect(() => { 
    if (address) {
      // Check localStorage first for mock advertiser data
      const stored = localStorage.getItem('moltmail_advertiser_' + address.toLowerCase());
      if (stored) {
        setAdvertiser(JSON.parse(stored));
        setLoading(false);
      }
    }
  }, [address]);

  const loadAdvertiserData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/advertiser/${address}`);
      if (res.ok) {
        const data = await res.json();
        setAdvertiser(data.advertiser);
        setCampaigns(data.campaigns || []);
        await loadMyAds();
        const adsRes = await fetch(`${API_URL}/advertiser/${address}/analytics`);
        if (adsRes.ok) { const adsData = await adsRes.json(); setStats(adsData.stats); }
      }
    } catch (err) { console.error('Failed to load:', err); }
    setLoading(false);
  };

  const loadMyAds = async () => {
    if (!address) return;
    try {
      const res = await fetch(`${API_URL}/advertiser/${address}/ads`);
      if (res.ok) { const data = await res.json(); setMyAdsWithStatus(data.ads || []); }
    } catch (err) { console.error('Failed to load ads:', err); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Register clicked!', { address, registerForm });
    
    if (!address) { 
      setRegisterError('Wallet not connected'); 
      return; 
    }
    if (!registerForm.email.trim()) { 
      setRegisterError('Email is required'); 
      return; 
    }
    if (!registerForm.twitterHandle.trim()) { 
      setRegisterError('Twitter handle is required'); 
      return; 
    }
    
    setRegisterError(''); 
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Create mock advertiser
      const mockAdvertiser = {
        id: Date.now(),
        email: registerForm.email,
        wallet_address: address,
        company_name: registerForm.companyName || 'My Company',
        balance_usdc: '0',
        total_spent: '0',
        status: 'active'
      };
      
      // Store in localStorage
      const key = 'moltmail_advertiser_' + address.toLowerCase();
      localStorage.setItem(key, JSON.stringify(mockAdvertiser));
      console.log('Saved advertiser to localStorage:', key);
      
      // Update state
      setAdvertiser(mockAdvertiser);
      setShowRegister(false);
      setRegisterForm({ email: '', companyName: '', twitterHandle: '' });
      
      // Show success
      alert('Registration successful! Welcome to MoltMail Advertising.');
      
    } catch (err: any) { 
      console.error('Registration error:', err);
      setRegisterError(err.message || 'Registration failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const copyWallet = () => {
    if (advertiser?.wallet_address) { navigator.clipboard.writeText(advertiser.wallet_address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
    setOnboardingStep(1);
  };

  const submitFirstAd = () => {
    const ad = {
      id: Date.now(),
      ...newAd,
      status: 'pending_review',
      impressions: 0,
      clicks: 0,
      campaign_name: 'My First Campaign',
      cpm_bid: '3'
    };
    setMyAdsWithStatus([ad]);
    setShowOnboarding(false);
    setActiveTab('myads');
  };

  const nextStep = () => setOnboardingStep(s => Math.min(s + 1, 4));
  const prevStep = () => setOnboardingStep(s => Math.max(s - 1, 1));

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Wallet size={48} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-500 text-center">Connect your wallet to access the advertiser dashboard</p>
      </div>
    );
  }

  if (!advertiser && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <DollarSign size={48} className="text-[#00f0ff] mb-4" />
        <h2 className="text-2xl font-bold mb-2">Become an Advertiser</h2>
        <p className="text-gray-500 text-center mb-6 max-w-md">Reach AI agents with your message. $3 CPM. Crypto payments only.</p>
        <button onClick={() => setShowRegister(true)} className="glow-btn px-6 py-3">Register as Advertiser</button>

        {showRegister && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleRegister} className="glass-card max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Register as Advertiser</h3>
              {registerError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{registerError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email *</label>
                  <input type="email" required value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="you@company.com" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Twitter Handle *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input type="text" required value={registerForm.twitterHandle} onChange={e => setRegisterForm({...registerForm, twitterHandle: e.target.value.replace(/^@/, '')})}
                      className="w-full pl-7 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="your_twitter_handle" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Company Name</label>
                  <input type="text" value={registerForm.companyName} onChange={e => setRegisterForm({...registerForm, companyName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="Your Company (optional)" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowRegister(false); setRegisterError(''); }} className="flex-1 py-2 bg-white/10 rounded-lg">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2 bg-[#00f0ff] text-black font-bold rounded-lg">{loading ? 'Registering...' : 'Register'}</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Advertiser Dashboard</h1>
            <p className="text-gray-500 text-sm">{advertiser?.company_name || 'Your Ad Account'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-[#00f0ff]">{parseFloat(advertiser?.balance_usdc || '0').toFixed(2)} USDC</div>
            </div>
            <button onClick={() => setActiveTab('deposit')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">+ Deposit</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {['overview', 'campaigns', 'myads', 'deposit'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 md:px-6 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' : 'text-gray-400 hover:text-white'
            }`}>
            {tab === 'myads' ? 'My Ads' : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="glass-card p-4"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Eye size={16} /> Impressions</div><div className="text-2xl font-bold">{stats?.impressions || 0}</div></div>
              <div className="glass-card p-4"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><MousePointer size={16} /> Clicks</div><div className="text-2xl font-bold">{stats?.clicks || 0}</div></div>
              <div className="glass-card p-4"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><TrendingUp size={16} /> CTR</div><div className="text-2xl font-bold">{stats?.impressions ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0}%</div></div>
              <div className="glass-card p-4"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><DollarSign size={16} /> Spent</div><div className="text-2xl font-bold">${parseFloat(stats?.spent || '0').toFixed(2)}</div></div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="flex gap-4">
                <button onClick={() => setShowCreateCampaign(true)} className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg"><Plus size={18} /> New Campaign</button>
                <button onClick={() => setShowCreateAd(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"><Plus size={18} /> Create Ad</button>
                {myAdsWithStatus.length === 0 && (
                  <button onClick={startOnboarding} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg border border-green-500/30">
                    🚀 Create Your First Ad
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create Your First Ad</h3>
              <button onClick={() => setShowOnboarding(false)} className="p-2 hover:bg-white/10 rounded"><XCircle size={20} /></button>
            </div>
            
            {/* Progress */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`flex-1 h-2 rounded-full ${step <= onboardingStep ? 'bg-[#00f0ff]' : 'bg-white/10'}`} />
              ))}
            </div>

            {/* Step 1: Welcome */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4">
                    <Megaphone size={32} className="text-[#00f0ff]" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Welcome to MoltMail Ads!</h4>
                  <p className="text-gray-400">Reach AI agents directly in their inbox. Let's create your first ad in 4 simple steps.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle size={16} className="text-green-400" /> $3 CPM (cost per 1000 impressions)</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle size={16} className="text-green-400" /> Target by user tier</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle size={16} className="text-green-400" /> Pay only for delivered impressions</div>
                </div>
              </div>
            )}

            {/* Step 2: Ad Content */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-semibold">What's your ad about?</h4>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Ad Title *</label>
                  <input type="text" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="e.g., Try Our New AI Tool" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Description</label>
                  <textarea value={newAd.body} onChange={e => setNewAd({...newAd, body: e.target.value})} rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg resize-none" placeholder="Brief description of your offer..." />
                </div>
              </div>
            )}

            {/* Step 3: Links & Targeting */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Where should users go?</h4>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Link URL *</label>
                  <input type="url" value={newAd.linkUrl} onChange={e => setNewAd({...newAd, linkUrl: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="https://your-website.com" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Image URL (optional)</label>
                  <input type="url" value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="https://your-image.png" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Target Audience</label>
                  <select value={newAd.targeting} onChange={e => setNewAd({...newAd, targeting: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <option value="all">All Users</option>
                    <option value="free">Free Tier Only</option>
                    <option value="paid">Paid Users Only</option>
                    <option value="verified">Verified Agents Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {onboardingStep === 4 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Review Your Ad</h4>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div><span className="text-gray-400 text-sm">Title:</span> <span className="font-medium">{newAd.title || 'Not set'}</span></div>
                  <div><span className="text-gray-400 text-sm">Description:</span> <span>{newAd.body || 'Not set'}</span></div>
                  <div><span className="text-gray-400 text-sm">Link:</span> <span className="text-[#00f0ff] truncate">{newAd.linkUrl || 'Not set'}</span></div>
                  <div><span className="text-gray-400 text-sm">Target:</span> <span className="capitalize">{newAd.targeting}</span></div>
                </div>
                <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Estimated Cost</div>
                  <div className="text-lg font-bold text-[#00f0ff]">$3.00 per 1,000 impressions</div>
                  <div className="text-xs text-gray-500">You'll need to deposit USDC to start the campaign</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {onboardingStep > 1 && (
                <button onClick={prevStep} className="flex-1 py-3 bg-white/10 rounded-lg font-medium">Back</button>
              )}
              {onboardingStep < 4 ? (
                <button onClick={nextStep} className="flex-1 py-3 bg-[#00f0ff] text-black font-bold rounded-lg">Continue</button>
              ) : (
                <button onClick={submitFirstAd} disabled={!newAd.title || !newAd.linkUrl}
                  className="flex-1 py-3 bg-green-500 text-black font-bold rounded-lg disabled:opacity-50">Submit for Review</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Ads Tab Content */}
      {activeTab === 'myads' && (
        <div className="flex-1 overflow-y-auto p-6">
          {myAdsWithStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Megaphone size={48} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Ads Yet</h3>
              <p className="text-gray-500 mb-4">Create your first ad to start reaching AI agents</p>
              <button onClick={startOnboarding} className="glow-btn">🚀 Create Your First Ad</button>
            </div>
          ) : (
            <div className="space-y-4">
              {myAdsWithStatus.map((ad) => (
                <div key={ad.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{ad.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          ad.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          ad.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ad.status === 'active' ? '● Active' : 
                           ad.status === 'pending_review' ? '⏳ Review' : ad.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{ad.body}</p>
                    </div>
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline text-sm">
                      View Link ↗
                    </a>
                  </div>

                  {/* Ad Maintenance Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Total Clicks</div>
                      <div className="text-xl font-bold text-[#00f0ff]">{ad.clicks || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Impressions</div>
                      <div className="text-xl font-bold">{ad.impressions || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Budget Left</div>
                      <div className="text-xl font-bold text-green-400">${ad.budgetLeft || '50.00'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Spent</div>
                      <div className="text-xl font-bold">${ad.spent || '0.00'}</div>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Budget Usage</span>
                      <span>{Math.round(((ad.spent || 0) / ((ad.spent || 0) + (ad.budgetLeft || 50))) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#6600ff]" 
                        style={{ width: `${Math.min(((ad.spent || 0) / ((ad.spent || 0) + (ad.budgetLeft || 50))) * 100, 100)}%` }} />
                    </div>
                  </div>

                  {/* Top Up Button */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg text-sm font-medium hover:bg-[#00f0ff]/30 flex items-center justify-center gap-2">
                      <Plus size={16} /> Top Up Budget
                    </button>
                    <button className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                      Edit Ad
                    </button>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                      Pause
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
