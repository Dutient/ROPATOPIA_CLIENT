// import { makeApiCall } from "../Helper/RepositoryHelper";

import { makeApiCall } from "../Helper/RepositoryHelper";
import type { ISession } from "../Models/ISession";

export class SessionRepository {
    /**
   * Fetch a list of sessions
   * @returns Promise<{ sessions: string[] }>
   */
  static async fetchAllSessions(): Promise<ISession[]> {
    try {
      // const response = await makeApiCall(`/sessions`, {
      //   method: 'GET',
      // }, true);
      // const result = await response.json();

      const result: ISession[] = [
        {
          session_id: '1',
          company_name: 'Company 1',
          processing_activities: ['Activity 1', 'Activity 2', 'Activity 3'],
          isActive: true
        },
        {
          session_id: '2',
          company_name: 'Company 2',
          processing_activities: ['Activity 4', 'Activity 5', 'Activity 6'],
          isActive: true
        }
      ]
      
      // Ensure result is an array
      if (!Array.isArray(result)) {
        console.warn('Sessions API returned non-array result:', result);
        return [];
      }
      
      // Validate that each item has the expected structure
      const validSessions = result.filter((session: any) => 
        session && 
        typeof session.session_id === 'string' && 
        typeof session.company_name === 'string' &&
        Array.isArray(session.processing_activities)
      );
      
      if (validSessions.length !== result.length) {
        console.warn('Some sessions had invalid structure:', result);
      }
      
      return validSessions;
    } catch (error) {
      console.error('Failed to fetch Sessions:', error);
      return [];
    }
  }

  static async createSession(batch_id: string, activity: string[], company_name: string): Promise<Response> {
    try {
      const payload = {
        batch_id,
        processing_activities: activity,
        company_name
      };

      const response = await makeApiCall(`/sessions`, {
        method: 'GET',
        body: JSON.stringify(payload),
      }, true);

      return response;
      
    } catch (error) {
      console.error('Failed to create the session:', error);
      throw error;
    }
      
  }
}
