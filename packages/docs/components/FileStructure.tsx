import React from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  description?: string;
  children?: FileItem[];
}

interface FileStructureProps {
  items: FileItem[];
}

function FileNode({ item, depth }: { item: FileItem; depth: number }) {
  const indent = depth * 20;
  const isFolder = item.type === 'folder';

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.2rem 0',
          paddingLeft: `${indent}px`,
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>{isFolder ? '📁' : '📄'}</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: isFolder ? '#1d4ed8' : '#374151',
            fontWeight: isFolder ? 600 : 400,
          }}
        >
          {item.name}
        </span>
        {item.description && (
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
            — {item.description}
          </span>
        )}
      </div>
      {item.children?.map((child) => (
        <FileNode key={child.name} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function FileStructure({ items }: FileStructureProps) {
  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem 1.25rem',
        marginTop: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {items.map((item) => (
        <FileNode key={item.name} item={item} depth={0} />
      ))}
    </div>
  );
}
