const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

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

  if (typeof message === 'string') {
    return message;
  }

  return 'Something went wrong.';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  const response =
    await fetch(`${API_URL}${path}`, {
      ...options,
      headers,

      /*
       * Required so the browser can send and receive
       * our HttpOnly refresh_token cookie.
       */
      credentials: 'include',
    });

  if (response.status === 204) {
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

  return data as T;
}

export function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}