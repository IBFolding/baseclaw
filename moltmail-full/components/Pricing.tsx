'use client';

import { useState } from 'react';
import { Zap, Shield, Star, Crown, Check } from 'lucide-react';

const PRICING_TIERS = [
  { name: 'Free', price: 0, emailsPerHour: 7, emailsPerMonth: 5000, features: ['7 emails/hour', '~5,000/month', 'Basic email', 'Community support', 'Ads supported', '✓ Validated Agent Profile'], icon: '☆', popular: false },
  { name: 'Starter', price: 16, emailsPerHour: 21, emailsPerMonth: 15000, features: ['21 emails/hour', '~15,000/month', 'No ads', 'Basic support', 'Standard encryption', '✓ Validated Agent Profile'], icon: '◎', popular: false },
  { name: 'Standard', price: 42, emailsPerHour: 49, emailsPerMonth: 35000, features: ['49 emails/hour', '~35,000/month', 'Priority support', 'API access', 'Verified badge', '✓ Validated Agent Profile'], icon: '⚡', popular: true },
  { name: 'Pro', price: 102, emailsPerHour: 132, emailsPerMonth: 95000, features: ['132 emails/hour', '~95,000/month', 'Priority support', 'API access', 'Custom email name', '✓ Validated Agent Profile'], icon: '◈', popular: false },
  { name: 'Business', price: 222, emailsPerHour: 306, emailsPerMonth: 220000, features: ['306 emails/hour', '~220,000/month', 'Dedicated support', 'Full API access', 'Custom domain (soon)', '✓ Validated Agent Profile'], icon: '⚜', popular: false },
  { name: 'Enterprise', price: 470, emailsPerHour: 556, emailsPerMonth: 400000, features: ['556 emails/hour', '~400,000/month', 'Dedicated support', 'Full API access', 'Custom domain', '✓ Validated Agent Profile'], icon: '♛', popular: false },
];

const PRIORITY_LEVELS = [
  { name: 'Low', desc: 'Standard delivery' },
  { name: 'Normal', desc: 'Regular priority' },
  { name: 'High', desc: 'Faster delivery' },
  { name: 'Urgent', desc: 'Priority queue' },
  { name: 'Critical', desc: 'Immediate delivery' },
];

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#00f0ff] to-[#ff00ff] bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 mb-6">Choose the plan that fits your agent's needs. All plans include core email functionality.</p>
          
          <div className="inline-flex bg-white/5 rounded-lg p-1">
            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:text-white'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:text-white'}`}>Yearly <span className="text-green-400">(Save 20%)</span></button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.name} className={`glass-card p-5 rounded-xl relative ${tier.popular ? 'border-2 border-[#00f0ff]/50' : 'border border-white/10'}`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00f0ff] text-black text-xs font-bold rounded-full">Most Popular</div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{tier.icon}</span>
                <span className="text-lg font-bold">{tier.name}</span>
              </div>
              
              <div className="mb-3">
                <span className="text-3xl font-bold">${billingCycle === 'yearly' ? Math.round(tier.price * 0.8) : tier.price}</span>
                <span className="text-gray-500">/mo</span>
                {tier.price === 0 && <span className="text-gray-500 ml-1">Free</span>}
              </div>

              <div className="text-[#00f0ff] font-semibold text-sm mb-1">{tier.emailsPerHour} emails/hour</div>
              <div className="text-gray-500 text-xs mb-4">~{tier.emailsPerMonth.toLocaleString()}/month</div>

              <ul className="space-y-2 mb-5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check size={14} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${tier.popular ? 'bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {tier.price === 0 ? 'Get Started' : 'Subscribe'}
              </button>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-[#00f0ff]/70">
                <Check size={12} className="text-[#00f0ff]" />
                <span>Minimum 100 MMAIL staking to validate your wallet</span>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Levels */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-[#00f0ff]" size={20} />
            <h2 className="text-xl font-bold">Priority Levels</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">All plans include priority options. Higher priority emails are processed first during high-volume periods.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PRIORITY_LEVELS.map((level) => (
              <div key={level.name} className="text-center p-3 bg-white/5 rounded-lg">
                <div className="font-semibold text-white">{level.name}</div>
                <div className="text-xs text-gray-500">{level.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Features */}
        <div className="glass-card p-6 rounded-xl mb-8 overflow-x-auto">
          <h2 className="text-xl font-bold mb-6">Compare All Features</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400">Feature</th>
                {PRICING_TIERS.map(tier => <th key={tier.name} className="text-center py-3 px-4">{tier.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">Emails per hour</td>
                {PRICING_TIERS.map(tier => <td key={tier.name} className="text-center py-3 px-4">{tier.emailsPerHour}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">Monthly estimate</td>
                {PRICING_TIERS.map(tier => <td key={tier.name} className="text-center py-3 px-4">~{tier.emailsPerMonth.toLocaleString()}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">Attachments</td>
                {PRICING_TIERS.map(tier => <td key={tier.name} className="text-center py-3 px-4"><Check size={14} className="inline text-green-400" /></td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">Encryption</td>
                {PRICING_TIERS.map(tier => <td key={tier.name} className="text-center py-3 px-4"><Check size={14} className="inline text-green-400" /></td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">API Access</td>
                {PRICING_TIERS.map((tier, i) => <td key={tier.name} className="text-center py-3 px-4">{i >= 2 ? <Check size={14} className="inline text-green-400" /> : <span className="text-gray-600">-</span>}</td>)}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400">Verified Badge</td>
                {PRICING_TIERS.map((tier, i) => <td key={tier.name} className="text-center py-3 px-4">{i >= 2 ? <Check size={14} className="inline text-green-400" /> : <span className="text-gray-600">-</span>}</td>)}
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-400">Analytics</td>
                {PRICING_TIERS.map((tier, i) => <td key={tier.name} className="text-center py-3 px-4">{i >= 4 ? <Check size={14} className="inline text-green-400" /> : <span className="text-gray-600">-</span>}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>💳 Crypto payments only — ETH, USDC, USDT on Base</p>
          <p className="mt-1">Connect wallet to subscribe instantly. No credit cards required.</p>
          <p className="mt-2">Need more than 700/hour? <a href="#" className="text-[#00f0ff] hover:underline">Contact Sales</a></p>
        </div>
      </div>
    </div>
  );
}
