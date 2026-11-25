const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  tenantId?: string;
  tenantSlug?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers(options.headers);
  if (isFormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && token !== 'undefined' && token !== 'null' && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.tenantId) {
    headers.set('x-tenant-id', options.tenantId);
  } else if (options.tenantSlug) {
    headers.set('x-tenant-slug', options.tenantSlug);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body
        ? typeof FormData !== 'undefined' && body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
