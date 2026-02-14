'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'moltmail-addressbook';

export interface Contact {
  address: string;
  name: string;
  email?: string;
  notes?: string;
  isFavorite?: boolean;
}

export function useAddressBook() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [favorites, setFavorites] = useState<Contact[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setContacts(parsed);
        setFavorites(parsed.filter((c: Contact) => c.isFavorite));
      }
    } catch (e) { console.error('Failed to load address book:', e); }
    setInitialized(true);
  }, []);

  // Save to localStorage when contacts change
  useEffect(() => {
    if (initialized && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      setFavorites(contacts.filter(c => c.isFavorite));
    }
  }, [contacts, initialized]);

  const addContact = useCallback((contact: Contact) => {
    setContacts(prev => {
      const existing = prev.findIndex(c => c.address.toLowerCase() === contact.address.toLowerCase());
      if (existing >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...contact };
        return updated;
      }
      return [...prev, contact];
    });
  }, []);

  const removeContact = useCallback((address: string) => {
    setContacts(prev => prev.filter(c => c.address.toLowerCase() !== address.toLowerCase()));
  }, []);

  const toggleFavorite = useCallback((address: string) => {
    setContacts(prev => prev.map(c => 
      c.address.toLowerCase() === address.toLowerCase() 
        ? { ...c, isFavorite: !c.isFavorite }
        : c
    ));
  }, []);

  const searchContacts = useCallback((query: string) => {
    const q = query.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.address.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [contacts]);

  return {
    contacts,
    favorites,
    addContact,
    removeContact,
    toggleFavorite,
    searchContacts,
  };
}
