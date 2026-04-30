import { useNavigate } from '@tanstack/react-router';
import { Button } from '@headlessui/react';

export function HashLink({
  hash,
  className,
  children,
}: {
  hash: string;
  className?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <Button
      className={className}
      onClick={() => {
        navigate({
          to: '.',
          hash,
          resetScroll: false,
          hashScrollIntoView: {
            behavior: 'smooth',
            block: 'start',
          },
        });
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {children}
    </Button>
  );
}
