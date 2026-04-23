import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      style={{
        height: 16,
        background: '#e5e7eb',
        borderRadius: 4,
        width,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function TableSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div style={{ padding: '1rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
            gap: '1rem',
            padding: '0.75rem 0',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <SkeletonLine width="80%" />
          <SkeletonLine width="60%" />
          <SkeletonLine width="50%" />
          <SkeletonLine width="40%" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <SkeletonLine width="60%" />
      <SkeletonLine width="40%" />
      <SkeletonLine width="30%" />
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#6b7280',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>{title}</h3>
      {description && <p style={{ margin: '0 0 1.5rem' }}>{description}</p>}
      {action}
    </div>
  );
}
