/**
 * VisionFlow — API Service
 *
 * Bridges the React Native frontend to the FastAPI backend.
 * All requests go through here for centralized error handling
 * and automatic token/header management.
 */

import { API_BASE_URL } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadResult {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  format: string;
  uploaded_at: string;
}

export interface ColorAnalysis {
  temperature_kelvin: number;
  temperature_delta: number;
  dominant_colors_hex: string[];
  dominant_colors_oklch: { l: number; c: number; h: number }[];
  average_lightness: number;
  average_chroma: number;
  color_harmony: string;
  saturation_level: string;
  dynamic_range: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }

  // For blob responses (images)
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/')) {
    const blob = await res.blob();
    return blob as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/** Check if the backend is reachable and healthy */
export async function checkHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health');
}

/** Upload an image file to the backend */
export async function uploadImage(
  uri: string,
  filename: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type: `image/${filename.split('.').pop()?.toLowerCase() ?? 'jpeg'}`,
  } as any);

  return request<UploadResult>('/api/upload', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — the browser/RN will set it with boundary
  });
}

/** Analyze image color science (server-side colour-science) */
export async function analyzeColors(imageId: string): Promise<ColorAnalysis> {
  return request<ColorAnalysis>(`/api/analyze/${imageId}`);
}

/** Remove background (returns PNG blob) */
export async function removeBackground(
  imageId: string,
  alphaMatting: boolean = false
): Promise<Blob> {
  return request<Blob>(
    `/api/remove-bg/${imageId}?alpha_matting=${alphaMatting}`,
    { method: 'POST' }
  );
}

/** Super-resolution upscale (returns PNG blob) */
export async function upscaleImage(
  imageId: string,
  scale: 2 | 4 = 4
): Promise<Blob> {
  return request<Blob>(
    `/api/upscale/${imageId}?scale=${scale}`,
    { method: 'POST' }
  );
}

export default {
  checkHealth,
  uploadImage,
  analyzeColors,
  removeBackground,
  upscaleImage,
};
