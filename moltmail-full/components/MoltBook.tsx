'use client';

import { useState } from 'react';
import { Search, Heart, Mail, Trash2, Edit2, X, UserPlus, Save } from 'lucide-react';
import { useAddressBook } from '@/hooks/useAddressBook';

interface MoltBookProps {
  onMessageClick?: (contact: { address: string; name: string }) => void;
}

export function MoltBook({ onMessageClick }: MoltBookProps) {
  const { contacts, favorites, addContact, removeContact, toggleFavorite, searchContacts } = useAddressBook();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredContacts = searchQuery ? searchContacts(searchQuery) : activeTab === 'favorites' ? favorites : contacts;

  const handleAddContact = () => {
    if (!newName || !newAddress) return;
    addContact({ address: newAddress, name: newName, email: newEmail || undefined, notes: newNotes || undefined, isFavorite: false });
    setNewName(''); setNewAddress(''); setNewEmail(''); setNewNotes(''); setShowAddForm(false);
  };

  const handleSaveEdit = (address: string) => {
    addContact({ address, name: newName, email: newEmail || undefined, notes: newNotes || undefined });
    setEditingContact(null); setNewName(''); setNewAddress(''); setNewEmail(''); setNewNotes('');
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact.address);
    setNewName(contact.name);
    setNewAddress(contact.address);
    setNewEmail(contact.email || '');
    setNewNotes(contact.notes || '');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold gradient-text">MoltBook</h1>
          <p className="text-sm text-gray-500 mt-1">Your agent contact book</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="glow-btn flex items-center gap-2">
          <UserPlus size={18} /> Add Contact
        </button>
      </div>

      <div className="px-6 py-4 border-b border-white/5 space-y-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'all' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30' : 'text-gray-400 hover:text-white'
          }`}>All Contacts ({contacts.length})</button>
          <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'favorites' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30' : 'text-gray-400 hover:text-white'
          }`}>
            <Heart size={14} className={activeTab === 'favorites' ? 'fill-current' : ''} /> Favorites ({favorites.length})
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] text-white" />
        </div>
      </div>

      {showAddForm && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add New Contact</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name *" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]" />
              <input type="text" placeholder="Wallet Address (0x...) *" value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] font-mono text-sm" />
            </div>
            <input type="text" placeholder="Email (optional)" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]" />
            <textarea placeholder="Notes (optional)" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff] resize-none" />
            <button onClick={handleAddContact} disabled={!newName || !newAddress}
              className="glow-btn flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} /> Save Contact
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="space-y-3">
          {filteredContacts.map((contact) => {
            const isEditing = editingContact === contact.address;
            return (
              <div key={contact.address} className="glass-card p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                      <input type="text" value={newAddress} disabled
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono opacity-50" />
                    </div>
                    <input type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
                    <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Notes" rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(contact.address)} className="flex-1 glow-btn text-sm py-2">Save</button>
                      <button onClick={() => setEditingContact(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#6600ff] flex items-center justify-center text-black font-bold text-lg">
                        {contact.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{contact.name}</h3>
                          {contact.isFavorite && <Heart size={14} className="text-red-400 fill-current" />}
                        </div>
                        <code className="text-xs text-gray-500 font-mono">{contact.address.slice(0, 6)}...{contact.address.slice(-4)}</code>
                        {contact.email && <p className="text-sm text-[#00f0ff] mt-1">{contact.email}</p>}
                        {contact.notes && <p className="text-xs text-gray-500 mt-1">{contact.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onMessageClick?.(contact)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-[#00f0ff]" title="Send Message">
                        <Mail size={18} />
                      </button>
                      <button onClick={() => toggleFavorite(contact.address)}
                        className={`p-2 rounded-lg transition-all ${contact.isFavorite ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-red-400 hover:bg-white/5'}`}
                        title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <Heart size={18} className={contact.isFavorite ? 'fill-current' : ''} />
                      </button>
                      <button onClick={() => startEdit(contact)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => { if (confirm('Delete this contact?')) removeContact(contact.address); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📇</div>
            <h3 className="text-xl font-semibold text-white mb-2">{searchQuery ? 'No contacts found' : activeTab === 'favorites' ? 'No favorites yet' : 'No contacts yet'}</h3>
            <p className="text-gray-500">{searchQuery ? 'Try a different search' : activeTab === 'favorites' ? 'Add contacts to your favorites from the directory' : 'Add your first contact to get started'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
