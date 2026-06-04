// Agent BLUE Beginner-Friendly Extensions
// Additional features for better UX

// Extend the app object with new methods
(function() {
    // Wait for app to be initialized
    const checkInterval = setInterval(() => {
        if (window.app && typeof window.app.showModalContent === 'function') {
            clearInterval(checkInterval);
            extendApp();
        }
    }, 100);

    function extendApp() {
        const app = window.app;

        // Gas Estimator
        app.showGasEstimator = function() {
            const content = `
                <div style="padding: 24px;">
                    <h2 style="font-family: 'Patrick Hand', cursive; color: var(--base-blue); margin-bottom: 24px;">⛽ Gas Estimator</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Estimate gas costs for common operations:</p>
                    <div style="display: grid; gap: 12px;">
                        <button class="picker-btn" onclick="app.estimateGasFor('erc20')" style="text-align: left; padding: 16px;">🪙 ERC20 Token</button>
                        <button class="picker-btn" onclick="app.estimateGasFor('erc721')" style="text-align: left; padding: 16px;">🎨 NFT Collection</button>
                        <button class="picker-btn" onclick="app.estimateGasFor('staking')" style="text-align: left; padding: 16px;">⚡ Staking Pool</button>
                        <button class="picker-btn" onclick="app.estimateGasFor('dao')" style="text-align: left; padding: 16px;">🏛️ DAO</button>
                    </div>
                    <div id="gas-results" style="margin-top: 24px;"></div>
                </div>
            `;
            this.showModalContent('Gas Estimator', content);
        };

        app.estimateGasFor = async function(type) {
            try {
                const estimates = await Agent BLUEEngine.estimateGas(type);
                let html = '<div style="border: 2px solid var(--sketch-color); border-radius: 12px; padding: 16px;">';
                html += '<h3 style="font-family: "Patrick Hand", cursive; margin-bottom: 12px;">Estimates for ' + type.toUpperCase() + '</h3>';
                for (const [action, data] of Object.entries(estimates)) {
                    html += '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--sketch-color);">';
                    html += '<span>' + action + '</span>';
                    html += '<span>' + data.gas + ' gas (~' + data.costETH + ' ETH / $' + data.costUSD + ')</span>';
                    html += '</div>';
                }
                html += '</div>';
                document.getElementById('gas-results').innerHTML = html;
            } catch (err) {
                document.getElementById('gas-results').innerHTML = '<p style="color: red;">Error: ' + err.message + '</p>';
            }
        };

        // Faucet Links
        app.showFaucetLinks = function() {
            const faucets = Agent BLUEEngine.getFaucetLinks().baseSepolia;
            const content = `
                <div style="padding: 24px;">
                    <h2 style="font-family: 'Patrick Hand', cursive; color: var(--base-blue); margin-bottom: 24px;">🚰 Get Test ETH</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Free ETH for Base Sepolia testnet:</p>
                    <div style="display: grid; gap: 12px;">
                        ${faucets.map(f => `
                            <a href="${f.url}" target="_blank" class="picker-btn" style="text-align: left; padding: 16px; text-decoration: none; color: inherit;">
                                <div style="font-weight: 600;">${f.name}</div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">${f.description}</div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
            this.showModalContent('Faucets', content);
        };

        // Network Switcher
        app.switchNetwork = async function() {
            try {
                const result = await Agent BLUEEngine.addTestnetToWallet();
                if (result.success) {
                    this.addMessage('system', '✅ Base Sepolia added to your wallet!');
                } else {
                    this.addMessage('system', '⚠️ ' + result.error);
                }
            } catch (err) {
                this.addMessage('system', '❌ Error: ' + err.message);
            }
        };

        // Planning Mode
        app.togglePlanningMode = function() {
            this.planningMode = !this.planningMode;
            const planArea = document.getElementById('planning-area');
            if (planArea) {
                planArea.style.display = this.planningMode ? 'block' : 'none';
            }
            this.addMessage('system', this.planningMode ? '📝 Planning Mode ON — Describe your project plan and the AI will follow it' : '📝 Planning Mode OFF');
        };

        app.executePlan = async function() {
            const planText = document.getElementById('plan-input').value.trim();
            if (!planText) {
                this.addMessage('system', '⚠️ Please enter a plan first');
                return;
            }
            
            this.addMessage('user', '📋 EXECUTING PLAN:\n' + planText);
            document.getElementById('plan-input').value = '';
            
            // Send plan to AI with special instruction
            const planPrompt = `Follow this project plan step by step. Execute each phase and report progress:\n\n${planText}\n\nStart with Phase 1 now.`;
            
            try {
                const response = await Agent BLUEEngine.chat(planPrompt);
                this.addMessage('system', response);
            } catch (err) {
                this.addMessage('system', '❌ Error: ' + err.message);
            }
        };

        // Thinking Mode Toggle
        app.toggleThinkingMode = function() {
            this.thinkingMode = !this.thinkingMode;
            Agent BLUEEngine.thinkingMode = this.thinkingMode;
            this.addMessage('system', this.thinkingMode ? '🧠 Thinking Mode ON — Deep reasoning with detailed explanations' : '⚡ Instant Mode ON — Quick responses');
        };

        // NFT Collection Generator UI
        app.showNFTCollectionGenerator = function() {
            const content = `
                <div style="padding: 24px;">
                    <h2 style="font-family: 'Patrick Hand', cursive; color: var(--base-blue); margin-bottom: 24px;">
                        🎨 AI NFT Collection Generator
                    </h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">
                        Generate a complete NFT collection with AI-created art layers, metadata, and deploy-ready contract.
                    </p>
                    
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Collection Name</label>
                            <input type="text" id="nft-collection-name" placeholder="CryptoPunks" style="width: 100%; padding: 12px; border: 2px solid var(--sketch-color); border-radius: 8px; background: var(--bg-paper);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Symbol</label>
                            <input type="text" id="nft-collection-symbol" placeholder="PUNK" style="width: 100%; padding: 12px; border: 2px solid var(--sketch-color); border-radius: 8px; background: var(--bg-paper);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Max Supply</label>
                            <input type="number" id="nft-collection-supply" placeholder="10000" style="width: 100%; padding: 12px; border: 2px solid var(--sketch-color); border-radius: 8px; background: var(--bg-paper);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Mint Price (ETH)</label>
                            <input type="number" id="nft-collection-price" placeholder="0.01" step="0.001" style="width: 100%; padding: 12px; border: 2px solid var(--sketch-color); border-radius: 8px; background: var(--bg-paper);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description</label>
                            <textarea id="nft-collection-desc" placeholder="A unique collection of generative art..." style="width: 100%; padding: 12px; border: 2px solid var(--sketch-color); border-radius: 8px; background: var(--bg-paper); min-height: 80px;"></textarea>
                        </div>
                        
                        <div style="border: 2px solid var(--sketch-color); border-radius: 12px; padding: 16px;">
                            <h3 style="font-family: 'Patrick Hand', cursive; margin-bottom: 12px;">🎭 Art Layers</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;">
                                <div>🎨 Backgrounds: 5</div>
                                <div>👤 Bases: 5</div>
                                <div>👀 Eyes: 5</div>
                                <div>👄 Mouths: 5</div>
                                <div>🎩 Accessories: 5</div>
                                <div>👕 Clothing: 5</div>
                                <div>✨ Special: 5</div>
                                <div>📊 Total Combos: 78,125</div>
                            </div>
                        </div>
                        
                        <button class="picker-btn" onclick="app.generateNFTCollection()" style="background: var(--base-blue); color: white; padding: 16px;">
                            🚀 Generate Collection
                        </button>
                    </div>
                    
                    <div id="nft-collection-results" style="margin-top: 24px;"></div>
                </div>
            `;
            this.showModalContent('NFT Collection Generator', content);
        };

        app.generateNFTCollection = async function() {
            const name = document.getElementById('nft-collection-name').value || 'MyCollection';
            const symbol = document.getElementById('nft-collection-symbol').value || 'NFT';
            const supply = parseInt(document.getElementById('nft-collection-supply').value) || 100;
            const price = document.getElementById('nft-collection-price').value || '0.01';
            const desc = document.getElementById('nft-collection-desc').value || 'A unique generative art collection';
            
            const resultsDiv = document.getElementById('nft-collection-results');
            resultsDiv.innerHTML = '<p>🎨 Generating collection... This may take a moment.</p>';
            
            try {
                const collection = await NFTGenerator.generateCollection({
                    name, symbol, maxSupply: supply, mintPrice: price, description: desc
                });
                
                const contract = NFTGenerator.generateContract({
                    name, symbol, maxSupply: supply, mintPrice: price
                });
                
                const metadata = NFTGenerator.exportMetadata(collection);
                const rarityReport = NFTGenerator.exportRarityReport(collection);
                
                let html = '<div style="border: 2px solid var(--sketch-color); border-radius: 12px; padding: 16px;">';
                html += '<h3 style="font-family: "Patrick Hand", cursive; margin-bottom: 12px;">✅ Collection Generated!</h3>';
                html += '<p><strong>Name:</strong> ' + collection.name + '</p>';
                html += '<p><strong>Supply:</strong> ' + collection.maxSupply + '</p>';
                html += '<p><strong>Rarity Distribution:</strong></p>';
                html += '<ul>';
                for (const [rarity, count] of Object.entries(collection.rarityDistribution)) {
                    html += '<li>' + rarity + ': ' + count + ' (' + ((count / supply) * 100).toFixed(1) + '%)</li>';
                }
                html += '</ul>';
                html += '<div style="display: grid; gap: 8px; margin-top: 16px;">';
                html += '<button class="picker-btn" onclick="app.downloadNFTContract()">📥 Download Contract</button>';
                html += '<button class="picker-btn" onclick="app.downloadNFTMetadata()">📥 Download Metadata</button>';
                html += '<button class="picker-btn" onclick="app.downloadNFTRarity()">📥 Download Rarity Report</button>';
                html += '<button class="picker-btn" style="background: var(--base-blue); color: white;" onclick="app.deployNFTCollection()">🚀 Deploy to Base</button>';
                html += '</div>';
                html += '</div>';
                
                resultsDiv.innerHTML = html;
                
                // Store for download
                window._nftContract = contract;
                window._nftMetadata = metadata;
                window._nftRarity = JSON.stringify(rarityReport, null, 2);
                window._nftCollection = collection;
                
            } catch (err) {
                resultsDiv.innerHTML = '<p style="color: red;">❌ Error: ' + err.message + '</p>';
            }
        };

        app.downloadNFTContract = function() {
            const blob = new Blob([window._nftContract], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = window._nftCollection.symbol + 'NFT.sol';
            a.click();
            URL.revokeObjectURL(url);
        };

        app.downloadNFTMetadata = function() {
            const blob = new Blob([window._nftMetadata], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'metadata.json';
            a.click();
            URL.revokeObjectURL(url);
        };

        app.downloadNFTRarity = function() {
            const blob = new Blob([window._nftRarity], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rarity-report.json';
            a.click();
            URL.revokeObjectURL(url);
        };

        app.deployNFTCollection = function() {
            this.closeModal();
            this.startChat('Deploy the NFT collection ' + window._nftCollection.name + ' with symbol ' + window._nftCollection.symbol + ' and max supply ' + window._nftCollection.maxSupply);
        };
            const badge = document.getElementById('testnet-badge');
            const faucetBtn = document.getElementById('faucet-btn');
            const networkBtn = document.getElementById('network-btn');
            
            if (badge && faucetBtn && networkBtn) {
                if (Agent BLUEEngine.chain === 'sepolia') {
                    badge.style.display = 'inline-block';
                    faucetBtn.style.display = 'inline-block';
                    networkBtn.textContent = '🌐 Sepolia';
                } else {
                    badge.style.display = 'none';
                    faucetBtn.style.display = 'none';
                    networkBtn.textContent = '🌐 Mainnet';
                }
            }
        };

        // Auto-update network indicator when connected
        const originalConnectWallet = app.connectWallet;
        app.connectWallet = async function() {
            const result = await originalConnectWallet.call(this);
            this.updateNetworkIndicator();
            return result;
        };

        console.log('✅ Agent BLUE beginner-friendly extensions loaded');
    }
})();

// Global functions for button clicks
function openFaucet() {
    if (window.app) window.app.showFaucetLinks();
}

function showGasEstimator() {
    if (window.app) window.app.showGasEstimator();
}

function switchNetwork() {
    if (window.app) window.app.switchNetwork();
}
}
