import { makeApiCall } from "../Helper/RepositoryHelper";
import type { IPreliminaryQuestions } from "../Models/IRopaTemplate";
import type { ISession } from "../Models/ISession";

export class RopaTemplateRepository {
    
    static async getPreliminaryQuestions(): Promise<IPreliminaryQuestions> {
        try {
            const response = await makeApiCall('/ropa/preliminary-questions', {
                method: 'GET',
            }, true);
            const result: IPreliminaryQuestions = await response.json();
            return result
        } catch (error) {
            console.error('Failed to get preliminary questions:', error);
            throw error;
        }
    }

    static async getRopaSessions(): Promise<ISession[]> {
        try {
            const response = await makeApiCall('/ropa/sessions', {
                method: 'GET',
            }, true);
            const result = await response.json();
            const sessions: ISession[] = result.sessions;
            return sessions;
        } catch (error) {
            console.error('Failed to get ROPA sessions:', error);
            throw error;
        }
    }

    static async deleteRopaSession(session_id: string): Promise<Response> {
        try {
          const response = await makeApiCall(`/ropa/session/${session_id}`, {
            method: 'DELETE',
          }, true);
          return response;
        } catch (error) {
          console.error('Failed to delete ROPA session:', error);
          throw error;
        }
      }
}