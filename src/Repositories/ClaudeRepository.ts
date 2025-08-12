import { makeApiCall } from '../Helper/RepositoryHelper';

// Specific function for Claude API calls
export async function generateClaudeResponse(message: string): Promise<any> {
  try {
    const response = await makeApiCall('/claude/generate', {
      method: 'POST',
      body: JSON.stringify({ message })
    }, true);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}