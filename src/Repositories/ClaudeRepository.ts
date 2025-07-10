import { makeApiCall } from '../Helper/RepositoryHelper';

// Specific function for Claude API calls
export async function generateClaudeResponse(message: string): Promise<any> {
  const response = await makeApiCall('/claude/generate', {
    method: 'POST',
    body: JSON.stringify({ message })
  });

  const result = response.json();

  return result;
}
