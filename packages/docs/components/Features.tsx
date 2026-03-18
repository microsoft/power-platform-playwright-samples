import React from 'react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function Feature({ icon, title, children }: FeatureProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem',
          color: '#3b82f6',
          flexShrink: 0,
          marginTop: '0.125rem',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          flex: 1,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ fontWeight: 600 }}>{title}</strong>
        <span>: {children}</span>
      </div>
    </div>
  );
}

interface FeaturesProps {
  children: React.ReactNode;
}

export function Features({ children }: FeaturesProps) {
  return (
    <div
      style={{
        marginTop: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {children}
    </div>
  );
}
