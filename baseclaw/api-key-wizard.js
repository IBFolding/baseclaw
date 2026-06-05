// ============================================
// API KEY WIZARD for Agent BLUE
// Manage all API keys needed for skills and integrations
// ============================================

const ApiKeyWizard = {
  // Skill definitions with metadata
  skillKeys: [
    // AI Models
    { id: 'kimi', name: 'Kimi (Moonshot)', category: 'AI Models', icon: '🌙', description: 'Primary LLM for contract generation and chat', url: 'https://platform.moonshot.cn', required: true },
    { id: 'openai', name: 'OpenAI', category: 'AI Models', icon: '🤖', description: 'GPT-4o for advanced reasoning', url: 'https://platform.openai.com', required: false },
    { id: 'anthropic', name: 'Anthropic Claude', category: 'AI Models', icon: '🧠', description: 'Claude 3 Opus for complex analysis', url: 'https://console.anthropic.com', required: false },
    
    // Blockchain
    { id: 'alchemy', name: 'Alchemy', category: 'Blockchain', icon: '⛓️', description: 'RPC node access and WebSocket APIs', url: 'https://dashboard.alchemy.com', required: false },
    { id: 'infura', name: 'Infura', category: 'Blockchain', icon: '🔷', description: 'Ethereum RPC and IPFS', url: 'https://infura.io/dashboard', required: false },
    { id: 'basescan', name: 'BaseScan', category: 'Blockchain', icon: '🔍', description: 'Contract verification and explorer API', url: 'https://basescan.org/apis', required: false },
    { id: 'etherscan', name: 'Etherscan', category: 'Blockchain', icon: '🔎', description: 'Ethereum explorer API', url: 'https://etherscan.io/apis', required: false },
    
    // Storage
    { id: 'pinata', name: 'Pinata', category: 'Storage', icon: '📌', description: 'IPFS pinning for NFT metadata', url: 'https://app.pinata.cloud', required: false },
    { id: 'nftstorage', name: 'NFT.Storage', category: 'Storage', icon: '🗃️', description: 'Free IPFS for NFTs', url: 'https://nft.storage', required: false },
    
    // Social
    { id: 'twitter', name: 'Twitter/X API', category: 'Social', icon: '🐦', description: 'Post updates and announcements', url: 'https://developer.twitter.com', required: false },
    { id: 'discord', name: 'Discord Webhook', category: 'Social', icon: '💬', description: 'Server notifications and alerts', url: 'https://discord.com/developers', required: false },
    { id: 'telegram', name: 'Telegram Bot', category: 'Social', icon: '📱', description: 'Bot token for Telegram integration', url: 'https://t.me/BotFather', required: false },
    
    // Dev
    { id: 'vercel', name: 'Vercel', category: 'Dev', icon: '▲', description: 'Deploy frontend applications', url: 'https://vercel.com/dashboard', required: false },
    { id: 'github', name: 'GitHub', category: 'Dev', icon: '🐙', description: 'Repository access and CI/CD', url: 'https://github.com/settings/tokens', required: false },
    { id: 'figma', name: 'Figma', category: 'Dev', icon: '🎨', description: 'Design file access', url: 'https://figma.com/developers', required: false },
    
    // Payments
    { id: 'stripe', name: 'Stripe', category: 'Payments', icon: '💳', description: 'Payment processing', url: 'https://dashboard.stripe.com', required: false },
    { id: 'twilio', name: 'Twilio', category: 'Payments', icon: '📞', description: 'SMS and phone notifications', url: 'https://console.twilio.com', required: false },
    
    // Data
    { id: 'openweather', name: 'OpenWeather', category: 'Data', icon: '🌤️', description: 'Weather data for oracles', url: 'https://openweathermap.org/api', required: false },
    { id: 'coinmarketcap', name: 'CoinMarketCap', category: 'Data', icon: '💰', description: 'Crypto price data', url: 'https://pro.coinmarketcap.com', required: false },
  ],

  // State
  keys: {},
  encryptionKey: null,
  isOpen: false,

  // ============================================
  // INITIALIZATION
  // ============================================

  init() {
    this.loadKeys();
    console.log('🔑 API Key Wizard initialized');
  },

  // ============================================
  // KEY STORAGE
  // ============================================

  loadKeys() {
    try {
      const saved = localStorage.getItem('agentblue-api-keys');
      if (saved) {
        this.keys = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load keys:', e);
      this.keys = {};
    }
  },

  saveKeys() {
    try {
      localStorage.setItem('agentblue-api-keys', JSON.stringify(this.keys));
    } catch (e) {
      console.error('Failed to save keys:', e);
    }
  },

  saveKey(keyName, value) {
    this.keys[keyName] = {
      value: value,
      addedAt: new Date().toISOString(),
      lastUsed: null,
    };
    this.saveKeys();
  },

  getKey(keyName) {
    const key = this.keys[keyName];
    if (key) {
      key.lastUsed = new Date().toISOString();
      this.saveKeys();
      return key.value;
    }
    return null;
  },

  hasKey(keyName) {
    return !!this.keys[keyName]?.value;
  },

  deleteKey(keyName) {
    delete this.keys[keyName];
    this.saveKeys();
  },

  // ============================================
  // ENCRYPTION
  // ============================================

  async deriveKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('agentblue-salt-v1'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encryptKeys(password) {
    try {
      const key = await this.deriveKey(password);
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(this.keys));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const result = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      };
      
      localStorage.setItem('agentblue-api-keys-encrypted', JSON.stringify(result));
      localStorage.removeItem('agentblue-api-keys');
      
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async decryptKeys(password) {
    try {
      const encrypted = localStorage.getItem('agentblue-api-keys-encrypted');
      if (!encrypted) return { success: false, error: 'No encrypted keys found' };
      
      const { iv, data } = JSON.parse(encrypted);
      const key = await this.deriveKey(password);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );
      
      const decoder = new TextDecoder();
      this.keys = JSON.parse(decoder.decode(decrypted));
      this.saveKeys();
      
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid password or corrupted data' };
    }
  },

  // ============================================
  // IMPORT / EXPORT
  // ============================================

  exportKeys() {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      keys: this.keys,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentblue-keys-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importKeys(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.keys) {
            this.keys = { ...this.keys, ...data.keys };
            this.saveKeys();
            resolve({ success: true, count: Object.keys(data.keys).length });
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },

  // ============================================
  // UI HELPERS
  // ============================================

  maskKey(value) {
    if (!value || value.length < 8) return '••••••••';
    return value.slice(0, 4) + '••••••••••••••••' + value.slice(-4);
  },

  getKeyStatus(keyName) {
    return this.hasKey(keyName) ? 'configured' : 'missing';
  },

  getConfiguredCount() {
    return Object.keys(this.keys).length;
  },

  getTotalCount() {
    return this.skillKeys.length;
  },

  // ============================================
  // MAIN UI
  // ============================================

  open() {
    this.isOpen = true;
    this.render();
  },

  close() {
    this.isOpen = false;
    const modal = document.getElementById('api-key-wizard-modal');
    if (modal) modal.remove();
  },

  render() {
    // Remove existing modal
    const existing = document.getElementById('api-key-wizard-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'api-key-wizard-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    `;

    const configured = this.getConfiguredCount();
    const total = this.getTotalCount();

    modal.innerHTML = `
      <div style="
        background: var(--bg-paper);
        border: 3px solid var(--sketch-color);
        border-radius: var(--radius-sharp);
        box-shadow: var(--shadow-hard);
        width: 90%;
        max-width: 700px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      ">
        <!-- Header -->
        <div style="
          padding: 20px 24px;
          border-bottom: 2px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <h2 style="font-family: 'Patrick Hand', cursive; font-size: 24px; margin: 0; color: var(--base-blue);">
              🔑 API Key Wizard
            </h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">
              ${configured}/${total} keys configured
            </p>
          </div>
          <button onclick="ApiKeyWizard.close()" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-muted);
          ">×</button>
        </div>

        <!-- Search -->
        <div style="padding: 12px 24px; border-bottom: 1px solid var(--border-color);">
          <input 
            type="text" 
            id="api-key-search" 
            placeholder="Search skills..." 
            oninput="ApiKeyWizard.filterSkills(this.value)"
            style="
              width: 100%;
              padding: 10px 14px;
              border: 2px solid var(--border-color);
              border-radius: 8px;
              background: var(--bg-primary);
              font-family: 'Inter', sans-serif;
              font-size: 14px;
              outline: none;
            "
          >
        </div>

        <!-- Skills List -->
        <div id="api-key-list" style="
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        ">
          ${this.renderSkillsList()}
        </div>

        <!-- Footer -->
        <div style="
          padding: 16px 24px;
          border-top: 2px solid var(--border-color);
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; gap: 8px;">
            <button onclick="ApiKeyWizard.exportKeys()" class="picker-btn" style="font-size: 12px;">
              📤 Export
            </button>
            <label class="picker-btn" style="font-size: 12px; cursor: pointer;">
              📥 Import
              <input type="file" accept=".json" onchange="ApiKeyWizard.handleImport(this)" style="display: none;">
            </label>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="ApiKeyWizard.encryptAll()" class="picker-btn" style="font-size: 12px;">
              🔒 Encrypt All
            </button>
            <button onclick="ApiKeyWizard.close()" class="btn-goblin" style="font-size: 13px;">
              Done
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  },

  renderSkillsList() {
    const categories = {};
    
    this.skillKeys.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });

    return Object.entries(categories).map(([category, skills]) => `
      <div class="api-key-category" style="margin-bottom: 20px;">
        <h3 style="
          font-family: 'Patrick Hand', cursive;
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">${category}</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${skills.map(skill => this.renderSkillRow(skill)).join('')}
        </div>
      </div>
    `).join('');
  },

  renderSkillRow(skill) {
    const status = this.getKeyStatus(skill.id);
    const isConfigured = status === 'configured';
    const keyData = this.keys[skill.id];

    return `
      <div 
        class="api-key-skill ${isConfigured ? 'configured' : ''}" 
        data-skill-id="${skill.id}"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 2px solid ${isConfigured ? 'var(--base-green)' : 'var(--border-color)'};
          border-radius: 12px;
          background: ${isConfigured ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-primary)'};
          transition: all 0.2s ease;
          cursor: pointer;
        "
        onclick="ApiKeyWizard.showKeyInput('${skill.id}')"
      >
        <div style="font-size: 24px; flex-shrink: 0;">${skill.icon}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${skill.name}</span>
            ${skill.required ? '<span style="font-size: 10px; background: var(--base-red); color: white; padding: 2px 6px; border-radius: 4px;">REQUIRED</span>' : ''}
            ${isConfigured ? '<span style="font-size: 10px; background: var(--base-green); color: white; padding: 2px 6px; border-radius: 4px;">✓ SET</span>' : ''}
          </div>
          <p style="margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.4;">${skill.description}</p>
          ${isConfigured ? `<p style="margin: 4px 0 0; font-size: 11px; color: var(--base-green); font-family: 'Space Mono', monospace;">${this.maskKey(keyData.value)}</p>` : ''}
        </div>
        <div style="flex-shrink: 0;">
          ${isConfigured 
            ? `<button onclick="event.stopPropagation(); ApiKeyWizard.deleteKey('${skill.id}'); ApiKeyWizard.render();" style="background: none; border: none; cursor: pointer; font-size: 16px; color: var(--base-red);" title="Remove key">🗑️</button>`
            : `<span style="font-size: 20px; color: var(--border-color);">+</span>`
          }
        </div>
      </div>
    `;
  },

  // ============================================
  // KEY INPUT MODAL
  // ============================================

  showKeyInput(skillId) {
    const skill = this.skillKeys.find(s => s.id === skillId);
    if (!skill) return;

    const existingKey = this.keys[skillId]?.value || '';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--bg-paper);
        border: 3px solid var(--sketch-color);
        border-radius: var(--radius-sharp);
        box-shadow: var(--shadow-hard);
        width: 90%;
        max-width: 450px;
        padding: 24px;
      ">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 32px;">${skill.icon}</span>
          <div>
            <h3 style="font-family: 'Patrick Hand', cursive; font-size: 20px; margin: 0; color: var(--text-primary);">${skill.name}</h3>
            <p style="margin: 2px 0 0; font-size: 12px; color: var(--text-muted);">${skill.category}</p>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
          ${skill.description}. Get your key from <a href="${skill.url}" target="_blank" style="color: var(--base-blue);">${skill.url}</a>
        </p>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase;">
            API Key
          </label>
          <div style="position: relative;">
            <input 
              type="password" 
              id="api-key-input" 
              value="${existingKey}"
              placeholder="Paste your API key here..."
              style="
                width: 100%;
                padding: 12px 40px 12px 12px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-primary);
                font-family: 'Space Mono', monospace;
                font-size: 13px;
                outline: none;
              "
            >
            <button onclick="ApiKeyWizard.togglePasswordVisibility()" style="
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              cursor: pointer;
              font-size: 16px;
            ">👁️</button>
          </div>
        </div>

        <div style="background: var(--bg-secondary); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            🔒 <strong>Security note:</strong> Keys are stored locally in your browser. 
            Use the "Encrypt All" button to password-protect them.
          </p>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="ApiKeyWizard.closeKeyInput()" class="picker-btn" style="font-size: 13px;">
            Cancel
          </button>
          <button onclick="ApiKeyWizard.saveKeyFromInput('${skill.id}')" class="btn-goblin" style="font-size: 13px;">
            ${existingKey ? 'Update Key' : 'Save Key'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Focus input
    setTimeout(() => document.getElementById('api-key-input')?.focus(), 100);
    
    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeKeyInput();
    });
  },

  closeKeyInput() {
    const overlay = document.querySelector('[style*="z-index: 10001"]');
    if (overlay) overlay.remove();
  },

  saveKeyFromInput(skillId) {
    const input = document.getElementById('api-key-input');
    if (!input || !input.value.trim()) {
      alert('Please enter an API key');
      return;
    }

    this.saveKey(skillId, input.value.trim());
    this.closeKeyInput();
    this.render(); // Re-render main modal

    // Show success toast
    this.showToast(`✅ ${this.skillKeys.find(s => s.id === skillId)?.name} key saved!`);
  },

  togglePasswordVisibility() {
    const input = document.getElementById('api-key-input');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  // ============================================
  // FILTERING
  // ============================================

  filterSkills(query) {
    const skills = document.querySelectorAll('.api-key-skill');
    const categories = document.querySelectorAll('.api-key-category');
    
    const lowerQuery = query.toLowerCase();
    
    skills.forEach(skill => {
      const skillId = skill.dataset.skillId;
      const skillData = this.skillKeys.find(s => s.id === skillId);
      
      const matches = 
        skillData.name.toLowerCase().includes(lowerQuery) ||
        skillData.description.toLowerCase().includes(lowerQuery) ||
        skillData.category.toLowerCase().includes(lowerQuery);
      
      skill.style.display = matches ? 'flex' : 'none';
    });

    // Hide empty categories
    categories.forEach(cat => {
      const visibleSkills = cat.querySelectorAll('.api-key-skill[style*="flex"]');
      cat.style.display = visibleSkills.length > 0 ? 'block' : 'none';
    });
  },

  // ============================================
  // ENCRYPTION UI
  // ============================================

  async encryptAll() {
    const password = prompt('Enter a password to encrypt all API keys:');
    if (!password) return;
    
    const confirm = prompt('Confirm password:');
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    const result = await this.encryptKeys(password);
    if (result.success) {
      this.showToast('🔒 All keys encrypted successfully!');
    } else {
      alert('Encryption failed: ' + result.error);
    }
  },

  async decryptAll() {
    const password = prompt('Enter password to decrypt keys:');
    if (!password) return;

    const result = await this.decryptKeys(password);
    if (result.success) {
      this.showToast('🔓 Keys decrypted!');
      this.render();
    } else {
      alert('Decryption failed: ' + result.error);
    }
  },

  // ============================================
  // IMPORT / EXPORT HANDLERS
  // ============================================

  async handleImport(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      const result = await this.importKeys(file);
      this.showToast(`📥 Imported ${result.count} keys!`);
      this.render();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  },

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-paper);
      border: 2px solid var(--base-green);
      border-radius: 12px;
      padding: 12px 20px;
      box-shadow: var(--shadow-hard);
      z-index: 10002;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // ============================================
  // INTEGRATION HELPERS
  // ============================================

  // Get API key for engine.js
  getEngineApiKey() {
    // Priority: Kimi > OpenAI > Anthropic
    return this.getKey('kimi') || this.getKey('openai') || this.getKey('anthropic') || '';
  },

  getEngineProvider() {
    if (this.hasKey('kimi')) return 'kimi';
    if (this.hasKey('openai')) return 'openai';
    if (this.hasKey('anthropic')) return 'anthropic';
    return 'kimi';
  },

  // Get BaseScan API key for verification
  getBaseScanKey() {
    return this.getKey('basescan') || this.getKey('etherscan') || '';
  },

  // Check if all required keys are set
  isReady() {
    const required = this.skillKeys.filter(s => s.required);
    return required.every(s => this.hasKey(s.id));
  },

  getMissingRequired() {
    return this.skillKeys.filter(s => s.required && !this.hasKey(s.id));
  },
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.ApiKeyWizard = ApiKeyWizard;
  ApiKeyWizard.init();
}

console.log('🔑 API Key Wizard loaded');
