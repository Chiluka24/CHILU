// API utility functions with error handling and retry logic

import { API_BASE } from '../config/env';
import { sessionManager } from './sessionManager';
import { cacheManager } from './cacheManager';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class NetworkError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.code = code;
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token = sessionManager.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  useCache = false
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  
  // Check cache for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = cacheManager.get<T>(endpoint);
    if (cached) return cached;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new NetworkError('Session expired. Please log in again.', 401);
    }

    // Parse response
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new NetworkError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.code
      );
    }

    // Cache successful GET responses
    if (useCache && (!options.method || options.method === 'GET')) {
      cacheManager.set(endpoint, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }

    // Network error (no internet, server down, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError(
        'Unable to connect to server. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new NetworkError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
};

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, useCache = true) =>
    apiRequest<T>(endpoint, { method: 'GET' }, useCache),

  post: <T = any>(endpoint: string, data?: any) => {
    // Invalidate cache on mutations
    cacheManager.invalidatePattern(endpoint.split('?')[0]);
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T = any>(endpoint: string, data?: any) => {
    // Invalidate cache on mutations
    cacheManager.invalidatePattern(endpoint.split('?')[0]);
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T = any>(endpoint: string) => {
    // Invalidate cache on mutations
    cacheManager.invalidatePattern(endpoint.split('?')[0]);
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },

  // Upload file with multipart/form-data
  upload: async <T = any>(endpoint: string, formData: FormData): Promise<T> => {
    const token = sessionManager.getToken();
    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new NetworkError('Session expired. Please log in again.', 401);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new NetworkError(
          data.error || `Upload failed with status ${response.status}`,
          response.status
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Upload failed',
        0,
        'UPLOAD_ERROR'
      );
    }
  },
};

// Retry logic for critical operations
export const apiWithRetry = async <T = any>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof NetworkError && error.status) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};
