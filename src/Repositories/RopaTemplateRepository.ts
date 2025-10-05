import { makeApiCall } from "../Helper/RepositoryHelper";
import type { IPreliminaryAnswerPayload, IPreliminaryQuestions, IRopaSession, IRopaSessionResponse } from "../Models/IRopaTemplate";

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

    static async createRopaSession(answer: IPreliminaryAnswerPayload): Promise<string> {
        try {
            const response =  await makeApiCall('/ropa/start-session', {
                method: 'POST',
                body: JSON.stringify(answer),
            }, true);

            const result = await response.json();
            const session_id = result.data.session_id;
            
            return session_id;
        } catch (error) {
            console.error('Failed to create a new ROPA session:', error);
            throw error;
        }
    }

    static async getRopaSessions(): Promise<IRopaSession[]> {
        try {
            const response = await makeApiCall('/ropa/sessions', {
                method: 'GET',
            }, true);
            const result: IRopaSessionResponse = await response.json();
            const sessions: IRopaSession[] = result.data.sessions;
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