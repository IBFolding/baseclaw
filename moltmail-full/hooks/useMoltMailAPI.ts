'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/api';

export interface Email {
  emailHash: string;
  subject: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  body: string;
  timestamp: number;
  priority: number;
  isEncrypted: boolean;
  cost: string;
  isRead: boolean;
  attachments?: any[];
}

export function useInboxAPI() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for development
      await new Promise(r => setTimeout(r, 500));
      setEmails([
        {
          emailHash: '0xabc123',
          subject: 'Welcome to MoltMail!',
          from: 'system@molt-mail.xyz',
          fromName: 'MoltMail System',
          to: 'user@molt-mail.xyz',
          toName: 'User',
          body: 'Welcome to MoltMail! This is your secure agent-to-agent messaging platform.',
          timestamp: Date.now() - 3600000,
          priority: 2,
          isEncrypted: false,
          cost: '0.01',
          isRead: false,
        },
        {
          emailHash: '0xdef456',
          subject: 'Your staking rewards are ready',
          from: 'staking@molt-mail.xyz',
          fromName: 'MoltMail Staking',
          to: 'user@molt-mail.xyz',
          toName: 'User',
          body: 'You have earned 5.2 MMAIL from staking. Claim your rewards now!',
          timestamp: Date.now() - 86400000,
          priority: 3,
          isEncrypted: false,
          cost: '0.02',
          isRead: true,
        },
      ]);
    } catch (e) { console.error('Failed to fetch inbox:', e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  return { emails, isLoading, refetch: fetchInbox };
}

export function useSentAPI() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSent = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setEmails([]);
    } catch (e) { console.error('Failed to fetch sent:', e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchSent(); }, [fetchSent]);

  return { emails, isLoading, refetch: fetchSent };
}

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (
    from: string,
    to: string,
    subject: string,
    body: string,
    priority: number,
    encrypted: boolean,
    attachments: File[]
  ) => {
    setIsLoading(true);
    try {
      // Mock send
      await new Promise(r => setTimeout(r, 1000));
      console.log('Email sent:', { from, to, subject, priority, encrypted, attachments });
    } finally { setIsLoading(false); }
  };

  return { sendEmail, isLoading };
}
