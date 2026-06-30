/** Validated, typed environment config. Fails fast if a required value is missing. */
interface AppEnv {
  apiBaseUrl: string;
}

function readEnv(): AppEnv {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('Configuration error: VITE_API_BASE_URL is not set. Check your .env file.');
  }
  return { apiBaseUrl };
}

export const env: AppEnv = readEnv();
