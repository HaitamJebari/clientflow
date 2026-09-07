'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  apiRequest,
  ApiError,
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
  const [
    accessToken,
    setAccessToken,
  ] =
    useState<string | null>(
      null,
    );

  const [user, setUser] =
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

  const [status, setStatus] =
    useState<AuthStatus>(
      'loading',
    );

  const clearAuth =
    useCallback(() => {
      setAccessToken(null);
      setUser(null);
      setOrganization(null);

      setStatus(
        'unauthenticated',
      );
    }, []);

  const loadMe =
    useCallback(
      async (
        token: string,
      ) => {
        const result =
          await apiRequest<MeResponse>(
            '/auth/me',
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        setUser(result.user);

        setOrganization(
          result.organization,
        );

        setStatus(
          'authenticated',
        );
      },
      [],
    );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const token =
          await refreshAccessToken();

        if (cancelled) {
          return;
        }

        setAccessToken(
          token,
        );

        await loadMe(
          token,
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
              method: 'POST',

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setAccessToken(
          result.accessToken,
        );

        setUser(result.user);

        setOrganization(
          result.organization,
        );

        setStatus(
          'authenticated',
        );
      },
      [],
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
              method: 'POST',

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setAccessToken(
          result.accessToken,
        );

        setUser(result.user);

        setOrganization(
          result.organization,
        );

        setStatus(
          'authenticated',
        );
      },
      [],
    );

  const request =
    useCallback(
      async <T,>(
        path: string,
        options: RequestInit = {},
      ): Promise<T> => {
        let token =
          accessToken;

        if (!token) {
          token =
            await refreshAccessToken();

          setAccessToken(
            token,
          );
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
           * Only refresh after an actual
           * authentication failure.
           *
           * Do NOT refresh after every
           * 400 / 403 / 500.
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

            setAccessToken(
              freshToken,
            );

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
        accessToken,
        clearAuth,
      ],
    );

  const logout =
    useCallback(async () => {
      try {
        if (accessToken) {
          await apiRequest<void>(
            '/auth/logout',
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            },
          );
        }
      } finally {
        clearAuth();
      }
    }, [
      accessToken,
      clearAuth,
    ]);

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