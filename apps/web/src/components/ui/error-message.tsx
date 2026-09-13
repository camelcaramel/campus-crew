import type { ReactNode } from 'react';

type ErrorMessageProps = {
  message: string;
  action?: ReactNode;
};

export function ErrorMessage({ message, action }: ErrorMessageProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-xl border border-neutral-200 p-6 text-center">
      <p role="alert" className="text-red-600!">
        {message}
      </p>
      {action}
    </div>
  );
}
