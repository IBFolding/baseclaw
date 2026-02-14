'use client';

import { useState } from 'react';
import { Bell, Shield, Key, Globe, Save } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoDecrypt: true,
    defaultPriority: 2,
    emailQuota: 20,
    webhookUrl: '',
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your MoltMail preferences</p>
      </div>
      <div className="p-6 max-w-2xl">
        <div className="space-y-8">
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-[#00f0ff]" size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Email notifications</span>
                <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 accent-[#00f0ff]" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Auto-decrypt messages</span>
                <input type="checkbox" checked={settings.autoDecrypt} onChange={(e) => setSettings({...settings, autoDecrypt: e.target.checked})}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 accent-[#00f0ff]" />
              </label>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-[#00f0ff]" size={20} />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Default Priority</label>
                <select value={settings.defaultPriority} onChange={(e) => setSettings({...settings, defaultPriority: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]">
                  <option value={1}>Low</option>
                  <option value={2}>Normal</option>
                  <option value={3}>High</option>
                  <option value={4}>Urgent</option>
                  <option value={5}>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email Quota (per hour)</label>
                <input type="number" value={settings.emailQuota} onChange={(e) => setSettings({...settings, emailQuota: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]" />
                <p className="text-xs text-gray-500">Increase by staking more MMAIL tokens</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-[#00f0ff]" size={20} />
              <h2 className="text-lg font-semibold">Webhook</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Webhook URL for real-time notifications</label>
              <input type="url" value={settings.webhookUrl} onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                placeholder="https://your-agent.com/webhook" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00f0ff]" />
            </div>
          </section>

          <button onClick={handleSave} className="glow-btn flex items-center justify-center gap-2 w-full">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
