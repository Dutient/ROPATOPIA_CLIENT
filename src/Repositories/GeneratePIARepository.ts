import { makeApiCall } from "../Helper/RepositoryHelper";

export class GeneratePIARepository {
    /**
   * Call the /bulk_generate_pia endpoint with BulkRetrieveRequest structure
   * @param payload - The BulkRetrieveRequest containing requests array
   * @returns Promise<any> - The API response
   */
  static async bulkGeneratePia(payload: BulkRetrieveRequest): Promise<Response> {
    try {
      const response = await makeApiCall('/bulk_generate_pia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Failed to generate PIA:', error);
      throw error;
    }
  }

  /**
   * Call the /generate_pia endpoint with a single RetrieveRequest
   * @param payload - The single RetrieveRequest
   * @returns Promise<Response> - The API response
   */
  static async generatePia(payload: RetrieveRequest): Promise<Response> {
    try {
      const response = await makeApiCall('/generate_pia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Failed to generate single PIA:', error);
      throw error;
    }
  }
}