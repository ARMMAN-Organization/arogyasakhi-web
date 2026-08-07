import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';

import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  options: SelectOption[];
  /** Keep the label accessible to screen readers but hide it visually (compact toolbars). */
  hideLabel?: boolean;
}

/** Labelled dropdown used for dashboard/report filters. */
export function Select({ label, options, className, hideLabel, ...rest }: SelectProps) {
  const id = useId();
  const classes = ['select-field__control', className].filter(Boolean).join(' ');
  const labelClasses = ['select-field__label', hideLabel && 'select-field__label--hidden']
    .filter(Boolean)
    .join(' ');
  return (
    <div className="select-field">
      <label className={labelClasses} htmlFor={id}>
        {label}
      </label>
      <select id={id} className={classes} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
