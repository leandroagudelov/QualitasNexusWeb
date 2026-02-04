import { FileUploadRequest } from '@/types/profile';

/**
 * Convert File to FileUploadRequest for API
 */
export async function fileToUploadRequest(file: File): Promise<FileUploadRequest> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const data = Array.from(uint8);

  return {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    data,
  };
}

/**
 * Generate preview URL for image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File): number {
  return Math.round((file.size / (1024 * 1024)) * 100) / 100;
}
