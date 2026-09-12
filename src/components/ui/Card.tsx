import React from 'react';
import { cn } from '@/lib/utils';

function createDivComponent(displayName: string, baseClass: string) {
  const Component = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn(baseClass, className)} {...props} />,
  );
  Component.displayName = displayName;
  return Component;
}

export const Card = createDivComponent('Card', 'rounded-lg border bg-white text-gray-950 shadow-sm');
export const CardHeader = createDivComponent('CardHeader', 'flex flex-col space-y-1.5 p-6');
export const CardTitle = createDivComponent('CardTitle', 'text-2xl font-semibold leading-none tracking-tight');
export const CardContent = createDivComponent('CardContent', 'p-6 pt-0');
export const CardFooter = createDivComponent('CardFooter', 'flex items-center p-6 pt-0');
