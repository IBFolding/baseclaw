'use client';

import { useState } from 'react';
import { Search, RefreshCw, Trash2, Archive, Star, Loader2, Lock, MailIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useInboxAPI, useSentAPI } from '@/hooks/useMoltMailAPI';
import { useAccount } from 'wagmi';
import { EmailAd } from './EmailAd';

interface InboxProps {
  onEmailClick: (email: any) => void;
  filter: 'inbox' | 'sent' | 'drafts' | 'spam';
}

const filterLabels = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  spam: 'Spam',
};

export function Inbox({ onEmailClick, filter }: InboxProps) {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const { emails: inboxEmails, isLoading: isLoadingInbox, refetch: refetchInbox } = useInboxAPI();
  const { emails: sentEmails, isLoading: isLoadingSent, refetch: refetchSent } = useSentAPI();

  const isLoading = filter === 'inbox' ? isLoadingInbox : isLoadingSent;
  const emails = filter === 'inbox' ? inboxEmails : sentEmails;
  const refetch = filter === 'inbox' ? refetchInbox : refetchSent;

  const filteredEmails = emails.filter((email: any) =>
    email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.fromName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedEmails);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEmails(newSet);
  };

  const unreadCount = emails.filter((e: any) => !e.isRead).length;

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-500">Connect your wallet to view your MoltMail inbox</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{filterLabels[filter]}</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:border-[#00f0ff]" />
          </div>
          <button onClick={() => refetch()} className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0" disabled={isLoading}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {selectedEmails.size > 0 && (
        <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-[#00f0ff]/5 border-b border-white/5">
          <span className="text-sm text-gray-400">{selectedEmails.size} selected</span>
          <button className="p-2 hover:bg-white/5 rounded-lg"><Archive size={18} className="text-gray-400" /></button>
          <button className="p-2 hover:bg-white/5 rounded-lg"><Trash2 size={18} className="text-gray-400" /></button>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 size={48} className="mb-4 animate-spin" />
            <p>Loading messages...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MailIcon size={48} className="mb-4 opacity-50" />
            <p>No messages found</p>
            <p className="text-sm mt-2">Your {filter} is empty</p>
          </div>
        ) : (
          <>
            {filter === 'inbox' && <EmailAd emailCount={filteredEmails.length} />}
            {filteredEmails.map((email: any) => (
              <div key={email.emailHash} onClick={() => onEmailClick(email)} className={`email-row ${!email.isRead ? 'unread' : ''}`}>
                <input type="checkbox" checked={selectedEmails.has(email.emailHash)}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(email.emailHash); }}
                  onClick={(e) => e.stopPropagation()} className="rounded border-white/20 bg-white/5" />
                <button onClick={(e) => e.stopPropagation()} className="text-gray-600 hover:text-yellow-400">
                  <Star size={16} />
                </button>
                <div className={`priority-dot priority-${email.priority || 2}`} />
                <div className="w-24 md:w-32 truncate email-sender text-sm">
                  {filter === 'sent' ? (email.toName || email.to?.slice(0, 8) + '...') : (email.fromName || email.from?.slice(0, 8) + '...')}
                </div>
                <div className="flex-1 min-w-0 hidden md:block">
                  <span className="email-subject">{email.subject || '(No subject)'}</span>
                  <span className="text-gray-500 mx-2">-</span>
                  <span className="text-gray-500 truncate">
                    {email.body ? email.body.replace(/<<[^>]*>/g, '').slice(0, 60) : 'No preview available'}...
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                  {email.isEncrypted && <span title="Encrypted"><Lock size={14} className="text-green-400" /></span>}
                  <span className="hidden md:inline">{email.cost || '0'} MMAIL</span>
                  <span>{formatDistanceToNow(email.timestamp || Date.now(), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
