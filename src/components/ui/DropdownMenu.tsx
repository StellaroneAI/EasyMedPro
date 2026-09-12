import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <DropdownContext.Provider value={value}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = useDropdownContext();

  const triggerProps = {
    onClick: () => setOpen(true),
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...triggerProps,
      ...(children as React.ReactElement<any>).props,
    });
  }

  return <button {...triggerProps}>{children}</button>;
}

export function DropdownMenuContent({
  children,
  className,
}: {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) {
  const { open, setOpen } = useDropdownContext();

  if (!open) return null;

  return (
    <div className={cn('absolute right-0 z-50 mt-2 min-w-[10rem] rounded-md border bg-white p-1 shadow-md', className)}>
      <div onMouseLeave={() => setOpen(false)}>{children}</div>
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { setOpen } = useDropdownContext();

  return (
    <button
      type="button"
      className={cn('w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', className)}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
