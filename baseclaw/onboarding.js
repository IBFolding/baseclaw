// Agent BLUE Onboarding System
// Guided tour for first-time users

const Onboarding = {
    steps: [
        {
            target: '.nav-logo',
            title: 'Welcome to Agent BLUE! 🦞',
            content: 'Your AI-powered blockchain development agent. Let\'s take a quick tour.',
            position: 'bottom'
        },
        {
            target: '#settings-btn',
            title: 'Step 1: Add API Key',
            content: 'Click here to add your Kimi, OpenAI, or Anthropic API key. This powers the AI.',
            position: 'left'
        },
        {
            target: '#wallet-btn',
            title: 'Step 2: Connect Wallet',
            content: 'Connect MetaMask or any EIP-1193 wallet. Start with Base Sepolia (free!).',
            position: 'left'
        },
        {
            target: '#chat-input',
            title: 'Step 3: Start Building',
            content: 'Type what you want to build in the chat below. Try: "Create a token called MoonCoin"',
            position: 'top'
        },
        {
            target: '#quick-actions',
            title: 'Step 4: Quick Actions',
            content: 'Use these shortcuts for common tasks: Build, Test, Deploy, NFT, Tutorial, etc.',
            position: 'right'
        },
        {
            target: '#templates-btn',
            title: 'Step 5: Contract Templates',
            content: 'Browse 20 pre-built Solidity templates. Click to customize and deploy.',
            position: 'right'
        },
        {
            target: '#web-templates-btn',
            title: 'Step 6: Web Templates',
            content: 'Get 5 HTML templates for your project landing page, dashboard, NFT site, etc.',
            position: 'right'
        },
        {
            target: '.help-fab',
            title: 'Step 7: Need Help?',
            content: 'Click the ? button anytime for help, FAQ, examples, or to restart this tour.',
            position: 'left'
        }
    ],

    currentStep: 0,
    isActive: false,
    overlay: null,
    tooltip: null,

    start() {
        // DISABLED - causes app freeze. User must use Tutorial button instead.
        console.log('Onboarding disabled');
        return;
    },

    restart() {
        localStorage.removeItem('agentblue-onboarding-complete');
        this.forceStart = true;
        this.start();
    },

    skip() {
        this.complete();
    },

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 9998;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.overlay);

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        this.tooltip.style.cssText = `
            position: fixed; z-index: 9999; max-width: 320px;
            background: var(--bg-paper, #FAF8F5);
            border: 2px solid var(--sketch-color, #4A4540);
            border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
            padding: 24px; box-shadow: 4px 4px 0 rgba(0,82,255,0.2);
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(this.tooltip);
    },

    showStep() {
        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.next();
            return;
        }

        // Clear previous highlight
        this.clearHighlight();

        // Highlight target
        target.style.position = 'relative';
        target.style.zIndex = '10000';
        target.style.boxShadow = '0 0 0 4px var(--base-blue, #0052FF)';

        // Position tooltip
        const rect = target.getBoundingClientRect();
        let top, left;

        switch (step.position) {
            case 'bottom':
                top = rect.bottom + 16;
                left = rect.left + (rect.width / 2) - 160;
                break;
            case 'top':
                top = rect.top - 200;
                left = rect.left + (rect.width / 2) - 160;
                break;
            case 'left':
                top = rect.top;
                left = rect.left - 340;
                break;
            case 'right':
                top = rect.top;
                left = rect.right + 16;
                break;
        }

        // Keep in viewport
        top = Math.max(16, Math.min(top, window.innerHeight - 250));
        left = Math.max(16, Math.min(left, window.innerWidth - 340));

        this.tooltip.style.top = top + 'px';
        this.tooltip.style.left = left + 'px';

        // Content with interactive elements for step 3
        let interactiveContent = '';
        if (this.currentStep === 3) {
            // Step 3: Start Building - add input field
            interactiveContent = `
                <div style="margin-top: 12px; margin-bottom: 12px;">
                    <input type="text" id="onboarding-input" placeholder="Create a token called MoonCoin" 
                        style="width: 100%; padding: 10px; border: 2px solid var(--base-blue); border-radius: 8px; font-size: 14px;"
                        onkeydown="if(event.key==='Enter'){Onboarding.completeStep3();}"
                    >
                </div>
            `;
        }

        this.tooltip.innerHTML = `
            <div style="font-family: 'Patrick Hand', cursive; font-size: 20px; font-weight: 700; color: var(--base-blue, #0052FF); margin-bottom: 8px;">
                ${step.title}
            </div>
            <div style="color: var(--text-secondary, #6B6560); font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
                ${step.content}
            </div>
            ${interactiveContent}
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--text-muted, #9B9590);">
                    ${this.currentStep + 1} / ${this.steps.length}
                </span>
                <div style="display: flex; gap: 8px;">
                    ${this.currentStep > 0 ? '<button class="onboarding-btn" onclick="Onboarding.prev()">Back</button>' : ''}
                    ${this.currentStep === 0 ? '<button class="onboarding-btn" onclick="Onboarding.skip()">Skip Tour</button>' : ''}
                    <button class="onboarding-btn primary" onclick="Onboarding.next()">
                        ${this.currentStep === this.steps.length - 1 ? 'Finish!' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        // Add styles if not present
        if (!document.getElementById('onboarding-styles')) {
            const styles = document.createElement('style');
            styles.id = 'onboarding-styles';
            styles.textContent = `
                .onboarding-btn {
                    padding: 8px 16px;
                    border: 2px solid var(--sketch-color, #4A4540);
                    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
                    background: transparent;
                    color: var(--text-primary, #2D2926);
                    font-family: 'Patrick Hand', cursive;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .onboarding-btn:hover {
                    border-color: var(--base-blue, #0052FF);
                    color: var(--base-blue, #0052FF);
                }
                .onboarding-btn.primary {
                    background: var(--base-blue, #0052FF);
                    color: white;
                    border-color: var(--base-blue, #0052FF);
                }
                .onboarding-btn.primary:hover {
                    background: #3B6BFF;
                }
            `;
            document.head.appendChild(styles);
        }
    },

    completeStep3() {
        const input = document.getElementById('onboarding-input');
        if (input && input.value.trim()) {
            // Send the message to the chat
            if (typeof app !== 'undefined' && app.startChat) {
                app.startChat(input.value.trim());
            }
            this.next();
        }
    },

    next() {
        this.clearHighlight();
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.complete();
        } else {
            this.showStep();
        }
    },

    prev() {
        this.clearHighlight();
        this.currentStep--;
        this.showStep();
    },

    clearHighlight() {
        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        if (target) {
            target.style.position = '';
            target.style.zIndex = '';
            target.style.boxShadow = '';
        }
    },

    complete() {
        this.clearHighlight();
        this.isActive = false;
        localStorage.setItem('agentblue-onboarding-complete', 'true');
        
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => this.overlay.remove(), 300);
        }
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            setTimeout(() => this.tooltip.remove(), 300);
        }

        // Show completion message
        app.addMessage('system', '🎉 Welcome to Agent BLUE! You\'re all set. Try typing "Create a token called MoonCoin" to get started.');
    },

    restart() {
        localStorage.removeItem('agentblue-onboarding-complete');
        this.start();
    }
};

// Manual start only - user must click Tutorial button
// Onboarding.start() is called from app.startTutorial()

window.Onboarding = Onboarding;
