import { makeApiCall } from "../Helper/RepositoryHelper";

export class GeneratePIARepository {
    /**
   * Call the /bulk_generate_pia endpoint with BulkRetrieveRequest structure
   * @param payload - The BulkRetrieveRequest containing requests array
   * @returns Promise<any> - The API response
   */
  static async generatePia(payload: BulkRetrieveRequest): Promise<Response> {
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
}