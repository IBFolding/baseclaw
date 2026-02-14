'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, AlertCircle, Sparkles, Loader2, Lock, Unlock, X, User, Paperclip, Image, FileText } from 'lucide-react';
import { useSendEmail } from '@/hooks/useMoltMailAPI';
import { useAddressBook } from '@/hooks/useAddressBook';
import { useAccount } from 'wagmi';

interface ComposeProps {
  onBack: () => void;
  recipient?: { address: string; name: string; } | null;
  initialSubject?: string;
  initialBody?: string;
}

const priorityOptions = [
  { value: 1, label: 'Low', color: 'bg-gray-500', multiplier: 1 },
  { value: 2, label: 'Normal', color: 'bg-blue-500', multiplier: 2 },
  { value: 3, label: 'High', color: 'bg-yellow-500', multiplier: 3 },
  { value: 4, label: 'Urgent', color: 'bg-orange-500', multiplier: 4 },
  { value: 5, label: 'Critical', color: 'bg-red-500', multiplier: 5 },
];

export function Compose({ onBack, recipient, initialSubject = '', initialBody = '' }: ComposeProps) {
  const { address } = useAccount();
  const { contacts, favorites, searchContacts, addContact } = useAddressBook();
  const [to, setTo] = useState(recipient?.address || '');
  const [subject, setSubject] = useState(initialSubject || (recipient ? `Re: ${recipient.name}` : ''));
  const [body, setBody] = useState(initialBody || (recipient ? `Hi ${recipient.name}, ` : ''));
  const [priority, setPriority] = useState(2);
  const [useEncryption, setUseEncryption] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recipientName, setRecipientName] = useState(recipient?.name || '');
  const { sendEmail, isLoading: isPending } = useSendEmail();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search contacts based on input
  const suggestions = to.length >= 2 ? searchContacts(to) : [];
  const showFavorites = !to && favorites.length > 0;

  const handleSelectContact = (contact: { address: string; name: string }) => {
    setTo(contact.address);
    setRecipientName(contact.name);
    setShowSuggestions(false);
    // Auto-fill subject if empty
    if (!subject) {
      setSubject(`Hi ${contact.name}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit total size to 10MB
    const totalSize = [...attachments, ...files].reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError('Total attachment size must be less than 10MB');
      return;
    }
    setAttachments(prev => [...prev, ...files]);
    setError('');
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={16} className="text-[#00f0ff]" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');
    
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    if (!to || !subject || !body) {
      setError('Please fill in all fields');
      return;
    }

    // Validate recipient - can be wallet address or email address
    const isWalletAddress = to.startsWith('0x') && to.length === 42;
    const isEmailAddress = to.includes('@');
    
    if (!isWalletAddress && !isEmailAddress) {
      setError('Invalid recipient address. Must be a wallet address (0x...) or email (name@molt-mail.xyz)');
      return;
    }

    try {
      await sendEmail(address, to, subject, body, priority, useEncryption, attachments);
      
      // Add to address book if not already there and has a name
      if (recipientName) {
        addContact({ address: to, name: recipientName, isFavorite: false });
      }
      
      setSuccess('Email sent successfully!');
      setTimeout(() => {
        setTo('');
        setSubject('');
        setBody('');
        setAttachments([]);
        setRecipientName('');
        onBack();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setError(err.message || 'Failed to send email. Please try again.');
    }
  };

  const isValidAddress = (to.startsWith('0x') && to.length === 42) || to.includes('@');
  const clearRecipient = () => {
    setTo('');
    setRecipientName('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-xl font-bold">New Message</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Add attachment">
            <Paperclip size={20} className="text-gray-400" />
          </button>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
          <button onClick={handleSend} disabled={!to || !subject || isPending || !address}
            className="glow-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send</>}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {(error || success) && (
        <div className={`px-6 py-3 border-b ${error ? 'border-red-500/20 bg-red-500/10' : 'border-green-500/20 bg-green-500/10'}`}>
          <p className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{error || success}</p>
        </div>
      )}

      {/* Compose Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* To Field with Auto-suggest */}
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <label className="text-sm text-gray-400">To (Agent Address)</label>
            <div className="relative">
              {recipientName ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center text-black font-bold text-sm">
                    {recipientName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{recipientName}</div>
                    <div className="text-xs text-gray-500 font-mono">{to}</div>
                  </div>
                  <button onClick={clearRecipient} className="p-1 hover:bg-white/10 rounded">
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <input ref={inputRef} type="text" value={to} onChange={(e) => { setTo(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)} placeholder="Type name or 0x address..."
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:border-[#00f0ff] font-mono text-sm ${to && !isValidAddress ? 'border-red-500' : 'border-white/10'}`} />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (suggestions.length > 0 || showFavorites) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a1a] border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      {showFavorites && (
                        <div className="p-2">
                          <div className="text-xs text-gray-500 px-3 py-2">⭐ Favorites</div>
                          {favorites.map((contact) => (
                            <button key={contact.address} onClick={() => handleSelectContact(contact)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center text-black font-bold text-sm">
                                {contact.name[0]?.toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-white">{contact.name}</div>
                                <div className="text-xs text-gray-500 font-mono truncate">{contact.address}</div>
                              </div>
                              {contact.email && <div className="text-xs text-[#00f0ff]">{contact.email}</div>}
                            </button>
                          ))}
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div className="p-2">
                          {!showFavorites && <div className="text-xs text-gray-500 px-3 py-2">🔍 Search Results</div>}
                          {suggestions.map((contact) => (
                            <button key={contact.address} onClick={() => handleSelectContact(contact)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <User size={14} className="text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-white">{contact.name}</div>
                                <div className="text-xs text-gray-500 font-mono truncate">{contact.address}</div>
                              </div>
                              {contact.isFavorite && <span className="text-xs text-yellow-400">⭐</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {to && isValidAddress && !recipientName && <p className="text-xs text-green-400">✓ Valid recipient</p>}
            {to && !isValidAddress && <p className="text-xs text-red-400">✗ Invalid recipient. Use wallet address (0x...) or email (name@molt-mail.xyz)</p>}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]" />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Attachments ({attachments.length})</label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-300 max-w-[150px] truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    <button onClick={() => removeAttachment(index)} className="p-1 hover:bg-white/10 rounded ml-1">
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Priority Level</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((opt) => (
                <button key={opt.value} onClick={() => setPriority(opt.value)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${priority === opt.value ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${opt.color} mr-2`} />{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Encryption Toggle */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Lock size={14} /> End-to-End Encryption
            </label>
            <div className="flex items-center gap-4">
              <button onClick={() => setUseEncryption(false)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${!useEncryption ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                <Unlock size={14} className="inline mr-2" /> Standard (Plaintext)
              </button>
              <button onClick={() => setUseEncryption(true)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${useEncryption ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                <Lock size={14} className="inline mr-2" /> Encrypted (E2E)
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {useEncryption ? 'Message content will be encrypted and only readable by the recipient.' : 'Message stored as plaintext. Faster and searchable, but readable by server.'}
            </p>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message..." rows={10}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] resize-none" />
          </div>

          {/* AI Assist - Placeholder */}
          <button onClick={() => setError('AI Assist coming soon!')} className="flex items-center gap-2 text-sm text-[#00f0ff] hover:underline">
            <Sparkles size={16} /> AI Assist
          </button>
        </div>
      </div>
    </div>
  );
}
