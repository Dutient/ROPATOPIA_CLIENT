import { makeApiCall } from "../Helper/RepositoryHelper";

export class RopaTemplateRepository {
    
    static async getPreliminaryQuestions(): Promise<Response> {
        try {
            const response = await makeApiCall('/ropa/preliminary-questions', {
                method: 'GET',
            }, true);
            return response;
        } catch (error) {
            console.error('Failed to get preliminary questions:', error);
            throw error;
        }
    }
}