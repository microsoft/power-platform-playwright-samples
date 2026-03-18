import React, { useState } from 'react';

interface PackageInstallProps {
  packages: string[];
  dev?: boolean;
}

type PackageManager = 'npm' | 'pnpm' | 'yarn';

function buildCmd(pm: PackageManager, packages: string[], dev: boolean): string {
  const pkgs = packages.join(' ');
  const flag = dev ? (pm === 'npm' ? ' --save-dev' : ' -D') : '';
  switch (pm) {
    case 'npm':
      return `npm install${flag} ${pkgs}`;
    case 'pnpm':
      return `pnpm add${flag} ${pkgs}`;
    case 'yarn':
      return `yarn add${dev ? ' --dev' : ''} ${pkgs}`;
  }
}

export function PackageInstall({ packages, dev = false }: PackageInstallProps) {
  const [active, setActive] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);

  const cmd = buildCmd(active, packages, dev);

  function copy() {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const tabs: PackageManager[] = ['npm', 'pnpm', 'yarn'];

  return (
    <div
      style={{
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        marginTop: '1rem',
        marginBottom: '1.5rem',
        fontFamily: 'monospace',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 0.5rem',
        }}
      >
        {tabs.map((pm) => (
          <button
            key={pm}
            onClick={() => setActive(pm)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: active === pm ? 700 : 400,
              color: active === pm ? '#2563eb' : '#6b7280',
              background: 'none',
              border: 'none',
              borderBottom: active === pm ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-1px',
            }}
          >
            {pm}
          </button>
        ))}
        <button
          onClick={copy}
          style={{
            marginLeft: 'auto',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            color: copied ? '#16a34a' : '#6b7280',
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* Command */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontSize: '0.875rem',
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}
      >
        <span style={{ color: '#9cdcfe' }}>$ </span>
        {cmd}
      </div>
    </div>
  );
}
