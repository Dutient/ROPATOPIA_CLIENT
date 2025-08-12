import { makeApiCall } from "../Helper/RepositoryHelper";

export class ProcessingActivityRepository {
    /**
   * Fetch a list of strings using the batch_id
   * @param batch_Id - The batch ID returned from ingestion
   * @returns Promise<string[]>
   */
static async fetchActivitiesByBatchId(batch_id: string): Promise<{ processing_activities: string[] }> {
    try {
      const response = await makeApiCall(`/list/processing_activities?batch_id=${encodeURIComponent(batch_id)}`, {
        method: 'GET',
      }, true);
      const result = await response.json();
      // Assume the result is an array of strings
      return result;
    } catch (error) {
      console.error('Failed to fetch Activities by batch_id:', error);
      return { processing_activities: [] };
    }
  }
}
