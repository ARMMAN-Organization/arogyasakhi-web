import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Role = 'MANAGER' | 'ADMIN' | 'ANALYST';

export interface AuthUser {
  id: string;
  name: string;
  roles: Role[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

/** Access token kept in memory only; refresh token is an httpOnly cookie. */
const initialState: AuthState = { token: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
