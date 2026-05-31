# BaseClaw Skill

## Overview
BaseClaw adds project-oriented AI coding to OpenClaw. Every chat can belong to a project with its own repo, tasks, memory, and wallet policy.

## Tools Provided

### Project Management
- `baseclaw.project.create` — Create a new project
- `baseclaw.project.list` — List all projects
- `baseclaw.project.load` — Load a project by slug
- `baseclaw.project.update` — Update project settings
- `baseclaw.project.delete` — Archive/delete a project

### Task Management
- `baseclaw.task.create` — Create a task
- `baseclaw.task.list` — List tasks for a project
- `baseclaw.task.update` — Update task status
- `baseclaw.task.delete` — Delete a task

### Chat Management
- `baseclaw.chat.attach` — Attach current chat to a project
- `baseclaw.chat.detach` — Detach chat from project
- `baseclaw.chat.list` — List chats for a project

### Context
- `baseclaw.context.inject` — Inject project context into current chat
- `baseclaw.context.build` — Build context injection files

### Wallet/Chain
- `baseclaw.chain.config` — Get Base chain configuration
- `baseclaw.wallet.policy` — Get/set wallet policy
- `baseclaw.wallet.validate` — Validate a transaction against policy

### Memory
- `baseclaw.memory.append` — Append to project memory
- `baseclaw.decision.log` — Log a decision
- `baseclaw.action.log` — Log an action

## Web Development Skills (Integrated)
BaseClaw now includes web development capabilities for building landing pages, dApps, and web interfaces:

### Project Wizard
After deploying a contract, BaseClaw can:
1. Detect contract type (ERC20, ERC721, Staking, DAO)
2. Suggest matching UI templates
3. Generate a complete Next.js dApp
4. Auto-wire contract address and ABI
5. Deploy to Vercel

### Frontend Frameworks
- **Next.js** — React framework with SSR/SSG
- **React** — Component-based UI development
- **TypeScript** — Type-safe development
- **shadcn/ui** — Modern UI component library

### Web3 Integration
- **wagmi/viem** — Ethereum interaction
- **RainbowKit** — Wallet connection UI
- **Ethers.js** — Blockchain interactions

### Template System
- **ERC20 Page** — Token info, transfer, mint, balance
- **NFT Collection** — Gallery, mint, owner dashboard
- **Staking Pool** — Stake/unstake, rewards, APY
- **DAO Dashboard** — Proposals, voting, execution

### Usage
```
User: Deploy a token called MoonCoin
Agent: [deploys contract]
Agent: Want a webpage for this? [shows templates]
User: Yes, the token launch page
Agent: [generates Next.js app with token UI]
```

## Usage

### Creating a Web Project
```
User: Create a new project called "Lampworks" for my NFT marketplace
Agent: [uses baseclaw.project.create]
```

### Attaching a Chat
```
User: Work on the Lampworks project
Agent: [uses baseclaw.chat.attach]
```

### Creating Tasks
```
User: Add wallet connect and Stripe checkout
Agent: [uses baseclaw.task.create for each task]
```

### Building a Landing Page
```
User: Build a landing page for my project
Agent: 
1. Create Next.js app with shadcn/ui
2. Add BaseClaw logo (assets/baseclaw-logo.png)
3. Implement responsive design
4. Deploy to Vercel
```

### Context Injection
When a chat is attached to a project, BaseClaw automatically injects:
1. PROJECT.md — what this project is
2. MEMORY.md — persistent facts
3. DECISIONS.md — decisions made
4. TASKS.md — current tasks
5. Chat summary (if exists)
6. Safety rules
7. Design system (if exists)

## Assets
- **Logo:** `assets/baseclaw-logo.png` — Use for landing pages, headers, and branding
- **Logo Path:** `~/.openclaw/workspace/skills/baseclaw/assets/baseclaw-logo.png`

## Design Guidelines
When building BaseClaw web interfaces:
- Use the logo in header/nav components
- Primary color: Base blue (#0052FF) or neutral dark
- Clean, minimal aesthetic
- Code/terminal visual motifs welcome
- Professional but approachable

## Safety
- No auto-trading
- No private key storage
- No uncapped spending
- No auto-posting
- No mainnet deploy without approval
- Default to Base Sepolia for testing

## Installation
1. Copy `skills/baseclaw/` to `~/.openclaw/workspace/skills/`
2. Add `"baseclaw"` to `agents.defaults.skills` in `~/.openclaw/openclaw.json`
3. Restart OpenClaw gateway

## Configuration
Add to `~/.openclaw/openclaw.json`:
```json5
{
  baseclaw: {
    projectsRoot: "~/.openclaw/projects",
    defaultChain: "base-sepolia",
    defaultAutonomy: "assisted",
    webDefaults: {
      framework: "nextjs",
      styling: "tailwind",
      uiLibrary: "shadcn",
      deployment: "vercel"
    }
  },
}
```
