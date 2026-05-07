---
name: pp-diagnose
description: Slash command — diagnose a failing Power Platform Playwright test. Maps errors against CLAUDE.md anti-patterns, walks the trace zip, and explains the root cause + fix. Wraps the pp-playwright-diagnose agent.
---

# /pp-diagnose — diagnose a failed Playwright test

When the user types `/pp-diagnose`, invoke the **pp-playwright-diagnose** agent and pass any arguments through.

## Argument forms accepted

| Form                                                    | What the agent does                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/pp-diagnose`                                          | Asks the user for the failing test name, error text, or trace path           |
| `/pp-diagnose tests/northwind/mda/form-context.test.ts` | Reads the test, opens the most recent matching `test-results/` folder        |
| `/pp-diagnose test-results/canvas-app-update/trace.zip` | Walks the trace, reports last action + DOM + network                         |
| `/pp-diagnose "TimeoutError: locator.click 30000ms"`    | Triages from the error fragment alone — fastest path for known anti-patterns |

## Behaviour

1. Spawn the [pp-playwright-diagnose](../../agents/pp-playwright-diagnose.md) agent.
2. Pass the argument as the agent's evidence input.
3. The agent owns Steps 1–4 (anti-pattern triage → trace investigation → toolkit cross-check → structured output).
4. Final reply uses the **Diagnosis / Root cause / Evidence / Fix / Re-run / Prevent regressions** template.

## When NOT to use

- To re-run the test after the fix, use `/pp-validate {project} --headed --grep "{test}"`.
- For new test authoring, use `/pp-author`.
