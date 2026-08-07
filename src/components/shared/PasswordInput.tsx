import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

import { EyeIcon } from './EyeIcon';
import './PasswordInput.css';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  toggleLabel?: { show: string; hide: string };
}

/** Password field with a show/hide toggle. Defaults to masked on mount. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { toggleLabel = { show: 'Show password', hide: 'Hide password' }, className, ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="password-input">
        <input ref={ref} type={visible ? 'text' : 'password'} className={className} {...rest} />
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? toggleLabel.hide : toggleLabel.show}
          aria-pressed={visible}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
    );
  },
);
