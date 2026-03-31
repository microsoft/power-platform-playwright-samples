# Azure DevOps Pipeline: NPM Publishing via ESRP

> Plan for migrating `power-platform-playwright-toolkit` npm publishing from GitHub Actions to an Azure DevOps pipeline using Microsoft's ESRP (Engineering System Release Pipeline) for secure, compliant npm publishing to npmjs.com.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step: Azure App & Infrastructure Setup](#3-step-by-step-azure-app--infrastructure-setup)
4. [Pipeline Structure](#4-pipeline-structure)
5. [Full ADO Pipeline YAML](#5-full-ado-pipeline-yaml)
6. [Supporting Templates](#6-supporting-templates)
7. [Versioning with Rush/Beachball](#7-versioning-with-rushbeachball)
8. [Migration Checklist](#8-migration-checklist)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Architecture Overview

```
GitHub (open-source repo)
  └── Azure DevOps Pipeline (triggered on main / release/*)
        ├── Stage 1: Verification
        │     └── Build + Test on Windows / Linux / macOS × Node 20/22
        ├── Stage 2: Build & Pack
        │     ├── Rush build + bundle
        │     ├── rush change / beachball bump
        │     ├── npm pack → .tgz artifact (NpmPackedTarballs)
        │     └── Git push version-bump branch → GitHub PR
        ├── Stage 3: Create PR & Wait for Merge
        │     ├── gh pr create (version-bump PR)
        │     └── Poll until PR merged
        └── Stage 4: Publish via ESRP
              ├── Download NpmPackedTarballs artifact
              └── EsrpRelease@9 → npmjs.com
```

**Why ESRP instead of `npm publish` directly?**  
ESRP is Microsoft's mandatory signing and release service for open-source packages. It enforces:

- Code signing (tarball signing)
- Malware scanning
- Legal / compliance approval gates
- Audit trail for all external releases

---

## 2. Prerequisites

| Requirement                   | Details                                                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure DevOps organization     | e.g., `https://dev.azure.com/msazure`                                                                                                                                                                                     |
| 1ES Pipeline Templates access | `1ESPipelineTemplates/OfficePipelineTemplates` repo access                                                                                                                                                                |
| Azure subscription            | For Key Vault hosting ESRP certificates                                                                                                                                                                                   |
| Azure Key Vault               | Pre-provisioned with ESRP auth + sign certificates                                                                                                                                                                        |
| ESRP service connection       | Onboarded by your ESRP team; see [ESRP onboarding](https://eng.ms/docs/microsoft-security/identity/trust-and-security-services/tss-release-distribute/tss-release-esrp-parent/oss-publishing/releasing-open-source/npmjs) |
| GitHub PAT / bot account      | For creating version-bump PRs back to the repo                                                                                                                                                                            |
| Node.js                       | 20.x (matches `nodeSupportedVersionRange` in rush.json)                                                                                                                                                                   |
| Rush + Beachball              | Already in repo; Beachball added for bump/publish                                                                                                                                                                         |

---

## 3. Step-by-Step: Azure App & Infrastructure Setup

### 3.1 Register an Azure AD App (for ESRP)

ESRP requires an Azure AD application to authenticate pipeline-to-ESRP communication.

1. Go to **Azure Portal → Azure Active Directory → App registrations → New registration**
2. Fill in:
   - **Name**: `power-platform-playwright-esrp-release`
   - **Supported account types**: Single tenant (your Microsoft tenant)
   - **Redirect URI**: leave blank
3. Click **Register**
4. Note the **Application (client) ID** — this becomes `clientid` in `EsrpRelease@9`
5. Note the **Directory (tenant) ID** — this becomes `domaintenantid`

> **Note**: For internal Microsoft teams using `OGX-JSHost-KV`, you reuse the existing app registration (`0a35e01f-eadf-420a-a2bf-def002ba898d`). External teams or new projects must request a new ESRP onboarding via your security contact.

### 3.2 Create Azure Key Vault

The Key Vault stores ESRP auth and signing certificates.

```bash
# Using Azure CLI
az group create --name rg-pp-playwright-release --location eastus

az keyvault create \
  --name pp-playwright-kv \
  --resource-group rg-pp-playwright-release \
  --location eastus \
  --sku standard

# Grant the ADO service principal access to the Key Vault
az keyvault set-policy \
  --name pp-playwright-kv \
  --object-id <ADO_SERVICE_PRINCIPAL_OBJECT_ID> \
  --secret-permissions get list \
  --certificate-permissions get list
```

### 3.3 Import ESRP Certificates into Key Vault

ESRP provides two certificates per release pipeline:

- **Auth cert** (`OGX-JSHost-Auth4` in the example) — authenticates the pipeline to ESRP
- **Sign cert** (`OGX-JSHost-Sign3` in the example) — used to sign the release artifacts

These certificates are **issued by ESRP team** during onboarding. You cannot generate them yourself.

```bash
# Once you have the .pfx files from ESRP:
az keyvault certificate import \
  --vault-name pp-playwright-kv \
  --name pp-playwright-auth-cert \
  --file esrp-auth.pfx \
  --password <pfx-password>

az keyvault certificate import \
  --vault-name pp-playwright-kv \
  --name pp-playwright-sign-cert \
  --file esrp-sign.pfx \
  --password <pfx-password>
```

### 3.4 Store GitHub Token in Key Vault

The pipeline needs a GitHub token to push version-bump branches and create PRs.

```bash
# Create a GitHub PAT with: repo, workflow scopes
# Then store it:
az keyvault secret set \
  --vault-name pp-playwright-kv \
  --name githubAuthToken \
  --value <YOUR_GITHUB_PAT>
```

### 3.5 Create Azure Service Connections in ADO

#### Service Connection 1: Azure Key Vault access

1. In ADO, go to **Project Settings → Service connections → New service connection**
2. Choose **Azure Resource Manager**
3. Authentication: **Service principal (automatic)** or use a managed identity
4. Scope: select your subscription + resource group `rg-pp-playwright-release`
5. Name it: `pp-playwright-release-sc`
6. Grant **Azure Key Vault Secrets User** role to the service principal on `pp-playwright-kv`

#### Service Connection 2: ESRP Release

This is a custom service connection provided by ESRP. To create it:

1. Install the **ESRP Release extension** from ADO Marketplace:
   - Extension: `SFP.release-tasks` (Engineering System Release Pipeline)
2. Go to **Project Settings → Service connections → New service connection → ESRP**
3. Fill in with values provided by ESRP onboarding:
   - **Connection name**: `ESRP-PPPlaywright`
   - **Client ID**, **Tenant ID**, **Key Vault name**, **Certificate names**

### 3.6 Install Required ADO Extensions

| Extension              | Publisher | Purpose                                 |
| ---------------------- | --------- | --------------------------------------- |
| ESRP Release Tasks     | SFP       | `EsrpRelease@9` task for npm publishing |
| 1ES Pipeline Templates | Microsoft | Compliance pipeline scaffolding         |

Install from ADO Marketplace: **Organization Settings → Extensions → Browse Marketplace**

### 3.7 Grant Pipeline Access to 1ES Templates Repo

1. In ADO, go to **Project Settings → Repositories**
2. Find `1ESPipelineTemplates/OfficePipelineTemplates`
3. Add your project's build service identity with **Read** access

---

## 4. Pipeline Structure

```
.azure-pipelines/
├── npm-release.yml          ← Main pipeline (this document)
└── prep-node.yml            ← Shared Node.js setup template
```

### Stage Flow

```
Verification ──► Build ──► CreatePullRequestAndMerge ──► PublishNpmPackages
```

| Stage                         | Purpose                                         | Agent                                    |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------- |
| **Verification**              | Build + test on all OS × Node combinations      | Matrix: Windows/Linux/macOS × Node 20/22 |
| **Build**                     | Rush build, beachball bump, npm pack → artifact | Linux (ubuntu-latest)                    |
| **CreatePullRequestAndMerge** | Push version PR to GitHub, wait for merge       | Linux (ubuntu-latest)                    |
| **PublishNpmPackages**        | ESRP release to npmjs.com                       | **Windows** (ESRP requirement)           |

> **Important**: ESRP's `EsrpRelease@9` task must run on **Windows**. This is a hard requirement.

---

## 5. Full ADO Pipeline YAML

Save as `.azure-pipelines/npm-release.yml`:

```yaml
name: pp-playwright-npm-$(Rev:rrr)

pr: none
trigger:
  branches:
    include:
      - main
      - 'release/*'

resources:
  repositories:
    - repository: OfficePipelineTemplates
      type: git
      name: 1ESPipelineTemplates/OfficePipelineTemplates
      ref: refs/tags/release

variables:
  - name: tags
    value: production,externalfacing
  - name: ReleaseBranch
    value: release/beachball/rel$(Build.BuildId)

parameters:
  - name: nodeVersions
    type: object
    default:
      - 20.x
      - 22.x

extends:
  template: v1/Office.Official.PipelineTemplate.yml@OfficePipelineTemplates
  parameters:
    pool:
      name: Azure-Pipelines-1ESPT-ExDShared
      image: windows-latest
      os: windows

    sdl:
      codeql:
        compiled:
          enabled: true
        runSourceLanguagesInSourceAnalysis: true
      eslint:
        configuration: recommended
        parser: '@typescript-eslint/parser'
        parserOptions: ''

    stages:
      # ─────────────────────────────────────────────────────────────────
      # Stage 1: Verify build and tests on all platforms and Node versions
      # ─────────────────────────────────────────────────────────────────
      - stage: Verification
        displayName: 'Verification (Build + Test)'
        jobs:
          - ${{ each nodeVersion in parameters.nodeVersions }}:
              - job: build_linux_${{ replace(nodeVersion, '.', '_') }}
                displayName: 'Build on Linux - Node ${{ nodeVersion }}'
                pool:
                  name: Azure-Pipelines-1ESPT-ExDShared
                  image: ubuntu-latest
                  os: linux
                templateContext:
                  outputs:
                    - output: pipelineArtifact
                      targetPath: $(System.DefaultWorkingDirectory)
                      artifactName: verify-linux-${{ replace(nodeVersion, '.', '_') }}
                steps:
                  - template: /.azure-pipelines/prep-node.yml@self
                    parameters:
                      nodeVersion: ${{ nodeVersion }}

                  - script: node common/scripts/install-run-rush.js install
                    displayName: Rush Install

                  - script: node common/scripts/install-run-rush.js build --to power-platform-playwright-toolkit
                    displayName: Rush Build

                  - script: node common/scripts/install-run-rush.js lint
                    displayName: Rush Lint

              - job: build_windows_${{ replace(nodeVersion, '.', '_') }}
                displayName: 'Build on Windows - Node ${{ nodeVersion }}'
                pool:
                  name: Azure-Pipelines-1ESPT-ExDShared
                  image: windows-latest
                  os: windows
                templateContext:
                  outputs:
                    - output: pipelineArtifact
                      targetPath: $(System.DefaultWorkingDirectory)
                      artifactName: verify-windows-${{ replace(nodeVersion, '.', '_') }}
                steps:
                  - template: /.azure-pipelines/prep-node.yml@self
                    parameters:
                      nodeVersion: ${{ nodeVersion }}

                  - script: node common/scripts/install-run-rush.js install
                    displayName: Rush Install

                  - script: node common/scripts/install-run-rush.js build --to power-platform-playwright-toolkit
                    displayName: Rush Build

                  - task: PowerShell@2
                    inputs:
                      targetType: inline
                      script: |
                        Get-ChildItem -Recurse -File -Filter 'esbuild.exe' |
                          Remove-Item -Force -ErrorAction SilentlyContinue
                    displayName: Remove esbuild binaries (BinSkim false-positive avoidance)

      # ─────────────────────────────────────────────────────────────────
      # Stage 2: Build, version-bump, and pack tarballs
      # ─────────────────────────────────────────────────────────────────
      - stage: Build
        displayName: 'Build & Pack npm Artifacts'
        dependsOn: Verification
        jobs:
          - job: Pack
            displayName: 'Rush Build, Beachball Bump, npm pack'
            pool:
              name: Azure-Pipelines-1ESPT-ExDShared
              image: ubuntu-latest
              os: linux
            templateContext:
              outputs:
                - output: pipelineArtifact
                  targetPath: $(Pipeline.Workspace)/published-packages
                  artifactName: NpmPackedTarballs
                  displayName: 'Publish npm pack artifacts'
                  condition: succeededOrFailed()
            steps:
              - checkout: self

              - template: /.azure-pipelines/prep-node.yml@self
                parameters:
                  nodeVersion: 20.x

              - script: node common/scripts/install-run-rush.js install
                displayName: Rush Install

              - script: node common/scripts/install-run-rush.js build --to power-platform-playwright-toolkit
                displayName: Rush Build

              - task: AzureKeyVault@2
                displayName: Obtain GitHub auth token
                inputs:
                  azureSubscription: 'pp-playwright-release-sc'
                  KeyVaultName: 'pp-playwright-kv'
                  SecretsFilter: 'githubAuthToken'

              - script: |
                  git config --global user.email "github-actions[bot]@users.noreply.github.com"
                  git config --global user.name "GitHub Actions"
                  git remote set-url origin https://x-access-token:$GH_TOKEN@github.com/microsoft/power-platform-playwright-samples
                displayName: Configure Git
                env:
                  GH_TOKEN: $(githubAuthToken)

              - script: |
                  npx beachball bump --verbose --yes
                displayName: Beachball Version Bump

              - script: |
                  git add --all
                  git commit -m "📦 Apply beachball version bumps"
                  git push origin HEAD:refs/heads/$(ReleaseBranch) --force-with-lease
                displayName: Push version-bump branch
                env:
                  GH_TOKEN: $(githubAuthToken)

              - script: git reset HEAD~ --hard
                displayName: Reset local to pre-bump state (pack from bumped version)

              - script: |
                  rm -rf "$(Pipeline.Workspace)/published-packages"
                  mkdir -p "$(Pipeline.Workspace)/published-packages"
                displayName: Clear previous artifacts

              - script: |
                  npx beachball publish \
                    --verbose \
                    --access public \
                    --no-publish \
                    --no-push \
                    --pack-to-path "$(Pipeline.Workspace)/published-packages" \
                    --yes
                displayName: Pack tarballs (no publish, no push)

              - script: ls -la "$(Pipeline.Workspace)/published-packages"
                displayName: Show packed artifacts

      # ─────────────────────────────────────────────────────────────────
      # Stage 3: Create PR to main and wait for merge
      # ─────────────────────────────────────────────────────────────────
      - stage: CreatePullRequestAndMerge
        displayName: 'Create & Merge Version Bump PR'
        dependsOn: Build
        jobs:
          - job: CreatePullRequest
            displayName: 'Create beachball PR'
            pool:
              name: Azure-Pipelines-1ESPT-ExDShared
              image: ubuntu-latest
              os: linux
            steps:
              - checkout: self

              - task: AzureKeyVault@2
                displayName: Obtain GitHub auth token
                inputs:
                  azureSubscription: 'pp-playwright-release-sc'
                  KeyVaultName: 'pp-playwright-kv'
                  SecretsFilter: 'githubAuthToken'

              - script: |
                  set -euo pipefail
                  if [ -z "$branch" ]; then
                    echo "No release branch; skipping PR creation."
                    exit 0
                  fi
                  pr_title="📦 Apply package version bumps ***NO_CI***"
                  pr_body="Automated version bump for release build $(Build.BuildNumber)"
                  pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' || true)
                  if [ -z "$pr_number" ]; then
                    gh pr create --head "$branch" --base main --title "$pr_title" --body "$pr_body"
                    pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' || true)
                  else
                    echo "PR #$pr_number already exists."
                  fi
                  if [ -n "$pr_number" ]; then
                    echo "##vso[task.setvariable variable=BeachballPRNumber;isOutput=true]$pr_number"
                  fi
                env:
                  GH_TOKEN: $(githubAuthToken)
                  GH_REPO: microsoft/power-platform-playwright-samples
                  branch: $(ReleaseBranch)
                displayName: Create or locate beachball PR
                name: RecordBeachballPR

          - job: WaitForPRMerge
            displayName: 'Wait for PR merge'
            dependsOn: CreatePullRequest
            pool:
              name: Azure-Pipelines-1ESPT-ExDShared
              image: ubuntu-latest
              os: linux
            variables:
              BeachballPRNumber: $[ dependencies.CreatePullRequest.outputs['RecordBeachballPR.BeachballPRNumber'] ]
            steps:
              - checkout: self

              - task: AzureKeyVault@2
                displayName: Obtain GitHub auth token
                inputs:
                  azureSubscription: 'pp-playwright-release-sc'
                  KeyVaultName: 'pp-playwright-kv'
                  SecretsFilter: 'githubAuthToken'

              - script: |
                  set -euo pipefail
                  if [ -z "$pr_branch" ]; then
                    echo "No release branch; skipping wait."
                    exit 0
                  fi
                  if [ -z "$pr_number" ]; then
                    pr_number=$(gh pr list --head "$pr_branch" --json number --jq '.[0].number' || true)
                  fi
                  if [ -z "$pr_number" ]; then
                    echo "No PR found; nothing to wait on."
                    exit 0
                  fi
                  echo "Waiting for PR #$pr_number..."
                  while true; do
                    state=$(gh pr view "$pr_number" --json state --jq '.state' || true)
                    case "$state" in
                      MERGED)
                        echo "PR #$pr_number merged. Proceeding."
                        break
                        ;;
                      CLOSED)
                        echo "PR #$pr_number closed without merge." >&2
                        exit 1
                        ;;
                      *)
                        echo "[$(date +"%H:%M:%S")] Still open. Merge: https://github.com/microsoft/power-platform-playwright-samples/pull/$pr_number"
                        sleep 120
                        ;;
                    esac
                  done
                env:
                  GH_TOKEN: $(githubAuthToken)
                  GH_REPO: microsoft/power-platform-playwright-samples
                  pr_number: $(BeachballPRNumber)
                  pr_branch: $(ReleaseBranch)
                displayName: Wait for PR merge

      # ─────────────────────────────────────────────────────────────────
      # Stage 4: ESRP Release to npmjs.com
      # ─────────────────────────────────────────────────────────────────
      - stage: PublishNpmPackages
        displayName: 'Publish to npm via ESRP'
        dependsOn: CreatePullRequestAndMerge
        jobs:
          - job: PublishNpmPackages
            displayName: 'ESRP Release'
            pool:
              name: Azure-Pipelines-1ESPT-ExDShared
              image: windows-latest
              os: windows # ESRP EsrpRelease@9 requires Windows
            steps:
              - task: DownloadPipelineArtifact@2
                displayName: Download packed npm artifacts
                inputs:
                  buildType: current
                  artifact: NpmPackedTarballs
                  path: $(Pipeline.Workspace)\published-packages

              - task: 'SFP.release-tasks.custom-build-release-task.EsrpRelease@9'
                displayName: 'ESRP Release to npmjs.com'
                inputs:
                  connectedservicename: 'ESRP-PPPlaywright'
                  usemanagedidentity: false
                  keyvaultname: 'pp-playwright-kv'
                  authcertname: 'pp-playwright-auth-cert'
                  signcertname: 'pp-playwright-sign-cert'
                  clientid: '<YOUR_AAD_APP_CLIENT_ID>'
                  domaintenantid: '<YOUR_AAD_TENANT_ID>'
                  contenttype: npm
                  folderlocation: $(Pipeline.Workspace)\published-packages
                  owners: '<owner-email@microsoft.com>'
                  approvers: '<approver-email@microsoft.com>'
```

---

## 6. Supporting Templates

### `.azure-pipelines/prep-node.yml`

```yaml
parameters:
  - name: nodeVersion
    type: string
    default: '20.x'

steps:
  - task: NodeTool@0
    displayName: 'Use Node.js ${{ parameters.nodeVersion }}'
    inputs:
      versionSpec: ${{ parameters.nodeVersion }}

  - script: |
      corepack enable
      corepack prepare pnpm@10.28.1 --activate
    displayName: Enable corepack + pnpm

  - script: npm install -g @microsoft/rush
    displayName: Install Rush
```

---

## 7. Versioning with Rush/Beachball

This repo uses **Rush** for monorepo management. Beachball integrates with Rush for changelog + version management.

### Install Beachball

```bash
# In repo root
rush add -p beachball --dev --make-consistent
```

### Configure Beachball (`beachball.config.js` in repo root)

```js
// beachball.config.js
module.exports = {
  access: 'public',
  branch: 'origin/main',
  registry: 'https://registry.npmjs.org',
  scope: undefined, // publish all packages
  gitTags: true,
  changelog: {
    customRenderers: {},
  },
};
```

### Developer Workflow (before raising a PR)

```bash
# 1. Make your changes
# 2. Create a change file describing what changed
rush change

# This creates a file in change/ directory — commit it with your PR
git add change/
git commit -m "feat: add new locator helpers"
```

The change files are what Beachball uses during the pipeline to:

1. Determine the version bump type (patch/minor/major)
2. Generate changelog entries
3. Update `package.json` versions

---

## 8. Migration Checklist

### Infrastructure (one-time, done by team lead / ops)

- [ ] Register Azure AD app for ESRP (Section 3.1)
- [ ] Create Azure Key Vault `pp-playwright-kv` (Section 3.2)
- [ ] Request ESRP onboarding — auth cert + sign cert (Section 3.3)
  - File ticket at: https://aka.ms/esrponboarding
  - Provide: package name (`power-platform-playwright-toolkit`), npmjs scope (`public`), owners, approvers
- [ ] Import ESRP certs into Key Vault (Section 3.3)
- [ ] Add GitHub PAT to Key Vault as `githubAuthToken` (Section 3.4)
- [ ] Create ADO service connection `pp-playwright-release-sc` (Section 3.5)
- [ ] Create ADO ESRP service connection `ESRP-PPPlaywright` (Section 3.5)
- [ ] Install ESRP Release Tasks extension in ADO org (Section 3.6)
- [ ] Grant pipeline access to 1ES Templates repo (Section 3.7)

### Repository Changes

- [ ] Create `.azure-pipelines/npm-release.yml` (Section 5)
- [ ] Create `.azure-pipelines/prep-node.yml` (Section 6)
- [ ] Install and configure Beachball (Section 7)
- [ ] Create `beachball.config.js` in repo root
- [ ] Update `rush.json` `nodeSupportedVersionRange` if needed (currently `>=20.12.1 <21.0.0` — consider widening to `>=20.12.1 <25.0.0` to match matrix)
- [ ] Add `beachball` to devDependencies in root `package.json`
- [ ] (Optional) Disable or gate the existing GitHub Actions `publish-npm.yml` to avoid dual publishing

### ADO Pipeline Registration

- [ ] In ADO, create a new pipeline from `.azure-pipelines/npm-release.yml`
- [ ] Set pipeline to run on `main` and `release/*` branches
- [ ] Set pipeline variable `ReleaseBranch` as non-secret pipeline variable
- [ ] Verify the `AzureKeyVault@2` task can read secrets (run once manually)
- [ ] Run a dry-run build on a feature branch (all stages except PublishNpmPackages)

### ESRP Approval (before first real publish)

- [ ] Have the ESRP `owners` email address configured — this person receives sign-off requests
- [ ] Have the ESRP `approvers` email address configured — this person approves releases
- [ ] Confirm with ESRP team that `power-platform-playwright-toolkit` is in the approved packages list

---

## 9. Troubleshooting

### `EsrpRelease@9` fails with "Certificate not found"

- Verify the cert names in the task match exactly what was imported into Key Vault
- Verify the ADO service principal has `Key Vault Secrets User` + `Key Vault Certificate User` roles

### Beachball bump finds no change files

- Developers must run `rush change` before merging PRs
- Alternatively, use `--force-all` flag in CI (not recommended — always bumps all packages)

### Git push to release branch fails (403)

- The GitHub PAT stored in Key Vault must have `repo` + `workflow` scopes
- The PAT owner must have write access to the repository

### `WaitForPRMerge` job times out

- Default ADO job timeout is 60 minutes — increase it with `timeoutInMinutes: 480` on the job
- The reviewer must merge the PR within the timeout window

### Pipeline fails on 1ES template access

- Ensure your ADO project's build service identity is added as a Reader to the `1ESPipelineTemplates` project in ADO
- Path: **ADO → 1ESPipelineTemplates project → Settings → Permissions → Add your project's build service**

### ESRP approval gate is stuck

- ESRP sends email to the `owners` configured in `EsrpRelease@9`
- The approver must log into https://esrp.microsoft.com to approve the release
- Contact your ESRP team alias if stuck

---

## Reference Links

- [ESRP npm publishing docs](https://eng.ms/docs/microsoft-security/identity/trust-and-security-services/tss-release-distribute/tss-release-esrp-parent/oss-publishing/releasing-open-source/npmjs)
- [1ES Pipeline Templates](https://aka.ms/1espt)
- [Beachball docs](https://microsoft.github.io/beachball/)
- [Rush docs](https://rushjs.io/)
- [ESRP onboarding request](https://aka.ms/esrponboarding)
