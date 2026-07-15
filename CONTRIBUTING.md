# Contributing to Power Platform Playwright Samples

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](https://github.com/microsoft/power-platform-playwright-samples/issues) to report bugs or request features.
- Search existing issues before opening a new one.
- For security vulnerabilities, see [SECURITY.md](SECURITY.md) — **do not use public issues**.

### Making Changes

1. Fork the repository and create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Make your changes in the appropriate package:
   - **Library changes**: `packages/power-platform-playwright-toolkit/src/`
   - **Sample test changes**: `packages/e2e-tests/`

4. Add the Microsoft copyright header to any new source files:

   ```typescript
   // Copyright (c) Microsoft Corporation.
   // Licensed under the MIT license.
   ```

5. Build and verify:

   ```bash
   npm run build
   ```

6. Run format and lint checks:

   ```bash
   npm run format:check
   npm run lint
   ```

7. Submit a pull request to `main` with a clear description of the change.

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Update documentation if you change public API surface.
- Ensure all CI checks pass before requesting review.
- Follow the existing code style (enforced by Prettier and ESLint).

## Development Setup

See the [Getting Started from Source](README.md#getting-started-from-source) section in the README.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
Please review it before contributing.
