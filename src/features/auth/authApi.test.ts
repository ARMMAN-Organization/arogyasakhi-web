import { describe, expect, it } from 'vitest';

import { toAuthTokensResult, toMeResult } from './authApi';

describe('toAuthTokensResult', () => {
  it('maps a login/refresh response envelope into the app-facing shape', () => {
    const response = {
      success: true,
      message: 'OK',
      data: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresIn: 900,
        roles: ['ADMIN' as const],
        projectId: 'p1',
        geographyUnitId: 'g1',
      },
    };

    expect(toAuthTokensResult(response)).toEqual({
      token: 'access-1',
      refreshToken: 'refresh-1',
      expiresIn: 900,
      user: { roles: ['ADMIN'], projectId: 'p1', geographyUnitId: 'g1' },
    });
  });

  it('passes through null projectId/geographyUnitId for platform roles', () => {
    const response = {
      success: true,
      message: 'OK',
      data: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresIn: 900,
        roles: ['ADMIN' as const],
        projectId: null,
        geographyUnitId: null,
      },
    };

    expect(toAuthTokensResult(response).user).toEqual({
      roles: ['ADMIN'],
      projectId: null,
      geographyUnitId: null,
    });
  });
});

describe('toMeResult', () => {
  it('maps GET /me response envelope into the profile fields', () => {
    const response = {
      success: true,
      message: 'OK',
      data: {
        id: 'u1',
        username: 'test.admin',
        displayName: 'System Administrator',
        projectName: null,
      },
    };

    expect(toMeResult(response)).toEqual({
      id: 'u1',
      username: 'test.admin',
      displayName: 'System Administrator',
      projectName: null,
    });
  });
});
