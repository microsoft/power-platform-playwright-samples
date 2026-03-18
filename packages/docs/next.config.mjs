import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  latex: true,
  search: {
    codeblocks: false
  },
  defaultShowCopyCode: true
});

const isGitHubPages = process.env.NEXT_PUBLIC_BASE_PATH;

export default withNextra({
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  ...(isGitHubPages && {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
    output: 'export'
  })
});
