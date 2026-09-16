const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

const DEFAULT_GET_CACHE_TTL_MS =
  20_000;

interface CachedResponse {
  expiresAt: number;
  data: unknown;
}

export interface ApiRequestOptions
  extends RequestInit {
  /**
   * Client-side in-memory cache lifetime for GET requests.
   *
   * - default: 20 seconds
   * - 0: do not store the response
   *
   * RequestInit.cache === 'no-store' also disables this cache.
   */
  cacheTtlMs?: number;

  /**
   * When true, identical in-flight GET requests share one Promise.
   * Enabled by default.
   */
  dedupe?: boolean;
}

const responseCache =
  new Map<
    string,
    CachedResponse
  >();

const inFlightRequests =
  new Map<
    string,
    Promise<unknown>
  >();

/*
 * Incremented whenever application data is invalidated.
 * An older in-flight GET is not allowed to repopulate the cache
 * after a mutation has already cleared it.
 */
let cacheGeneration = 0;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);

    this.name = 'ApiError';
  }
}

function normalizeMessage(
  message: unknown,
): string {
  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (
    typeof message ===
    'string'
  ) {
    return message;
  }

  return 'Something went wrong.';
}

function buildRequestKey(
  path: string,
  headers: Headers,
) {
  /*
   * Authorization is part of the key so cached data from one
   * authenticated session can never be served to another token.
   *
   * The key stays only in browser memory and is never persisted.
   */
  const authorization =
    headers.get(
      'Authorization',
    ) ?? 'anonymous';

  return `${path}::${authorization}`;
}

function removeExpiredEntries() {
  const now =
    Date.now();

  for (
    const [
      key,
      value,
    ] of responseCache
  ) {
    if (
      value.expiresAt <=
      now
    ) {
      responseCache.delete(
        key,
      );
    }
  }
}

export function clearApiCache() {
  cacheGeneration += 1;

  responseCache.clear();
  inFlightRequests.clear();
}

export function invalidateApiCache(
  matcher?:
    | string
    | RegExp,
) {
  if (!matcher) {
    clearApiCache();
    return;
  }

  for (
    const key of responseCache.keys()
  ) {
    const matches =
      typeof matcher ===
      'string'
        ? key.includes(
            matcher,
          )
        : matcher.test(
            key,
          );

    if (matches) {
      responseCache.delete(
        key,
      );
    }
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    cacheTtlMs =
      DEFAULT_GET_CACHE_TTL_MS,

    dedupe = true,

    ...fetchOptions
  } = options;

  const headers =
    new Headers(
      fetchOptions.headers,
    );

  if (
    fetchOptions.body &&
    !(
      fetchOptions.body instanceof
      FormData
    ) &&
    !headers.has(
      'Content-Type',
    )
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  const method =
    (
      fetchOptions.method ??
      'GET'
    ).toUpperCase();

  const canUseMemoryCache =
    method === 'GET' &&
    !fetchOptions.signal &&
    fetchOptions.cache !==
      'no-store';

  const requestKey =
    canUseMemoryCache
      ? buildRequestKey(
          path,
          headers,
        )
      : null;

  if (requestKey) {
    removeExpiredEntries();

    const cached =
      responseCache.get(
        requestKey,
      );

    if (
      cached &&
      cached.expiresAt >
        Date.now()
    ) {
      return cached.data as T;
    }

    if (dedupe) {
      const inFlight =
        inFlightRequests.get(
          requestKey,
        );

      if (inFlight) {
        return inFlight as Promise<T>;
      }
    }
  }

  const execute =
    async (): Promise<T> => {
      const response =
        await fetch(
          `${API_URL}${path}`,
          {
            ...fetchOptions,

            headers,

            /*
             * Required so the browser can send and receive
             * the HttpOnly refresh_token cookie.
             */
            credentials:
              'include',
          },
        );

      if (
        response.status ===
        204
      ) {
        /*
         * Mutations must invalidate cached GET data only after
         * the server has successfully completed the mutation.
         */
        if (
          method !== 'GET' &&
          path !==
            '/auth/refresh'
        ) {
          clearApiCache();
        }

        return undefined as T;
      }

      const contentType =
        response.headers.get(
          'content-type',
        );

      const data =
        contentType?.includes(
          'application/json',
        )
          ? await response.json()
          : null;

      if (!response.ok) {
        throw new ApiError(
          response.status,
          normalizeMessage(
            data?.message,
          ),
          data,
        );
      }

      /*
       * Any successful mutation may change data used by Leads,
       * Pipeline, Contacts, Dashboard, etc. Clearing the tiny
       * in-memory cache guarantees the next read is fresh.
       *
       * Refresh-token rotation is explicitly excluded because it
       * does not change application data.
       */
      if (
        method !== 'GET' &&
        method !== 'HEAD' &&
        path !==
          '/auth/refresh'
      ) {
        clearApiCache();
      }

      return data as T;
    };

  if (!requestKey) {
    return execute();
  }

  const requestGeneration =
    cacheGeneration;

  const promise =
    execute()
      .then(
        (data) => {
          if (
            cacheTtlMs >
              0 &&
            requestGeneration ===
              cacheGeneration
          ) {
            responseCache.set(
              requestKey,
              {
                expiresAt:
                  Date.now() +
                  cacheTtlMs,

                data,
              },
            );
          }

          return data;
        },
      )
      .finally(() => {
        inFlightRequests.delete(
          requestKey,
        );
      });

  if (dedupe) {
    inFlightRequests.set(
      requestKey,
      promise,
    );
  }

  return promise;
}

export function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    ApiError
  ) {
    return error.message;
  }

  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return 'Something went wrong.';
}
