# AI Agents & Tooling for Power Platform Playwright Samples

This repo ships **AI tooling for both [Claude Code](https://claude.com/claude-code) and [GitHub Copilot](https://github.com/features/copilot)**, so you can use whichever assistant you prefer to run, debug, and author Playwright tests against your Power Platform environment.

The same three workflows are available in both ecosystems:

| Workflow     | What it does                                                                                                                                                          | When to use it                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **validate** | Walks you through `.env`, auth, and a Playwright project, runs it, and explains failures using [CLAUDE.md anti-patterns](CLAUDE.md#ai-agent-reference-anti-patterns). | First-time setup, regression checks, CI dry runs locally.     |
| **diagnose** | Investigates a failing test — maps the error to known anti-patterns, walks the trace zip, points at the root cause.                                                   | A test failed and you want a plain-English explanation + fix. |
| **author**   | Scaffolds a new test using the toolkit Page Objects + the Playwright MCP server for live selector capture.                                                            | Adding regression coverage for a new flow.                    |

> **Heads-up:** all three workflows read [CLAUDE.md](CLAUDE.md) — that file is the single source of truth for environment setup, project layout, and the eleven anti-patterns this codebase has learned the hard way. Keep it open in another tab.

---

## Quick reference

| Surface                       | validate                                                                             | diagnose                                                                             | author                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **Claude Code agent**         | [.claude/agents/pp-playwright-validate.md](.claude/agents/pp-playwright-validate.md) | [.claude/agents/pp-playwright-diagnose.md](.claude/agents/pp-playwright-diagnose.md) | [.claude/agents/pp-playwright-author.md](.claude/agents/pp-playwright-author.md) |
| **Claude Code slash command** | `/pp-validate`                                                                       | `/pp-diagnose`                                                                       | `/pp-author`                                                                     |
| **Copilot prompt file**       | [.github/prompts/pp-validate.prompt.md](.github/prompts/pp-validate.prompt.md)       | [.github/prompts/pp-diagnose.prompt.md](.github/prompts/pp-diagnose.prompt.md)       | [.github/prompts/pp-author.prompt.md](.github/prompts/pp-author.prompt.md)       |

---

## Use with Claude Code

Claude Code auto-discovers `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` when you open the repo. Nothing to install.

### Invoke a slash command

```
/pp-validate
/pp-validate canvas-app --headed
/pp-validate model-driven-app --skip-auth

/pp-diagnose tests/northwind/mda/form-context.test.ts
/pp-diagnose test-results/canvas-app-update/trace.zip
/pp-diagnose "TimeoutError: locator.click 30000ms"

/pp-author
/pp-author canvas-app "create order for Alfreds Futterkiste, verify in gallery"
/pp-author model-driven-app "open Accounts grid, sort by name, assert first row"
```

The slash command spawns the matching agent. The agent owns the multi-step workflow (prereqs → `.env` → auth → run → parse → explain) and reports back.

### Invoke an agent directly

If you prefer to drive the agent in conversation rather than via a slash command, just say so in plain English — Claude Code matches your request to the agent's description in the file frontmatter. Example:

> "Run the canvas-app project and tell me what's broken."

This routes to `pp-playwright-validate` automatically.

---

## Use with GitHub Copilot

The `.github/prompts/*.prompt.md` files use [Copilot's prompt-files spec](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files). VS Code Copilot Chat picks them up automatically when the workspace is open.

### Run a prompt file

In Copilot Chat:

1. Type `/` to open the prompt picker
2. Select `pp-validate`, `pp-diagnose`, or `pp-author`
3. Add any extra context (project name, error text, flow description) on the same line

Or attach a prompt file with `Ctrl+Shift+P → Chat: Run Prompt`.

### Pre-installed Copilot context

`.github/copilot-instructions.md` already gives Copilot baseline context for this repo (project structure, toolkit conventions, env vars, anti-patterns). The prompt files build on top of that — you don't need to repeat the basics in each request.

---

## The three workflows in detail

### 1. validate — run the suite

**What it does:**

- Checks prerequisites (Node 20+, Rush, Edge, toolkit `dist/`, `node_modules`).
- Helps you write or update [packages/e2e-tests/.env](packages/e2e-tests/.env.example).
- Manages the two `playwright-ms-auth` storage state files (Canvas/Studio domain + MDA domain).
- Runs one or all of: `canvas-app`, `model-driven-app`, `custom-page`, `studio-authoring`, `gen-ux-runtime`.
- Parses the result and prints a banner with pass/fail counts and a link to `playwright-report/index.html`.
- Maps each failure to a CLAUDE.md anti-pattern.

**Typical session (Claude Code):**

```
You: /pp-validate canvas-app --headed
Claude: ✅ Prereqs OK. Found .env. Auth state for canvas-app is fresh (4h old).
        Running: npx playwright test --project=canvas-app --headed
        ...
        ╔═══════════════════════════════════════╗
        ║  Result: ✅ PASSED                    ║
        ║  Tests:  3 passed · 0 failed · 0 skipped ║
        ╚═══════════════════════════════════════╝
```

### 2. diagnose — explain a failure

**What it does:**

- Triages from the error fragment alone — eight common Power Platform Playwright failures match a one-line fix in CLAUDE.md.
- For unrecognised errors, walks the Playwright trace zip (last action, last frame snapshot, last 10 network events, console output).
- Cross-checks against the toolkit (was it rebuilt? is it a known-fragile component?).
- Replies with a structured **Diagnosis / Root cause / Evidence / Fix / Re-run / Prevent regressions** block.

**Typical session (Copilot):**

```
You: /pp-diagnose tests/northwind/mda/form-context.test.ts failed with "attribute not found"
Copilot: ## Diagnosis: inactive record — Xrm attributes not bound
         **Root cause** ... CLAUDE.md §2a says D365 returns 0 attributes for closed records ...
         **Fix** Wrap the test in the editable-record loop from CLAUDE.md ...
         **Re-run** npx playwright test --project=model-driven-app --grep "form-context" --headed
```

### 3. author — scaffold a new test

**What it does:**

- Asks for app type, flow description, and pass condition (in one message, not one at a time).
- Picks the right toolkit Page Object (`CanvasAppPage`, `ModelDrivenAppPage`, etc.) — never raw `page.locator()` for things the toolkit handles.
- Drives the **Playwright MCP server** registered in [.mcp.json](.mcp.json) to capture real selectors against your live environment.
- Walks the eleven CLAUDE.md anti-patterns checklist before writing a single selector or wait.
- Writes the test under the correct directory (`tests/northwind/canvas/`, `tests/northwind/mda/`, etc.) using the standard skeleton.
- Hands you back the file path + a `npx playwright test --grep` command to run only the new test.

**What it will NOT do:**

- Write authentication code — `playwright-ms-auth` handles MSAL.
- Generate against an unconfigured tenant — confirms the env GUID before touching MCP.

---

## How the surfaces relate

```
┌─────────────────────────────────────────────────────────────────┐
│                    Three customer workflows                     │
│             validate          diagnose          author          │
└─────────────────────────────────────────────────────────────────┘
                │                  │                  │
   ┌────────────┴──────┐  ┌───────┴───────┐ ┌────────┴────────┐
   │  Claude Code      │  │  Claude Code  │ │  Claude Code    │
   │  /pp-validate     │  │  /pp-diagnose │ │  /pp-author     │
   │       ↓           │  │       ↓       │ │       ↓         │
   │  agent file ──────┤  │  agent file   │ │  agent file     │
   │                   │  │               │ │                 │
   │  Copilot Chat     │  │  Copilot Chat │ │  Copilot Chat   │
   │  pp-validate      │  │  pp-diagnose  │ │  pp-author      │
   │  .prompt.md       │  │  .prompt.md   │ │  .prompt.md     │
   └─────────┬─────────┘  └───────┬───────┘ └────────┬────────┘
             │                    │                   │
             └────────────────────┼───────────────────┘
                                  ▼
              ┌────────────────────────────────────┐
              │   Shared sources of truth          │
              │   • CLAUDE.md (anti-patterns)      │
              │   • .mcp.json (Playwright MCP)     │
              │   • packages/e2e-tests/            │
              │   • packages/power-platform-       │
              │     playwright-toolkit/            │
              └────────────────────────────────────┘
```

Both ecosystems read the **same** CLAUDE.md anti-patterns and the **same** Playwright MCP server. Use whichever assistant you already have open.

---

## Authoring or modifying these tools

If you want to extend or fork the tooling:

1. **Add a new workflow** — write a Claude agent (`.claude/agents/<name>.md`), a slash skill (`.claude/skills/<name>/SKILL.md`), and a Copilot prompt (`.github/prompts/<name>.prompt.md`). All three should describe the same job in the same words.
2. **Update CLAUDE.md first** — if you're encoding a new pattern, document it as an anti-pattern entry in the **AI Agent Reference: Anti-Patterns** section before referencing it from the agents/prompts.
3. **Don't bypass the toolkit.** Agents that drive Playwright must go through `AppProvider` and the typed Page Objects, not raw `page.locator()`.
4. **Keep secrets out of agent prompts.** The agents read `.env` at runtime — they do not echo passwords/cert passphrases back to chat.

---

## Related files

| File                                                                               | Purpose                                                                                |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                                                             | The customer + AI guide for this repo. Read before doing anything.                     |
| [.mcp.json](.mcp.json)                                                             | Registers the official `@playwright/mcp` server — used by all three "author" surfaces. |
| [.github/copilot-instructions.md](.github/copilot-instructions.md)                 | Baseline workspace instructions Copilot reads on every chat.                           |
| [packages/e2e-tests/.env.example](packages/e2e-tests/.env.example)                 | Template for the env file all three workflows write to.                                |
| [packages/e2e-tests/playwright.config.ts](packages/e2e-tests/playwright.config.ts) | Defines the Playwright projects validate/diagnose/author all reference by name.        |
