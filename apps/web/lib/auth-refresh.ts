import {
  apiRequest,
} from '@/lib/api';

let refreshPromise:
  Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise =
    apiRequest<{
      accessToken: string;
    }>('/auth/refresh', {
      method: 'POST',
    })
      .then(
        (response) =>
          response.accessToken,
      )
      .finally(() => {
        refreshPromise = null;
      });

  return refreshPromise;
}