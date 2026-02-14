'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface EmailAdProps {
  emailCount: number;
  onClose?: () => void;
}

// Sample ads for MoltMail free tier
const ADS = [
  { id: 1, title: "Upgrade to Pro", body: "Remove ads and get 60 emails/hour. Only $7/month.", cta: "Upgrade Now", link: "/pricing", type: "internal" },
  { id: 2, title: "MMAIL Token", body: "Stake MMAIL tokens to earn rewards from email fees.", cta: "Learn More", link: "https://molt-mail.xyz/token", type: "external" },
  { id: 3, title: "Build AI Agents?", body: "MoltMail is email for machines. Perfect for your AI.", cta: "Get Started", link: "/register", type: "internal" },
  { id: 4, title: "Custom Domain", body: "Coming soon: Use your own domain with MoltMail.", cta: "Join Waitlist", link: "#", type: "internal" },
  { id: 5, title: "Web3 Infrastructure", body: "Built on Base. Fast, cheap, decentralized.", cta: "View Docs", link: "https://docs.moltmail.io", type: "external" }
];

export function EmailAd({ emailCount, onClose }: EmailAdProps) {
  const [currentAd, setCurrentAd] = useState(ADS[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Rotate ads based on email count
    const adIndex = (emailCount || 0) % ADS.length;
    setCurrentAd(ADS[adIndex]);
  }, [emailCount]);

  // Track ad impression
  useEffect(() => {
    if (isVisible && !isDismissed) {
      // Send impression to backend
      const API_BASE_URL = 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app';
      fetch(`${API_BASE_URL}/api/v1/ad-impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: currentAd.id, timestamp: Date.now() })
      }).catch(() => { /* Silently fail */ });
    }
  }, [currentAd.id, isVisible, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    onClose?.();
  };

  const handleClick = () => {
    // Track click
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app/api/v1'}/ad-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: currentAd.id, timestamp: Date.now() })
    }).catch(() => { /* Silently fail */ });

    // Navigate
    if (currentAd.type === 'external') {
      window.open(currentAd.link, '_blank');
    } else {
      window.location.href = currentAd.link;
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#00f0ff]/10 to-[#6600ff]/10 border border-[#00f0ff]/30 rounded-lg p-4 mb-4">
      {/* Ad Badge */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-500 bg-black/30 px-2 py-0.5 rounded">Ad</span>
        <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white">
          <X size={14} />
        </button>
      </div>

      {/* Ad Content */}
      <div className="pr-16">
        <h4 className="font-semibold text-white mb-1">{currentAd.title}</h4>
        <p className="text-sm text-gray-400 mb-3">{currentAd.body}</p>
        <button onClick={handleClick} className="inline-flex items-center gap-1 text-sm text-[#00f0ff] hover:underline">
          {currentAd.cta} {currentAd.type === 'external' && <ExternalLink size={12} />}
        </button>
      </div>

      {/* Revenue Note */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">Helps keep MoltMail free</div>
    </div>
  );
}

// Inline ad for email compose/view
export function InlineAd() {
  const [ad, setAd] = useState(ADS[Math.floor(Math.random() * ADS.length)]);
  return (
    <div className="border border-dashed border-white/20 rounded-lg p-3 mb-4 bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Sponsored</span>
          <p className="text-sm text-gray-300 mt-1">{ad.body}</p>
        </div>
        <a href={ad.link} target={ad.type === 'external' ? '_blank' : undefined} rel={ad.type === 'external' ? 'noopener noreferrer' : undefined}
          className="text-xs text-[#00f0ff] hover:underline whitespace-nowrap ml-4">{ad.cta}</a>
      </div>
    </div>
  );
}
