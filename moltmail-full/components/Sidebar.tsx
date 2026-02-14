'use client';

import { useState, useEffect } from 'react';
import { Inbox, Send, FileText, ShieldAlert, Settings, User, Plus, Users, DollarSign, Lightbulb, BookUser, Megaphone, Shield, Menu, X, TrendingUp, ShieldCheck, Newspaper, Bell } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onCompose: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentView, onViewChange, onCompose, isOpen, onClose }: SidebarProps) {
  const { address } = useAccount();
  const [stats, setStats] = useState({ received: 0, sent: 0, unread: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!address) return;
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats/${address.toLowerCase()}`);
        if (response.ok) {
          const data = await response.json();
          setStats({ received: data.received || 0, sent: data.sent || 0, unread: data.unread || 0 });
        }
      } catch (err) { console.error('Stats fetch error:', err); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    if (isMobile) onClose();
  };

  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: stats.unread },
    { id: 'sent', label: 'Sent', icon: Send, count: stats.sent },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
    { id: 'spam', label: 'Spam', icon: ShieldAlert, count: 0 },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="MoltMail" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          <span className="text-lg md:text-xl font-bold gradient-text">MoltMail</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={24} /></button>
        )}
      </div>

      <div className="px-3 md:px-4 mb-4 md:mb-6">
        <button onClick={() => { onCompose(); if (isMobile) onClose(); }} className="glow-btn w-full flex items-center justify-center gap-2 py-2 md:py-3 text-sm md:text-base">
          <Plus size={16} className="md:size-18" />
          <span className="hidden md:inline">New Message</span>
          <span className="md:hidden">Compose</span>
        </button>
      </div>

      <nav className="flex-1 px-2 md:px-3 overflow-y-auto">
        <div className="space-y-0.5 md:space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => handleNavClick(item.id)}
                className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === item.id ? 'active' : ''}`}>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 text-left ml-3">{item.label}</span>
                {item.count > 0 && (
                  <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] text-xs rounded-full">{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
          <button onClick={() => handleNavClick('directory')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'directory' ? 'active' : ''}`}>
            <Users size={16} className="flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Directory</span>
          </button>
          <button onClick={() => handleNavClick('moltbook')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'moltbook' ? 'active' : ''}`}>
            <BookUser size={16} className="flex-shrink-0" />
            <span className="flex-1 text-left ml-3">MoltBook</span>
          </button>
          <button onClick={() => handleNavClick('pricing')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'pricing' ? 'active' : ''}`}>
            <DollarSign size={16} className="flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Pricing</span>
          </button>
          <button onClick={() => handleNavClick('voting')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'voting' ? 'active' : ''}`}>
            <Lightbulb size={16} className="text-yellow-400 flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Voting</span>
            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] text-xs rounded-full ml-2">VOTE</span>
          </button>
          <button onClick={() => handleNavClick('news')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'news' ? 'active' : ''}`}>
            <Newspaper size={16} className="text-blue-400 flex-shrink-0" />
            <span className="flex-1 text-left ml-3">News</span>
            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full ml-2">2</span>
          </button>
          <button onClick={() => handleNavClick('staking')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'staking' ? 'active' : ''}`}>
            <TrendingUp size={16} className="text-green-400 flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Staking</span>
            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full ml-2">NEW</span>
          </button>
          <button onClick={() => handleNavClick('subscriptions')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'subscriptions' ? 'active' : ''}`}>
            <Bell size={16} className="text-purple-400 flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Subscriptions</span>
          </button>
        </div>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
          <div className="px-3 mb-1 md:mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">Monetize</div>
          <button onClick={() => handleNavClick('advertiser')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'advertiser' ? 'active' : ''}`}>
            <Megaphone size={16} className="text-[#00f0ff] flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Advertise</span>
          </button>
          <button onClick={() => handleNavClick('clawbot')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'clawbot' ? 'active' : ''}`}>
            <Shield size={16} className="text-green-400 flex-shrink-0" />
            <span className="flex-1 text-left ml-3">Review</span>
          </button>
        </div>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
          <button onClick={() => handleNavClick('settings')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'settings' ? 'active' : ''}`}>
            <Settings size={16} className="flex-shrink-0" />
            <span className="ml-3">Settings</span>
          </button>
          <button onClick={() => handleNavClick('profile')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'profile' ? 'active' : ''}`}>
            <User size={16} className="flex-shrink-0" />
            <span className="ml-3">Profile</span>
          </button>
          <button onClick={() => handleNavClick('admin')} className={`sidebar-item w-full justify-start px-3 py-2.5 md:px-3 md:py-3 text-sm md:text-base ${currentView === 'admin' ? 'active' : ''}`}>
            <ShieldCheck size={16} className="text-red-400 flex-shrink-0" />
            <span className="ml-3">Admin</span>
            <span className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full ml-2">🔒</span>
          </button>
        </div>
      </nav>

      <div className="p-3 md:p-4 border-t border-white/5">
        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
      </div>
    </>
  );

  // Mobile: render as overlay
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
            <aside className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a0a18] border-r border-white/10 z-50 flex flex-col md:hidden shadow-2xl">
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  // Desktop: render as sidebar
  return (
    <aside className="w-64 bg-[#0a0a18]/80 backdrop-blur-md border-r border-white/5 flex flex-col hidden md:flex">
      {sidebarContent}
    </aside>
  );
}
