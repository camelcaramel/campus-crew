import type { ReactNode } from 'react';

type EmptyStateProps = {
  message: string;
  action?: ReactNode;
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-neutral-200 p-6 text-center">
      <p>{message}</p>
      {action}
    </div>
  );
}
