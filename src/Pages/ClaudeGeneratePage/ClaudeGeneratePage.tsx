import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateClaudeResponse } from '../../Repositories/ClaudeRepository';
import './Styles.css';

const ClaudeGeneratePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      // Use ClaudeRepository to make actual API call
      const response = await generateClaudeResponse(prompt);
      setGeneratedContent(response.content[0].text || JSON.stringify(response));
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedContent('');
  };

  return (
    <div className="claude-generate-page">
      <div className="header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>Claude AI Content Generator</h1>
      </div>

      <div className="main-content">
        <div className="input-section">
          <form onSubmit={handleSubmit} className="generate-form">
            <div className="form-group">
              <label htmlFor="prompt">What would you like to generate?</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate. For example: 'Write a blog post about artificial intelligence trends in 2024'"
                rows={6}
                className="prompt-input"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="generate-button"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </button>
              
              {generatedContent && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="clear-button"
                >
                  Clear All
                </button>
              )}
            </div>
          </form>
        </div>

        {generatedContent && (
          <div className="output-section">
            <div className="output-header">
              <h3>Generated Content</h3>
              <button onClick={handleCopy} className="copy-button">
                📋 Copy
              </button>
            </div>
            <div className="generated-content">
              <pre>{generatedContent}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="tips-section">
        <h3>💡 Tips for Better Results</h3>
        <ul>
          <li>Be specific about what you want to generate</li>
          <li>Include context and tone preferences</li>
          <li>Specify the desired length and format</li>
          <li>Provide examples or references if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default ClaudeGeneratePage; 