import React from 'react';

interface EnvVar {
  name: string;
  required?: boolean;
  description: string;
  example?: string;
}

interface EnvTableProps {
  vars: EnvVar[];
}

export function EnvTable({ vars }: EnvTableProps) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1.5rem' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
        }}
      >
        <thead>
          <tr>
            {['Variable', 'Required', 'Description', 'Example'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '0.625rem 1rem',
                  borderBottom: '2px solid #e5e7eb',
                  fontWeight: 600,
                  color: '#374151',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vars.map((v, i) => (
            <tr
              key={v.name}
              style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}
            >
              <td
                style={{
                  padding: '0.625rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1d4ed8',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.name}
              </td>
              <td
                style={{
                  padding: '0.625rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                {v.required ? (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                    }}
                  >
                    Required
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  >
                    Optional
                  </span>
                )}
              </td>
              <td
                style={{
                  padding: '0.625rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#374151',
                  lineHeight: 1.5,
                }}
              >
                {v.description}
              </td>
              <td
                style={{
                  padding: '0.625rem 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#6b7280',
                }}
              >
                {v.example ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
