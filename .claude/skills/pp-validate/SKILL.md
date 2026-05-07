---
name: pp-validate
description: Slash command — run the Power Platform Playwright sample suite. Walks the user through prerequisites, .env, auth state, and a chosen Playwright project, then parses results and explains failures using CLAUDE.md anti-patterns. Wraps the pp-playwright-validate agent.
---

# /pp-validate — run the Power Platform Playwright sample suite

When the user types `/pp-validate`, invoke the **pp-playwright-validate** agent and pass any arguments through.

## Argument forms accepted

| Form                                                 | Action                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `/pp-validate`                                       | Full interactive run — agent collects `.env` answers, runs all projects |
| `/pp-validate canvas-app`                            | Run only the `canvas-app` Playwright project                            |
| `/pp-validate canvas-app --headed`                   | Same, with visible browser                                              |
| `/pp-validate --skip-auth`                           | Reuse existing `.playwright-ms-auth/state-*.json` files (24h window)    |
| `/pp-validate model-driven-app --headed --skip-auth` | All flags compose                                                       |

Valid project names: `canvas-app`, `model-driven-app`, `custom-page`, `studio-authoring`, `gen-ux-runtime`, `default`, or `all` (default).

## Behaviour

1. Spawn the [pp-playwright-validate](../../agents/pp-playwright-validate.md) agent via the Agent tool.
2. Pass the parsed argument set as the agent's initial brief.
3. The agent owns Steps 0–7 (prereqs → `.env` → auth → run → parse → explain → report).
4. Surface the agent's final result banner + failure list back to the user.

## When NOT to use

- For test authoring use `/pp-author`.
- For analysing an existing failure (no re-run) use `/pp-diagnose`.
