import { makeApiCall } from '../Helper/RepositoryHelper';
import type { IngestionResponse } from '../Models/IngestionResponse';

// Ingestion repository functions
export class IngestionRepository {
  /**
   * Upload and ingest a file (CSV, XLSX, or PDF) to the backend
   * @param file - The file to upload and ingest
   * @returns Promise with the embedding result
   */
  static async ingestFile(file: File): Promise<IngestionResponse> {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Use makeApiCall with FormData
      const response = await makeApiCall('/ingest-file', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary for FormData
        headers: {} // Override default headers for FormData
      });

      const result = await response.json();
      return {
        embedding: result,
        success: true
      };

    } catch (error) {
      console.error('File ingestion failed:', error);
      return {
        embedding: [],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if a file type is supported for ingestion
   * @param file - The file to check
   * @returns boolean indicating if the file type is supported
   */
  static isFileTypeSupported(file: File): boolean {
    const supportedTypes = ['.csv', '.xlsx', '.pdf'];
    const fileName = file.name.toLowerCase();
    
    return supportedTypes.some(type => fileName.endsWith(type));
  }

  /**
   * Validate file size (optional helper method)
   * @param file - The file to validate
   * @param maxSizeMB - Maximum file size in MB (default: 50MB)
   * @returns boolean indicating if the file size is acceptable
   */
  static validateFileSize(file: File, maxSizeMB: number = 50): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
