import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Role = 'MANAGER' | 'ADMIN' | 'ANALYST';

export interface AuthUser {
  roles: Role[];
  projectId: string | null;
  geographyUnitId: string | null;
  /** Populated by GET /me after login; absent until that call resolves. */
  id?: string;
  username?: string;
  displayName?: string;
  projectName?: string | null;
}

interface AuthState {
  token: string | null;
  /**
   * Kept in memory only, same as the access token — never persisted to
   * localStorage. auth-service returns this in the login/refresh response
   * body rather than an httpOnly cookie (see arogyasakhi-web CLAUDE.md
   * follow-up note); memory-only storage is the safest option available
   * against that real backend contract.
   */
  refreshToken: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = { token: null, refreshToken: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      // Merge onto any existing profile fields (id/username/displayName/projectName
      // from GET /me) so a token refresh never wipes them — only login and refresh
      // carry roles/projectId/geographyUnitId; only /me carries the rest.
      state.user = { ...state.user, ...action.payload.user };
    },
    /** Merges GET /me profile fields onto the existing user without clobbering roles/scope. */
    setProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setProfile, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
