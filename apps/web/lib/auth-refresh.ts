import {
  apiRequest,
} from '@/lib/api';

let refreshPromise:
  Promise<string> | null =
  null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise =
    apiRequest<{
      accessToken: string;
    }>(
      '/auth/refresh',
      {
        method:
          'POST',

        /*
         * A refresh response must never come from browser cache.
         * apiRequest already excludes refresh from mutation cache
         * invalidation.
         */
        cache:
          'no-store',
      },
    )
      .then(
        (response) => {
          if (
            !response.accessToken
          ) {
            throw new Error(
              'The refresh endpoint did not return an access token.',
            );
          }

          return response.accessToken;
        },
      )
      .finally(() => {
        refreshPromise =
          null;
      });

  return refreshPromise;
}
