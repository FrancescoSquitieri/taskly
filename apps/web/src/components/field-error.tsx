import type { JSX } from 'react';

export interface FieldErrorProps {
  message?: string;
}

export const FieldError = ({ message }: FieldErrorProps): JSX.Element | null => {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  );
};
