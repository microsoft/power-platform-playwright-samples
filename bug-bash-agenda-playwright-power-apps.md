# Bug Bash Agenda – Power Platform Playwright Testing

## Objective

Validate that the Playwright sample repo is usable end-to-end by developers/customers
Identify:

- Usability gaps
- Setup friction
- Broken scenarios
- Documentation gaps

Ensure the repo works as a self-service starting point (NOT a product)

## Agenda (60–90 mins)

### 1. Kickoff (10 mins)

**Context:**

- This is a sample repo, not a supported product
- Goal = ease of adoption + correct patterns

**Expectations:**

- Think like a new external developer / customer
- Focus on usability, not just bugs

### 2. Setup & Onboarding Validation (20 mins)

**What to test**

- Can a new developer start from scratch?
- Are instructions clear and complete?

**How to test**

Fork the repo

```
From GitHub UI → Fork to your account
```

Clone your fork

```shell
git clone <your-fork-url>
cd <repo>
```

Install dependencies

```shell
npm install
npx playwright install
```

Configure environment

- .env setup
- Authentication

Run first test

```shell
npx playwright test
```

**Common bugs to log**

- Missing steps in README
- Auth/config confusion
- Dependency/version issues
- Errors during first run

### 3. Core Test Scenarios Validation (25 mins)

**What to test**

Validate basic E2E scenarios (CRUD flows):

- Launch app
- Create record
- Save record
- Read/view record
- Update record
- Simple navigation

These are the expected core sample flows

**How to test**

Run existing test suites
Modify test inputs
Run selectively:

```shell
npx playwright test <test-file>
```

**Look for**

- Flaky tests
- Selector issues (DOM changes / brittle selectors)
- Failures in different environments
- Hardcoded values

### 4. AI / Developer Productivity Workflows (Optional but Valuable) (15 mins)

**What to test**

Validate developer workflows:

- Author new test
- Diagnose failing test
- Validate setup

**How to test**

Try creating a new test using:

- Page Object patterns

Introduce a failure → debug it
Validate guidance (docs/tooling)

**Look for**

- Missing guidance for new test creation
- Poor debugging experience
- Confusing structure

### 5. Documentation Review (10 mins)

**What to test**

Is README sufficient for:

- First-time users?
- External customers?

**Checklist**

- Clear prerequisites?
- Setup steps complete?
- Example commands working?
- Known issues documented?
- Disclaimer clarity: "Sample only / no SLA" (important from meeting decision)

**Look for**

- Missing instructions
- Ambiguous steps
- Broken links or outdated info

### 6. Edge Cases & Stress Testing (Optional)

**What to test**

Different:

- Browsers
- Environments (Dev / Test tenants)

Negative scenarios:

- Invalid login
- Missing permissions
- Slow network

## Bug Bash Rules & Guidelines

### Participation Rules

Everyone:

- Works independently (no pairing unless needed)
- Logs findings in GitHub Issues / Bug tracker

No fix during session:

- Focus on discovery, not fixing

### Bug Logging Standards

Each bug must include:

- **Title:** Clear and actionable
- **Category:**
  - Setup / Documentation
  - Functional
  - Usability
  - Performance
- **Steps to Reproduce**
- **Expected vs Actual**
- **Environment details**
- **Screenshots / logs**

### Severity Guidelines

| Severity | Description                          |
| -------- | ------------------------------------ |
| High     | Setup blocked / tests cannot run     |
| Medium   | Feature works but confusing or flaky |
| Low      | Minor improvements / docs gaps       |

### What NOT to Treat as Bugs

- Missing advanced scenarios (this is a sample repo)
- Lack of production-grade robustness
- No SLA / support limitations

## Success Criteria

- New developer can: Fork → setup → run tests without help
- Core scenarios run successfully
- Documentation is usable
- Top usability gaps identified

## Expected Outputs

At end of session:

**Top priorities:**

- 5 setup issues
- 5 functional issues
- 5 documentation gaps

Prioritized list for:

- Fix before publishing
- Fix post-release (if needed)

## Optional Enhancements

Since you typically drive adoption + quality:

Track:

- Time to first test success
- Failure rates across participants

Capture:

- "Where people got stuck" insights → gold for docs improvement

## Suggested Closing

Quick 10-min regroup:

- What blocked you most?
- What confused you most?
- Would a customer succeed?
