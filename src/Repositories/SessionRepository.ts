import { makeApiCall } from "../Helper/RepositoryHelper";

export class SessionRepository {
    /**
   * Fetch a list of sessions
   * @returns Promise<{ sessions: string[] }>
   */
static async fetchAllSessions(): Promise<{ sessions: string[] }> {
    try {
      const response = await makeApiCall(`/sessions`, {
        method: 'GET',
      }, true);
      const result = await response.json();
      // Assume the result is an array of strings
      return result;
    } catch (error) {
      console.error('Failed to fetch Sessions:', error);
      return { sessions: [] };
    }
  }
}
