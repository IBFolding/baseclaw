# Project Scaffold Skill

## Overview
Orchestrates full BaseClaw project generation. Creates Next.js app, installs dependencies, copies templates, wires contracts.

## Flow
1. Detect contract type from deployment
2. Select matching template
3. Generate Next.js project structure
4. Install dependencies (wagmi, viem, rainbowkit, shadcn)
5. Copy template files
6. Inject contract address and ABI
7. Configure wallet connection
8. Build and deploy to Vercel

## Commands
- `project.scaffold.create` — Create new project from template
- `project.scaffold.update` — Update existing project with new contracts
- `project.scaffold.deploy` — Deploy to Vercel

## Dependencies
- webpage-templates
- nextjs-expert
- appdeploy

## Usage
```
baseclaw.project.scaffold({
  name: "MyTokenProject",
  contractType: "erc20",
  contractAddress: "0x...",
  abi: [...],
  template: "token-launch"
})
```
