interface EyeIconProps {
  off?: boolean;
}

/** Eye / eye-off glyph shared by password visibility controls. */
export function EyeIcon({ off = false }: EyeIconProps) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M2.71 3.71 1.29 5.12 4.6 8.43C3.07 9.83 1.83 11.55 1 13.5 2.73 17.89 7 21 12 21c1.9 0 3.68-.42 5.24-1.19l3.05 3.05 1.41-1.41ZM12 18.5a5 5 0 0 1-5-5c0-.7.15-1.36.41-1.96l1.53 1.53a3 3 0 0 0 3.95 3.95l1.53 1.53c-.6.26-1.26.41-1.96.41.35 0 0-.46 0-.46ZM12 6c5 0 9.27 3.11 11 7.5a13.44 13.44 0 0 1-2.6 3.9l-1.45-1.45A11.4 11.4 0 0 0 20.82 13.5 11.4 11.4 0 0 0 12 8c-.86 0-1.7.09-2.5.26L7.94 6.7A12.9 12.9 0 0 1 12 6Zm-.19 3.01 4.68 4.68c.03-.19.05-.38.05-.58a3 3 0 0 0-3-3c-.2 0-.39.02-.58.05Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 6c-5 0-9.27 3.11-11 7.5C2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  );
}
