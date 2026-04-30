import type { ReactNode } from 'react';
import { sfFormFields, sfShell } from './shared-classes';

interface StandardFormPanelProps {
  children: ReactNode;
}

/**
 * Frosted shell without `<form>` — for status / confirmation flows (e.g. sign-out).
 */
export function StandardFormPanel({ children }: StandardFormPanelProps) {
  return <div className={sfShell}>{children}</div>;
}

interface StandardFormShellProps {
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

/**
 * Frosted panel wrapper — same visual vocabulary as `#gallery` (`bg-black/80` backdrop blur).
 */
export function StandardFormShell({
  onSubmit,
  children,
}: StandardFormShellProps) {
  return (
    <div className={sfShell}>
      <form onSubmit={onSubmit} className={sfFormFields} noValidate>
        {children}
      </form>
    </div>
  );
}
