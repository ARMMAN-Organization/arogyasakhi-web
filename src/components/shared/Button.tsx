import type { ButtonHTMLAttributes, ReactNode } from 'react';

import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

/** Primary action button following the style guide (lavender primary, outline secondary). */
export function Button({ variant = 'primary', className, type = 'button', children, ...rest }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
