import { makeApiCall } from '../Helper/RepositoryHelper';
import type { Knowledge_Item, knowledge_text } from '../Models/IKnowledge';

export class KnowledgeRepository {
    static async fetchKnowledgeBySession(session_id: string): Promise<{ knowledge_items: Knowledge_Item[] }>
    {
        try {
            const response = await makeApiCall(`/session/${session_id}/knowledge`, {
              method: 'GET',
            }, true);
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('Failed to fetch knowledge items by session id:', error);
             throw error;
        }
    }

    static async addKnowledgeText(session_id: string, payload: knowledge_text): Promise<Knowledge_Item> {
        try {
            const response = await makeApiCall(`/session/${session_id}/knowledge/text`, {
              method: 'POST',
              body: JSON.stringify(payload)
            }, true);
        
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('Claude API call failed:', error);
              throw error;
        }  
    }

    static async addKnowledgeFile(session_id: string, file: File): Promise<Knowledge_Item> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await makeApiCall(`/session/${session_id}/knowledge/file`, {
              method: 'POST',
              body: formData
            }, true);
        
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('Failed to upload knowledge file:', error);
              throw error;
        }  
    }

    static async updateKnowledgeText(session_id: string, knowledge_id: string, payload: knowledge_text): Promise<Knowledge_Item> {
        try {
            const response = await makeApiCall(`/session/${session_id}/knowledge/${knowledge_id}`, {
              method: 'PUT',
              body: JSON.stringify(payload)
            }, true);
        
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('Failed to update knowledge text:', error);
              throw error;
        }  
    }

    static async deleteKnowledge(session_id: string, knowledge_id: string): Promise<void> {
        try {
            const response = await makeApiCall(`/session/${session_id}/knowledge/${knowledge_id}`, {
              method: 'DELETE'
            }, true);
        
            // For delete operations, we typically don't need to return the response body
            if (!response.ok) {
                throw new Error(`Failed to delete knowledge item: ${response.status} ${response.statusText}`);
            }
          } catch (error) {
            console.error('Failed to delete knowledge item:', error);
              throw error;
        }  
    }
}