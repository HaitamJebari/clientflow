'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  apiRequest,
  ApiError,
  clearApiCache,
} from '@/lib/api';

import {
  refreshAccessToken,
} from '@/lib/auth-refresh';

import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  Organization,
  RegisterPayload,
  User,
} from '@/types/auth';

type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

interface AuthContextValue {
  user: User | null;

  organization:
    | Organization
    | null;

  status: AuthStatus;

  login(
    payload: LoginPayload,
  ): Promise<void>;

  registerAccount(
    payload: RegisterPayload,
  ): Promise<void>;

  logout(): Promise<void>;

  request<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Keep the access token in a ref instead of React state.
   *
   * Why:
   * - the token itself is not rendered anywhere
   * - changing it should not re-render every useAuth() consumer
   * - request() can stay referentially stable across token refreshes
   *
   * This is especially important as Dashboard / Leads / Pipeline /
   * Contacts / Proposals all begin using the same provider.
   */
  const accessTokenRef =
    useRef<string | null>(
      null,
    );

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    organization,
    setOrganization,
  ] =
    useState<
      Organization | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState<AuthStatus>(
      'loading',
    );

  const clearAuth =
    useCallback(() => {
      clearApiCache();

      accessTokenRef.current =
        null;

      setUser(null);

      setOrganization(null);

      setStatus(
        'unauthenticated',
      );
    }, []);

  const setAuthenticatedSession =
    useCallback(
      (
        accessToken: string,
        authenticatedUser: User,
        authenticatedOrganization:
          Organization,
      ) => {
        clearApiCache();

        accessTokenRef.current =
          accessToken;

        setUser(
          authenticatedUser,
        );

        setOrganization(
          authenticatedOrganization,
        );

        setStatus(
          'authenticated',
        );
      },
      [],
    );

  const loadMe =
    useCallback(
      async (
        token: string,
      ) => {
        return apiRequest<MeResponse>(
          '/auth/me',
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );
      },
      [],
    );

  useEffect(() => {
    let cancelled =
      false;

    async function bootstrap() {
      try {
        const token =
          await refreshAccessToken();

        if (cancelled) {
          return;
        }

        accessTokenRef.current =
          token;

        const result =
          await loadMe(
            token,
          );

        if (cancelled) {
          return;
        }

        setUser(
          result.user,
        );

        setOrganization(
          result.organization,
        );

        setStatus(
          'authenticated',
        );
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [
    clearAuth,
    loadMe,
  ]);

  const login =
    useCallback(
      async (
        payload: LoginPayload,
      ) => {
        const result =
          await apiRequest<AuthResponse>(
            '/auth/login',
            {
              method:
                'POST',

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setAuthenticatedSession(
          result.accessToken,
          result.user,
          result.organization,
        );
      },
      [
        setAuthenticatedSession,
      ],
    );

  const registerAccount =
    useCallback(
      async (
        payload: RegisterPayload,
      ) => {
        const result =
          await apiRequest<AuthResponse>(
            '/auth/register',
            {
              method:
                'POST',

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setAuthenticatedSession(
          result.accessToken,
          result.user,
          result.organization,
        );
      },
      [
        setAuthenticatedSession,
      ],
    );

  const request =
    useCallback(
      async <T,>(
        path: string,
        options: RequestInit = {},
      ): Promise<T> => {
        let token =
          accessTokenRef.current;

        if (!token) {
          token =
            await refreshAccessToken();

          accessTokenRef.current =
            token;
        }

        const execute = (
          currentToken: string,
        ) => {
          const headers =
            new Headers(
              options.headers,
            );

          headers.set(
            'Authorization',
            `Bearer ${currentToken}`,
          );

          return apiRequest<T>(
            path,
            {
              ...options,
              headers,
            },
          );
        };

        try {
          return await execute(
            token,
          );
        } catch (error) {
          /*
           * Refresh only after a real authentication failure.
           * Never refresh after unrelated 400 / 403 / 404 / 500 errors.
           */
          if (
            !(
              error instanceof
              ApiError
            ) ||
            error.status !== 401
          ) {
            throw error;
          }

          try {
            const freshToken =
              await refreshAccessToken();

            accessTokenRef.current =
              freshToken;

            return await execute(
              freshToken,
            );
          } catch (
            refreshError
          ) {
            clearAuth();

            throw refreshError;
          }
        }
      },
      [
        clearAuth,
      ],
    );

  const logout =
    useCallback(
      async () => {
        const token =
          accessTokenRef.current;

        try {
          if (token) {
            await apiRequest<void>(
              '/auth/logout',
              {
                method:
                  'POST',

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              },
            );
          }
        } finally {
          clearAuth();
        }
      },
      [
        clearAuth,
      ],
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        organization,
        status,
        login,
        registerAccount,
        logout,
        request,
      }),
      [
        user,
        organization,
        status,
        login,
        registerAccount,
        logout,
        request,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
}
