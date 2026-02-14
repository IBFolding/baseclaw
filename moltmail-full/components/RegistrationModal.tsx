'use client';

import { useState } from 'react';
import { Check, X, Loader2, Sparkles, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const { address } = useAccount();
  const [name, setName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const checkAvailability = async (value: string) => {
    if (value.length < 3) { setIsAvailable(null); return; }
    setIsChecking(true); setError('');
    try {
      const response = await fetch(`${API_URL}/check-name?name=${value}`);
      const data = await response.json();
      setIsAvailable(data.available);
      if (!data.available && data.suggestions) { setSuggestions(data.suggestions); }
      else { setSuggestions([]); }
    } catch (err) { console.error('Check failed:', err); }
    finally { setIsChecking(false); }
  };

  const handleNameChange = (value: string) => {
    const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    setName(cleanValue); setIsAvailable(null);
    if (cleanValue.length >= 3) { setTimeout(() => checkAvailability(cleanValue), 500); }
  };

  const handleRegister = async () => {
    if (!address || !name || !isAvailable) return;
    setIsRegistering(true); setError('');
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, publicKey: 'placeholder_public_key', name, metadata: { type: 'User', registeredAt: new Date().toISOString() } })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
      } else { setError(data.error || 'Registration failed'); }
    } catch (err) { setError('Network error. Please try again.'); }
    finally { setIsRegistering(false); }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to MoltMail!</h2>
          <p className="text-gray-400 mb-4">Your email is ready:</p>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <code className="text-[#00f0ff] text-lg">{name}@molt-mail.xyz</code>
          </div>
          <p className="text-sm text-gray-500">Redirecting to your inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Claim Your Email</h2>
          <p className="text-gray-400">Choose your unique @molt-mail.xyz address</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Email Name</label>
          <div className="relative">
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="yourname"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] text-white font-mono" maxLength={20} disabled={isRegistering} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking ? <Loader2 size={20} className="text-gray-400 animate-spin" /> : 
               isAvailable === true ? <Check size={20} className="text-green-400" /> : 
               isAvailable === false ? <X size={20} className="text-red-400" /> : null}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{name || 'yourname'}@molt-mail.xyz</span>
            <span className="text-xs text-gray-600">{name.length}/20</span>
          </div>
          
          {isAvailable === false && suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} onClick={() => { setName(suggestion); checkAvailability(suggestion); }}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm text-[#00f0ff] transition-colors">{suggestion}</button>
                ))}
              </div>
            </div>
          )}
          
          {isAvailable === true && <p className="mt-2 text-sm text-green-400">✓ Available!</p>}
        </div>

        <div className="space-y-3">
          <button onClick={handleRegister} disabled={!isAvailable || !name || isRegistering}
            className="glow-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isRegistering ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : <><Shield size={18} /> Claim Email</>}
          </button>
          <button onClick={onClose} disabled={isRegistering} className="w-full py-3 text-gray-400 hover:text-white transition-colors">Cancel</button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center">
            Rules: 3-20 chars, alphanumeric + underscore, start with letter<br/>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}
