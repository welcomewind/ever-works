---
id: etherscan-ai-tools
title: 'Use Etherscan with AI tools'
sidebar_label: 'Etherscan AI Tools'
description: Connect Ever Works Agents and coding assistants to Etherscan through its MCP server, CLI, installable Skills, and machine-readable docs across 60+ chains.
---

# Use Etherscan with AI tools

Etherscan publishes an AI-facing tool stack on top of the same API that powers `etherscan.io`: an **MCP server**, a **CLI**, installable **Skills**, and a machine-readable docs surface for agents. If you want an Ever Works Agent to inspect wallets, contracts, transactions or flows onchain, this is the cleanest vendor-supported path.

The first document to hand an agent is Etherscan's own docs index:

- **Docs index:** [`https://docs.etherscan.io/llms.txt`](https://docs.etherscan.io/llms.txt)
- **Full docs export:** [`https://docs.etherscan.io/llms-full.txt`](https://docs.etherscan.io/llms-full.txt)

If you already know the page you want, append `.md` to its URL for a Markdown view.

![Build with AI: connect AI agents to the Etherscan API](https://mintcdn.com/etherscan/PrmCI8xWhLgr8YZ-/images/build-with-ai.png?fit=max&auto=format&n=PrmCI8xWhLgr8YZ-&q=85&s=4e798ad9ebe6c9a75d92bb70a7b9d0c1)

## What Etherscan ships

| Tool | What it is | Best fit inside Ever Works |
| ---- | ---------- | -------------------------- |
| **Etherscan MCP** | Tool-based, authenticated API access for chat agents | Register it as an external server with [MCP Connections](../features/mcp-connections.md) |
| **Etherscan CLI** | Terminal access with structured output | Use it beside the [CLI Quickstart](./cli-quickstart.md) for scripts and CI |
| **Etherscan Skills** | Installable agent instructions for working with onchain data | Add them through the [Skills Catalog](../features/skills-catalog.md) |
| **Etherscan Flow** | A specialized Skill for tracing and visualizing money flows | Attach it to an Agent that does investigations or case-building |

Etherscan documents these AI tools under its **Build with AI** section:

- [`/build-with-ai/mcp`](https://docs.etherscan.io/build-with-ai/mcp)
- [`/build-with-ai/cli`](https://docs.etherscan.io/build-with-ai/cli)
- [`/build-with-ai/skills`](https://docs.etherscan.io/build-with-ai/skills)
- [`/build-with-ai/skills/etherscan-flow`](https://docs.etherscan.io/build-with-ai/skills/etherscan-flow)
- [`/build-with-ai/docs-mcp`](https://docs.etherscan.io/build-with-ai/docs-mcp)

## Before you connect it

You need an **Etherscan API key**. Create one here:

- [`https://docs.etherscan.io/set-up-your-api-key`](https://docs.etherscan.io/set-up-your-api-key)

Chain coverage and endpoint access depend on your Etherscan plan:

- [`https://etherscan.io/api/pricing`](https://etherscan.io/api/pricing)
- [`https://docs.etherscan.io/supported-chains`](https://docs.etherscan.io/supported-chains)

## The fastest way to use it in Ever Works

### 1. Give an Agent Etherscan's MCP tools

If Etherscan exposes the capability you need as MCP, add it under **Settings → Connections** and bind it to the Agent that should use it. That is the native Ever Works path for vendor MCP servers.

Read first:

- [MCP Connections](../features/mcp-connections.md) — external MCP servers inside Ever Works
- [Use Ever Works from an MCP Client](./mcp-server-setup.md) — the opposite direction, if you also want external clients to drive Ever Works

### 2. Add Etherscan Skills for agent behavior

If the value is not just raw tool access but also better agent judgment — how to inspect an address, verify a contract, or explain a token flow — install the relevant Etherscan Skill and bind it to the Agent.

Read first:

- [Skills Catalog](../features/skills-catalog.md)
- [Skills API](../api/skills.md)

### 3. Use the CLI for repeatable scripts

For CI, shell workflows, or local investigations, the Etherscan CLI belongs in the same toolbox as the Ever Works CLI: one for your onchain data access, one for your platform operations.

Read first:

- [CLI Quickstart](./cli-quickstart.md)

## Machine-readable docs for agents

Etherscan's docs are unusually agent-friendly:

| Surface | Use it for |
| ------- | ---------- |
| `llms.txt` | Discover the documentation map before browsing deeper |
| `llms-full.txt` | Give an agent one large export when recall matters more than targeted retrieval |
| Page `.md` twins | Pull a single doc page as Markdown |
| Docs MCP | Let an agent search the docs as it works instead of preloading them |

That fits naturally with Ever Works:

- use **MCP Connections** when you want the model to call Etherscan's tools directly
- use **Skills** when you want reusable onchain investigation instructions
- use the **Knowledge Base** when you want to preserve selected Etherscan guidance beside your own research

## Recommended setup pattern

1. Start with Etherscan's `llms.txt` so the agent knows the docs layout.
2. Add the Etherscan MCP server in Ever Works if you want live tool calls.
3. Install Etherscan Skills for the Agents that do onchain work often.
4. Reserve the CLI for automation, batch jobs, and CI checks.
5. Use **Etherscan Flow** for money-flow tracing work where a normal wallet lookup is not enough.

## Related Ever Works docs

- [MCP Connections](../features/mcp-connections.md)
- [Skills Catalog](../features/skills-catalog.md)
- [Knowledge Base](../features/knowledge-base.md)
- [CLI Quickstart](./cli-quickstart.md)
