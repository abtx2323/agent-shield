<div align="center">

# 🛡️ AgentShield — Visual Red-Team & MCP Hijack Range

### ▶️ **[Launch the live demo → abtx2323.github.io/agent-shield](https://abtx2323.github.io/agent-shield/)**

Fire real-world prompt-injection, MCP tool-poisoning and RAG-hijack payloads at an AI agent, then watch six concentric guardrail rings stop them in real time.

[![Deploy to GitHub Pages](https://github.com/abtx2323/agent-shield/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/abtx2323/agent-shield/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg)](LICENSE)
![Single file](https://img.shields.io/badge/single%20file-index.html-00F0FF.svg)
![No backend](https://img.shields.io/badge/backend-none-6366F1.svg)

</div>

---

## What it is

AgentShield is a single-file, zero-backend web app that shows how an over-privileged AI agent gets hijacked, and what it takes to harden it. Pick a target profile, toggle guardrail rings, fire attack payloads, inspect the agent's execution trace, and export a hardened config for your own repo.

No API keys, no model calls, nothing leaves your browser. Every attack, trace and remediation is a scripted simulation of documented attack patterns, so it's safe to demo anywhere.

## 8 MCP / RAG attack vectors

| ID | Attack | Hijacked tool | Stopped by |
|---|---|---|---|
| ATK-01 | Indirect injection via hidden HTML comment | `send_email` | L1 + L3 |
| ATK-02 | MCP tool poisoning / shadow schema override (`~/.ssh/id_rsa`) | `read_file` | L4 + L5 |
| ATK-03 | Markdown image zero-click data exfiltration | `http_fetch` | L6 |
| ATK-04 | Crescendo "developer mode" Base64 persona jailbreak | `bash_exec` | L2 + L3 |
| ATK-05 | Argument injection via unsanitized filename | `bash_exec` | L4 + L5 |
| ATK-06 | RAG-poisoned invoice PDF refund hijack | `db_query` | L1 + L5 |
| ATK-07 | Unicode Plane-14 tag smuggling (invisible instructions) | `send_email` | L2 |
| ATK-08 | Recursive tool-retry token-exhaustion DoS | `http_fetch` | L3 + L4 |

Each vector comes with its raw payload, an agent execution trace that flips from breach to block as you enable the right rings, and a before/after remediation diff you can copy in one click.

## 6 concentric defense-in-depth rings

| Ring | Guardrail | What it does |
|---|---|---|
| L1 | Untrusted-data XML sandboxing | Wraps emails, web pages and RAG chunks in `<untrusted_context>` and treats them as passive data |
| L2 | Injection heuristics & canary filter | Catches invisible Unicode tags, Base64 payloads and persona-override triggers before the LLM sees them |
| L3 | Instruction hierarchy | System > user > tool output, with tool retries capped at 2 |
| L4 | MCP schema validation & allowlist | Pins tool descriptions, rejects shell metacharacters, locks file paths to `/workspace/safe/` |
| L5 | Human-in-the-loop gate | Requires approval before `bash_exec`, `send_email` or `db_query` mutations |
| L6 | Egress & Markdown-image exfil blocker | Strips external image tags and blocks calls to unknown domains |

An attack is blocked only when **all** of its required rings are on. Start from one of four target profiles (Naive Support Bot 0/6, DevOps MCP Agent 2/6, Executive Email Assistant 3/6, Zero-Trust Fortress 6/6) or build your own, and the static blueprint audit tells you what's still exposed.

## Dual tactical canvas

- **Radar Defense view.** The agent core sits at the center, orbited by its five MCP tools, inside six animated defense rings. Eight threat nodes circle the perimeter: click one to fire it and watch it either burst on a ring or punch through and light up the tool it hijacks.
- **Kill-Chain Flow view.** The same attacks run left to right in eight lanes, through six guardrail gates, toward the agent's tools.

Both views share a kill-chain timeline scrubber, 0.5× / 1× / 2× speed, pause and single-step, synthesized SFX, and live KPIs for resilience score, blocked vs. breached, and estimated token burn. **Fire Red-Team Swarm** launches all eight at once.

## 1-click `AGENTS.md` / `SECURITY_POLICY.json` export

Hit **Auto-Harden All**, then **Export Config**. AgentShield compiles your current ring setup into:

- **`AGENTS.md`**: a guardrail spec with the privilege hierarchy, active defense matrix and per-tool MCP boundaries, ready to drop into a Claude Code, Cursor or custom agent repo.
- **`SECURITY_POLICY.json`**: a machine-readable policy covering input sanitization, runtime limits, MCP server policy and egress rules.

One click copies either file to your clipboard.

## Run it locally

```bash
git clone https://github.com/abtx2323/agent-shield.git
cd agent-shield
open index.html
```

`open` is macOS; use `xdg-open index.html` on Linux or `start index.html` on Windows. There's no build step since it's one HTML file. Tailwind and the fonts load from CDNs, so you'll want an internet connection for the full styling.

## Deployment

Every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which publishes the repository root to GitHub Pages.

## License

Released under the [MIT License](LICENSE). Use it, fork it, demo it.

> AgentShield is an educational simulator. The payloads are illustrative and run against a scripted agent, not a live model.
