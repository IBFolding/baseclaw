'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Reply, Forward, Trash2, MoreVertical, ShieldCheck, AlertTriangle, Lock, Loader2, Unlock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { decryptEmail, loadKeysFromStorage } from '@/lib/crypto';
import { useAccount } from 'wagmi';

interface EmailDetailProps {
  email: any;
  onBack: () => void;
  onReply?: (email: any) => void;
  onForward?: (email: any) => void;
  onDelete?: (emailHash: string) => void;
}

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'text-gray-400' },
  2: { label: 'Normal', color: 'text-blue-400' },
  3: { label: 'High', color: 'text-yellow-400' },
  4: { label: 'Urgent', color: 'text-orange-400' },
  5: { label: 'Critical', color: 'text-red-400' },
};

export function EmailDetail({ email, onBack, onReply, onForward, onDelete }: EmailDetailProps) {
  const { address } = useAccount();
  const [decryptedContent, setDecryptedContent] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const priority = priorityLabels[email.priority] || priorityLabels[2];

  // Process email body to handle both old (cid:) and new (url) image formats
  const processEmailBody = (body: string): string => {
    if (!body) return body;
    let processedBody = body;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app').replace(/\/$/, '');
    
    // Handle cid: references for old emails
    if (body.includes('cid:') && email.attachments) {
      const cidRegex = /cid:([^"'\>\s]+)/g;
      processedBody = processedBody.replace(cidRegex, (match, cid) => {
        const attachment = email.attachments.find((a: any) => a.filename.includes(cid) || cid.includes(a.filename.split('.')[0]));
        if (attachment && attachment.url) {
          return `${baseUrl}${attachment.url}`;
        }
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMzAwIDE1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
      });
    }
    return processedBody;
  };

  const handleDecrypt = async () => {
    if (!email.fullHash) {
      setDecryptedContent({ subject: email.subject, body: 'This is a demo message. In production, this would be decrypted from the blockchain using your private key.', from: email.from, timestamp: email.timestamp });
      return;
    }
    setIsDecrypting(true);
    setDecryptError('');
    try {
      const keys = loadKeysFromStorage();
      if (!keys.privateKey) {
        setDecryptError('Private key not found. Please generate keys in settings.');
        setIsDecrypting(false);
        return;
      }
      // Mock for now
      setTimeout(() => {
        setDecryptedContent({ subject: email.subject, body: 'This message would be decrypted from the blockchain in production.', from: email.from, timestamp: email.timestamp });
        setIsDecrypting(false);
      }, 1000);
    } catch (err: any) {
      setDecryptError('Failed to decrypt message. Make sure you have the correct private key.');
      setIsDecrypting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
              {showRaw ? <Unlock size={16} /> : <Lock size={16} />}
              {showRaw ? 'Show Decrypted' : 'Show Raw'}
            </button>
            {!decryptedContent && email.fullHash && (
              <button onClick={handleDecrypt} disabled={isDecrypting}
                className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] rounded-lg text-sm">
                {isDecrypting ? <><Loader2 size={16} className="animate-spin" /> Decrypting...</> : <><Unlock size={16} /> Decrypt</>}
              </button>
            )}
            <button onClick={() => onReply?.(email)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
              <Reply size={16} /> Reply
            </button>
            <button onClick={() => onForward?.(email)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
              <Forward size={16} /> Forward
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onDelete?.(email.emailHash)} className="p-2 hover:bg-white/5 rounded-lg">
            <Trash2 size={18} className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg">
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Subject: {email?.subject || '(No subject)'}</h1>

          {/* Sender Info Card */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center text-lg font-bold">
                  {email.fromName?.[0] || '?'}
                </div>
                <div>
                  <div className="font-semibold">{email.fromName}</div>
                  <div className="text-sm text-gray-500 font-mono">{email.from}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{format(email.timestamp, 'MMM d, yyyy h:mm a')}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${priority.color}`}>{priority.label} Priority</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{email.cost} MMAIL</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              {email.isEncrypted ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <ShieldCheck size={16} /><span>End-to-end encrypted</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Unlock size={16} /><span>Standard (not encrypted)</span>
                </div>
              )}
              <div className="text-xs text-gray-500 font-mono">Hash: {email.emailHash?.slice(0, 20)}...</div>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-invert max-w-none">
            {email.isEncrypted ? (
              decryptError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{decryptError}</p>
                </div>
              ) : decryptedContent ? (
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{decryptedContent.body}</div>
              ) : (
                <div onClick={handleDecrypt} className="p-6 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/[0.07] transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <Lock size={32} className="text-gray-500 mb-3" />
                    <p className="text-gray-400 mb-2">This message is encrypted</p>
                    <p className="text-sm text-gray-500">Click to decrypt with your private key</p>
                  </div>
                </div>
              )
            ) : (
              email.body?.includes('<') && email.body?.includes('>') ? (
                <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: processEmailBody(email.body) }} />
              ) : (
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{email.body}</div>
              )
            )}
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Attachments ({email.attachments.length})</h3>
              <div className="flex flex-wrap gap-3">
                {email.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex flex-col">
                    {attachment.mimetype?.startsWith('image/') ? (
                      <div className="relative group">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app'}${attachment.url}`}
                          alt={attachment.filename} className="max-w-[300px] max-h-[200px] rounded-lg border border-white/10 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {attachment.filename}
                        </div>
                      </div>
                    ) : (
                      <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://moltmail-backend-64pt549ej-howardtherekts-projects.vercel.app'}${attachment.url}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <FileText size={20} className="text-gray-400" />
                        <div>
                          <div className="text-sm text-white max-w-[200px] truncate">{attachment.filename}</div>
                          <div className="text-xs text-gray-500">{((attachment.size || 0) / 1024).toFixed(1)} KB</div>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Spam */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
              <AlertTriangle size={16} /> Report as Spam (0.5 MMAIL)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
