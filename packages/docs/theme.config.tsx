import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: (
    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
      Power Platform Playwright Toolkit
    </span>
  ),
  project: {
    link: 'https://github.com/microsoft/power-platform-playwright-samples',
  },
  docsRepositoryBase:
    'https://github.com/microsoft/power-platform-playwright-samples/tree/main/packages/docs',
  footer: {
    content: <span>{new Date().getFullYear()} © Microsoft Corporation. Licensed under MIT.</span>,
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Power Platform Playwright Toolkit" />
      <meta
        property="og:description"
        content="Official Playwright automation framework for Microsoft Power Platform — Canvas Apps, Model-Driven Apps, Custom Pages, and Gen UX."
      />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    content: 'Edit this page on GitHub →',
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
  },
};

export default config;
