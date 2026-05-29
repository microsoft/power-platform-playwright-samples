# Veltro Novo E2E — Replication Guide

What was done, in order, to set up this repo on 2026-05-29. Follow the same steps to redo it on a fresh workstation or to onboard another developer.

> **For the broader pattern** — replicating this kind of setup for any Power Platform client — read `C:\Dev\clients\litoclean-e2e\docs\REPLICATION-GUIDE.md` first. This file is Veltro-Novo-specific notes on top of that pattern, not a substitute for it.

---

## 1. Prerequisites verified

```powershell
node --version        # >=20.12.1 <21.0.0 required by Rush (we used v20.16.0 via fnm)
gh auth status        # logged in as YerielMangin
gh api orgs/Power-Fox-Solutions  # member with create-repo permission
```

Node 20.16 was already installed via fnm from the LitoClean rollout. If on a fresh workstation:

```powershell
scoop install fnm
fnm install 20.16.0
```

---

## 2. Fork + clone

```bash
gh repo fork microsoft/power-platform-playwright-samples --org Power-Fox-Solutions --clone=false --remote=false
# → https://github.com/Power-Fox-Solutions/power-platform-playwright-samples

cd /c/Dev/clients/
git clone https://github.com/Power-Fox-Solutions/power-platform-playwright-samples.git veltro-novo-e2e
cd veltro-novo-e2e
git remote add upstream https://github.com/microsoft/power-platform-playwright-samples.git
```

---

## 3. Rush install + build

Use the bundled rush wrapper (avoids PATH issues with `fnm exec`):

```powershell
$env:PATH = "$env:USERPROFILE\AppData\Roaming\fnm\node-versions\v20.16.0\installation;$env:PATH"
node common/scripts/install-run-rush.js install   # ~46s, downloads ~600MB
node common/scripts/install-run-rush.js build     # ~9s, compiles toolkit + e2e-tests
```

---

## 4. Playwright browsers

```powershell
cd packages\e2e-tests
npx playwright install chromium   # Edge is also fine; Microsoft recommends Edge channel on Windows
```

Was no-op on Yeriel's workstation — Chromium 1208 + 1223 were cached from LitoClean.

---

## 5. Scaffold Veltro-Novo-specific files

All written from scratch in this session:

### 5.1 Auth launcher

`auth-veltro.ps1` at repo root. Same spawn-window pattern as LitoClean:
- Reads password via `Read-Host -AsSecureString` (hidden input).
- Sets `$env:MS_USER_PASSWORD` for the duration of the script.
- Runs `npm run auth:headful` (Maker Portal) then `npm run auth:mda:headful` (CRM/Code App).
- Wipes the password from process memory on exit.
- Window stays open via `Read-Host 'Press Enter to close'` (never `exit`).

### 5.2 Test runner helper

`run-tests.ps1` at repo root. Wraps `npx playwright test --project=veltro-novo-codeapp` with flags for `-Headed`, `-Debug`, `-Report`, `-SlowMo`, `-Filter`.

### 5.3 env template

`packages/e2e-tests/.env.template` — placeholder for `MS_AUTH_EMAIL`; all other values (CODE_APP_URL, env ID, tenant ID, auth provider config) pre-filled for Veltro Env Dev.

### 5.4 CodeAppPage

`packages/e2e-tests/pages/CodeAppPage.ts` (~250 LOC). Page Object for Code Apps. See `docs/CODE-APP-PAGE-OBJECT.md` for the full API.

Key methods:
- `launch()`, `codeAppFrame()`, `codeAppFrameRaw()`
- `clickSidebarNav(label)`, `expandSidebarGroup(group)`, `sidebarNavLabels()`
- `toggleTheme()`, `toggleLanguage()`, `currentTheme()`
- `measureScrolls()` — overflow diagnostics
- `goToHash(hash)`, `currentHash()`
- `readIdentityFromFooter()`, `screenshotFullPage(path)`

### 5.5 First smoke test

