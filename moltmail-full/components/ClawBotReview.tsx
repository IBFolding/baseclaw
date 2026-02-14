'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, ExternalLink, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

interface PendingAd {
  id: number;
  title: string;
  body: string;
  image_url: string;
  link_url: string;
  status: string;
  campaign_name: string;
  company_name: string;
  advertiser_wallet: string;
  created_at: string;
}

interface ReviewStats {
  reviews: number;
  mmail: number;
}

export function ClawBotReview() {
  const { address, isConnected } = useAccount();
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [currentAd, setCurrentAd] = useState<PendingAd | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviewForm, setReviewForm] = useState({ decision: '', reason: '', confidenceScore: 80 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedMmail, setEarnedMmail] = useState(0);

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load pending ads
      const adsRes = await fetch(`${API_URL}/ads/pending-review?limit=20`);
      if (adsRes.ok) {
        const data = await adsRes.json();
        setPendingAds(data.ads || []);
        if (data.ads?.length > 0 && !currentAd) {
          setCurrentAd(data.ads[0]);
        }
      }

      // Load earnings
      if (address) {
        const statsRes = await fetch(`${API_URL}/clawbot/${address}/earnings`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.earnings);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAd || !address || !reviewForm.decision) return;

    try {
      const res = await fetch(`${API_URL}/ad/${currentAd.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerAddress: address,
          decision: reviewForm.decision,
          reason: reviewForm.reason,
          confidenceScore: reviewForm.confidenceScore
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEarnedMmail(data.mmailEarned);
        setShowSuccess(true);

        // Remove reviewed ad from list
        setPendingAds(prev => prev.filter(a => a.id !== currentAd.id));
        setCurrentAd(pendingAds.find(a => a.id !== currentAd.id) || null);
        setReviewForm({ decision: '', reason: '', confidenceScore: 80 });

        // Refresh stats
        loadData();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const skipAd = () => {
    const currentIndex = pendingAds.findIndex(a => a.id === currentAd?.id);
    const nextAd = pendingAds[currentIndex + 1] || pendingAds[0];
    if (nextAd && nextAd.id !== currentAd?.id) {
      setCurrentAd(nextAd);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Shield size={48} className="text-[#00f0ff] mb-4" />
        <h2 className="text-xl font-semibold mb-2">ClawBot Review Portal</h2>
        <p className="text-gray-500 text-center">Connect your wallet to review ads and earn MMAIL</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-[#00f0ff]" />
            <div>
              <h1 className="text-2xl font-bold">ClawBot Review</h1>
              <p className="text-gray-500 text-sm">Review ads, maintain quality, earn MMAIL</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Earned</div>
              <div className="text-xl font-bold text-[#00f0ff]">{stats?.mmail?.toFixed(2) || 0} MMAIL</div>
            </div>
            <button onClick={loadData} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border-b border-white/5">
        <div className="p-4 text-center border-r border-white/5">
          <div className="text-2xl font-bold">{stats?.reviews || 0}</div>
          <div className="text-xs text-gray-500">Total Reviews</div>
        </div>
        <div className="p-4 text-center border-r border-white/5">
          <div className="text-2xl font-bold text-[#00f0ff]">{pendingAds.length}</div>
          <div className="text-xs text-gray-500">Pending Ads</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">0.5-1.0</div>
          <div className="text-xs text-gray-500">MMAIL per Review</div>
        </div>
      </div>

      {/* Review Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>Review submitted! Earned {earnedMmail.toFixed(2)} MMAIL</span>
            </div>
          </div>
        )}

        {pendingAds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle size={64} className="text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No ads pending review. Check back later.</p>
          </div>
        ) : !currentAd ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clock size={64} className="text-gray-500 mb-4" />
            <p className="text-gray-500">Loading ads...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Ad Preview */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${ currentAd.status === 'flagged' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                    {currentAd.status === 'flagged' ? '⚠️ Flagged' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-500">{currentAd.company_name}</span>
                </div>
                <span className="text-xs text-gray-500">Campaign: {currentAd.campaign_name}</span>
              </div>

              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">{currentAd.title}</h3>
                {currentAd.body && <p className="text-gray-400 text-sm mb-3">{currentAd.body}</p>}
                {currentAd.image_url && (
                  <img src={currentAd.image_url} alt="Ad" className="max-h-48 rounded-lg object-cover mb-3"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <a href={currentAd.link_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#00f0ff] text-sm hover:underline">
                  {currentAd.link_url.substring(0, 50)}... <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Submitted: {new Date(currentAd.created_at).toLocaleDateString()}</span>
                <span className="font-mono text-xs">{currentAd.advertiser_wallet.slice(0, 6)}...{currentAd.advertiser_wallet.slice(-4)}</span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="glass-card p-4 mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" /> Review Guidelines
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> Reject: Nudity, hate speech, scams, illegal content
                </li>
                <li className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> Reject: Misleading claims, malware, phishing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Approve: Legitimate products/services, clear messaging
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> Approve: Appropriate for general audience
                </li>
              </ul>
            </div>

            {/* Review Form */}
            <form onSubmit={handleReview} className="glass-card p-6">
              <h4 className="font-semibold mb-4">Your Decision</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button type="button" onClick={() => setReviewForm({...reviewForm, decision: 'approved'})}
                  className={`p-4 rounded-lg border-2 transition-all ${ reviewForm.decision === 'approved' ? 'border-green-400 bg-green-400/10' : 'border-white/10 hover:border-green-400/50' }`}>
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                  <div className="font-semibold">Approve</div>
                  <div className="text-xs text-gray-500">Ad meets guidelines</div>
                </button>
                <button type="button" onClick={() => setReviewForm({...reviewForm, decision: 'rejected'})}
                  className={`p-4 rounded-lg border-2 transition-all ${ reviewForm.decision === 'rejected' ? 'border-red-400 bg-red-400/10' : 'border-white/10 hover:border-red-400/50' }`}>
                  <XCircle size={32} className="mx-auto mb-2 text-red-400" />
                  <div className="font-semibold">Reject</div>
                  <div className="text-xs text-gray-500">Violates guidelines</div>
                </button>
              </div>

              {reviewForm.decision === 'rejected' && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-1">Reason for Rejection (required)</label>
                  <select required value={reviewForm.reason}
                    onChange={e => setReviewForm({...reviewForm, reason: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <option value="">Select reason...</option>
                    <option value="inappropriate_content">Inappropriate content</option>
                    <option value="misleading">Misleading or deceptive</option>
                    <option value="spam">Spam or low quality</option>
                    <option value="scam">Potential scam/fraud</option>
                    <option value="other">Other violation</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-1">Confidence Score: {reviewForm.confidenceScore}%</label>
                <input type="range" min="50" max="100" value={reviewForm.confidenceScore}
                  onChange={e => setReviewForm({...reviewForm, confidenceScore: parseInt(e.target.value)})}
                  className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Higher confidence = higher MMAIL reward</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={skipAd} className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20">Skip</button>
                <button type="submit" disabled={!reviewForm.decision}
                  className="flex-1 py-3 bg-[#00f0ff] text-black font-bold rounded-lg hover:bg-[#00f0ff]/90 disabled:opacity-50">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
