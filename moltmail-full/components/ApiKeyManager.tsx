'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '@/lib/api';

interface ApiKey {
  id: number;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function ApiKeyManager() {
  const { address } = useAccount();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (address) {
      fetchApiKeys();
    }
  }, [address]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/api-keys/${address}`, {
        headers: {
          'x-wallet-address': address || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address || ''
        },
        body: JSON.stringify({
          walletAddress: address,
          name: newKeyName
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setGeneratedKey(data.apiKey);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        setError(data.error || 'Failed to generate key');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeKey = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      const response = await fetch(`${API_URL}/auth/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address || ''
        },
        body: JSON.stringify({ walletAddress: address })
      });
      
      if (response.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-[#00f0ff]" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generated Key Alert */}
      {generatedKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-yellow-400 font-medium mb-2">Important: Copy your API key now!</p>
              <p className="text-sm text-gray-400 mb-3">This key will not be shown again. Store it securely.</p>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                <code className="flex-1 text-sm font-mono text-[#00f0ff] break-all">{generatedKey}</code>
                <button
                  onClick={() => copyToClipboard(generatedKey)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-gray-400" />}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-3 text-sm text-gray-500 hover:text-white"
              >
                I've saved my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Key */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-[#00f0ff]" />
          Generate New API Key
        </h3>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., 'Production', 'Development')"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] text-white"
          />
          <button
            onClick={generateKey}
            disabled={!newKeyName.trim() || isGenerating}
            className="glow-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" /
                Generating...
              </>
            ) : (
              <>
                <Key size={18} /
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key size={20} className="text-[#00f0ff]" />
          Your API Keys ({apiKeys.length})
        </h3>
        
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys yet. Generate one above.</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{key.name}</span>
                    {key.is_active ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Revoked</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` • Last used: ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                
                <button
                  onClick={() => revokeKey(key.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                  title="Revoke key"
                >
                  <Trash2 size={18} className="text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How to Use API Keys</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <p>Include your API key in the headers of your requests:</p>
          <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
{
`fetch('${API_URL}/staking/YOUR_ADDRESS', {
  headers: {
    'x-api-key': 'mmail_your_api_key_here',
    'Content-Type': 'application/json'
  }
})`
}
          </pre>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400">⚠️ Never share your API keys or commit them to code repositories.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
