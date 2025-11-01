import { makeApiCall } from "../Helper/RepositoryHelper";
import type { IPreliminaryAnswerPayload, IPreliminaryQuestions, IRopaAddQuestionPayload, IRopaAnswer, IRopaQuestionResponse, IRopaSession, IRopaSessionResponse, IRopaSessionStatus } from "../Models/IRopaTemplate";

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

    static async getRopaQuestion(session_id: string, answered_only: boolean): Promise<IRopaQuestionResponse> {
        try {
            const response = await makeApiCall(`/ropa/session/${session_id}/questions?answered_only=${encodeURIComponent(answered_only)}`, {
                method: 'GET',
            }, true);

            const result: IRopaQuestionResponse = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to get ropa questions:', error);
            throw error;
        }
    }

    static async saveAnswer(payload: IRopaAnswer): Promise<Response> {
        try {
            const response = await makeApiCall('/ropa/save-answer', {
                method: 'POST',
                body: JSON.stringify(payload),
            }, true);

            return response;
        } catch (error) {
            console.error('Failed to save answer:', error);
            throw error;
        }
    }

    static async getSessionStatus(session_id: string): Promise<IRopaSessionStatus> {
        try {
            const payload = {
                session_id: session_id
            }
            
            const response = await makeApiCall('/ropa/session-status', {
                method: 'POST',
                body: JSON.stringify(payload),
            }, true);

            const result: IRopaSessionStatus = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to get status:', error);
            throw error;
        }
    }

    static async removeRopaQuestion(question_id: string, session_id: string): Promise<Response> {
        try {
            const payload = {
                session_id: session_id,
                question_id: question_id  
            }
            const response = await makeApiCall(`/ropa/remove-question`, {
                method: 'DELETE',
                body: JSON.stringify(payload),
            }, true);
            return response;
        } catch (error) {
            console.error('Failed to remove ROPA question:', error);
            throw error;
        }
    }

    static async generateROPA( session_id: string): Promise<Response> {
        try {
            const payload = {
                session_id: session_id,
                format_type: "json"
            }
            const response = await makeApiCall('/ropa/generate-document', {
                method: 'POST',
                body: JSON.stringify(payload),
            }, true);

            return response;
        } catch (error) {
            console.error('Failed to export ROPA session:', error);
            throw error;
        }
    }

    static async addRopaQuestion(payload: IRopaAddQuestionPayload): Promise<Response> {
        try {
            const response = await makeApiCall('/ropa/add-question', {
                method: 'POST',
                body: JSON.stringify(payload),
            }, true);

            return response;
        } catch (error) {
            console.error('Failed to add ROPA question:', error);
            throw error;
        }
    }
    
}