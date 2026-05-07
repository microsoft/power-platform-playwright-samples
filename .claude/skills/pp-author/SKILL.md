---
name: pp-author
description: Slash command — scaffold a new Power Platform Playwright test using the toolkit Page Objects + Playwright MCP for live selector capture. Wraps the pp-playwright-author agent. Always honors CLAUDE.md anti-patterns.
---

# /pp-author — scaffold a new Playwright test

When the user types `/pp-author`, invoke the **pp-playwright-author** agent and pass any arguments through.

## Argument forms accepted

| Form                                                                              | What the agent does                                  |
| --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `/pp-author`                                                                      | Asks the user for app type, flow, and pass condition |
| `/pp-author canvas-app "create order for Alfreds Futterkiste, verify in gallery"` | Scaffolds a Canvas test for the given flow           |
| `/pp-author model-driven-app "open Accounts, sort by name, assert first row"`     | MDA test using `ModelDrivenAppPage.grid`             |
| `/pp-author custom-page "edit Account address, save, reload, verify persisted"`   | Custom page test inside MDA                          |
| `/pp-author gen-ux-runtime "open published Gen UX app, fill form, submit"`        | Runtime test against `GEN_UX_APP_URL`                |

## Behaviour

1. Spawn the [pp-playwright-author](../../agents/pp-playwright-author.md) agent.
2. Pass the argument as the agent's brief.
3. The agent walks Steps 1–6:
   - Find the right toolkit Page Object (no raw `page.locator`)
   - Drive the Playwright MCP server (`.mcp.json`) for live selectors
   - Apply the CLAUDE.md anti-patterns checklist (§1–§11)
   - Pick the correct test directory + filename
   - Write the test from the standard skeleton
   - Return the file path + a `npx playwright test --grep` command

## When NOT to use

- To run an existing test, use `/pp-validate`.
- To diagnose a failure, use `/pp-diagnose`.
- For authentication code — never. `playwright-ms-auth` handles MSAL; let it.
