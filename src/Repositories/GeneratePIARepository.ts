import { makeApiCall } from "../Helper/RepositoryHelper";

export class GeneratePIARepository {
    /**
   * Call the /generate_pia endpoint with query, batch_id, and processing_activity
   * @param query - The query string
   * @param batch_id - The batch ID (optional)
   * @param processing_activity - List of processing activities (optional)
   * @returns Promise<any> - The API response
   */
  static async generatePia(query: string, batch_id?: string, processing_activity?: string[]): Promise<Response> {
    try {
      const body = {
        query,
        batch_id,
        processing_activity,
      };
      const response = await makeApiCall('/generate_pia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return response;
    } catch (error) {
      console.error('Failed to generate PIA:', error);
      throw error;
    }
  }
}