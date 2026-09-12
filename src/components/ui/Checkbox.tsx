import React from 'react';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, disabled = false, onCheckedChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = 'Checkbox';
