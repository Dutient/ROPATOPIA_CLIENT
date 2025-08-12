import { makeApiCall } from '../Helper/RepositoryHelper';

// Ingestion repository functions
export class IngestionRepository {
  /**
   * Upload and ingest a file (CSV, XLSX, or PDF) to the backend
   * @param file - The file to upload and ingest
   * @param companyName - The company name to send
   * @param sheetName - The sheet name/number to send
   * @returns Promise with the embedding result
   */
  static async ingestFile(file: File, companyName: string, sheetName: string, template: string): Promise<Response> {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company', companyName);
      formData.append('sheet_name', sheetName);
      formData.append('template_type', template);
      // Use makeApiCall with FormData
      const response = await makeApiCall('/ingest-file', {
        method: 'POST',
        body: formData,
      }, true);
      return response;

    } catch (error) {
      console.error('File ingestion failed:', error);
      throw error;
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