`packages/e2e-tests/tests/veltro-novo/smoke/shell.test.ts` — 5 tests covering sidebar boot, body-scrollbar regression (Veltro Novo PR #27), theme toggle, language switcher, hash routes.

### 5.6 playwright.config.ts update

Inserted a new project `veltro-novo-codeapp` after `canvas-app`:

```typescript
{
  name: 'veltro-novo-codeapp',
  testDir: path.join(getEnvironmentConfig().testDirectory, 'veltro-novo'),
  testMatch: '**/*.test.ts',
  use: {
    storageState: process.env.MS_AUTH_EMAIL
      ? path.join(
          path.dirname(getStorageStatePath(process.env.MS_AUTH_EMAIL!)),
          `state-mda-${process.env.MS_AUTH_EMAIL}.json`
        )
      : undefined,
  },
},
```

Code Apps share auth with MDAs (both run under `crm4.dynamics.com`), so we use the MDA storage state.

### 5.7 Docs

Three docs under `docs/`:
- `HANDOFF.md` — the "you're picking this up cold" entry point.
- `REPLICATION-GUIDE.md` — this file.
- `CODE-APP-PAGE-OBJECT.md` — CodeAppPage API + extension guide.

---

## 6. Verification

After all the above:

```powershell
$env:PATH = "$env:USERPROFILE\AppData\Roaming\fnm\node-versions\v20.16.0\installation;$env:PATH"
cd C:\Dev\clients\veltro-novo-e2e
node common/scripts/install-run-rush.js build
```

Expected: both `power-platform-playwright-toolkit` (cached) and `@power-platform-playwright/e2e-tests` (rebuilt with our changes) succeed.

What the build proves:
- `CodeAppPage.ts` typechecks against `@playwright/test`.
- `shell.test.ts` typechecks against `CodeAppPage`.
- The playwright.config.ts edit is syntactically valid TypeScript.

What the build does NOT prove (these need the auth + .env steps in §7):
- The Code App actually loads.
- The sidebar shows up.
- The smoke tests pass.

---

## 7. Manual steps pending Yeriel

Documented in `HANDOFF.md` §5. Quick reference:

1. **Create `e2e-veltro@powerfoxbi.com`** in Entra + Power Platform Admin Center (assign role `Veltro Novo User` in Veltro Env Dev). Detailed checklist sent in chat.
2. **`copy .env.template .env`** and fill in `MS_AUTH_EMAIL=e2e-veltro@powerfoxbi.com`.
3. **Apply the MFA timeout patch** (Claude's classifier blocks `node_modules` edits, so Yeriel runs this once):
   ```powershell
   $FILE = (Get-ChildItem -Recurse -Filter authenticate.js -Path .\common\temp\node_modules\.pnpm\playwright-ms-auth@0.0.17_* | Select-Object -First 1).FullName
   Copy-Item $FILE "$FILE.bak"
   (Get-Content $FILE) -replace 'waitForURL\(targetUrl, \{ timeout: 5000 \}\)', 'waitForURL(targetUrl, { timeout: 180000 })' | Set-Content $FILE
   ```
4. **Run `auth-veltro.ps1`** via Windows Terminal — caches storage state.
5. **Run `.\run-tests.ps1 smoke`** — expects 5 tests to pass.

---

## 8. Notable differences from LitoClean's setup

| LitoClean | Veltro Novo |
|---|---|
| Tests target an MDA (Smart Project 360) | Tests target a Code App (Veltro Novo) |
| Uses Microsoft's `ModelDrivenAppPage` | Uses our hand-written `CodeAppPage` |
| `--project=litoclean-mda` | `--project=veltro-novo-codeapp` |
| Tests live under `tests/litoclean/mda/` | Tests live under `tests/veltro-novo/` |
| Auth state used: `state-mda-<email>.json` | Same — Code Apps share MDA auth |
| Optional: `tests/litoclean/canvas/` for Canvas apps | No Canvas; only Code Apps |
| Auth account: `powerfox@litoclean.com` (cross-tenant guest) | Auth account: `e2e-veltro@powerfoxbi.com` (native tenant) |

The single biggest divergence is the Page Object. Everything else is structural reuse.

---

## 9. Decisions log

| Decision | Date | Rationale |
|---|---|---|
| Fork to `Power-Fox-Solutions` | 2026-05-29 | Same pattern as LitoClean; survives staff turnover |
| No service principal | 2026-05-29 | Yeriel pushback — Code App runtime needs delegated user auth anyway. SP only useful for Dataverse-Web-API seeding, which Yeriel cancelled in favor of "test as a real user end-to-end" |
| Dedicated test account `e2e-veltro@` | 2026-05-29 | Don't reuse Yeriel's main (has Admin role, not representative) |
| Role `Veltro Novo User` on the test account | 2026-05-29 | Tests should represent typical user. Use Manager if a flow needs Manager |
| Same storage state for Code App as MDA | 2026-05-29 | Both authenticate at `crm4.dynamics.com`; cookie scope overlaps. Cuts auth flows from 3 to 2 |
| Skip the MFA timeout patch from Claude side | 2026-05-29 | Auto-mode classifier denies `node_modules` edits. Documented for Yeriel to apply once; convert to `pnpm patch` after first green run |

---

## 10. References

- LitoClean original setup: `C:\Dev\clients\litoclean-e2e\docs\REPLICATION-GUIDE.md`
- Microsoft samples: https://github.com/microsoft/power-platform-playwright-samples
- Toolkit docs: https://learn.microsoft.com/en-us/power-platform/developer/playwright-test
- playwright-ms-auth: https://www.npmjs.com/package/playwright-ms-auth
- Veltro Novo app repo: `C:\Dev\veltro-novo\`
- Veltro Novo Phase 0 close handoff: `C:\Dev\veltro-novo\docs\session-handoffs\session-handoff-ui-parity-phase-0-complete-2026-05-28.md`
- Code App overflow bug fix (regression test target): `C:\Dev\veltro-novo\docs\handoffs-portable\sidebar-overflow-iframe-shell-2026-05-29.md`
