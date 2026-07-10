import { z } from 'zod';

/**
 * Login form schema. Values are the i18n keys for error messages so the UI
 * stays localized. Login only validates presence/format — password complexity
 * is enforced when a password is set, not at sign-in.
 */
export const loginSchema = z.object({
  // Indian mobile numbers are 10 digits. Mirror the backend rule if it differs.
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'auth.errors.mobileInvalid'),
  password: z.string().min(1, 'auth.errors.passwordRequired'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
