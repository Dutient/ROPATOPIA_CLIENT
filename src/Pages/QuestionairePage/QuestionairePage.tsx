import React, { useState } from 'react';
import type { IQuestion } from '../../Models/IQuestion';
import Swal, { type SweetAlertResult } from 'sweetalert2';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { GeneratePIARepository } from '../../Repositories/GeneratePIARepository';
import Breadcrumb from '../../Components/Breadcrumb';
import { useSearchParams } from 'react-router-dom';

const QuestionairePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const batch_id = searchParams.get('batch_id') || '';
    // Support multiple activities in the future, for now treat as array
    const activityParam = searchParams.get('activity');
    const activities = activityParam ? activityParam.split(',') : [];

    const [textBoxes, setTextBoxes] = useState<IQuestion[]>([
        { id: '1', question: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTextBoxChange = (index: number, value: string) => {
        setTextBoxes(prev =>
          prev.map((q, i) => (i === index ? { ...q, question: value } : q))
        );
      };
    
      const handleAddTextBox = () => {
        setTextBoxes(prev => {
          const newArr = [
            ...prev,
            { id: String(prev.length + 1), question: '' }
          ];
          return newArr;
        });
      };
    
      const handleRemoveTextBox = (index: number) => {
        setTextBoxes(prev => {
          if (prev.length <= 1) return prev;
          const filtered = prev.filter((_, i) => i !== index);
          // Reassign ids to be serial numbers after removal
          return filtered.map((q, i) => ({ ...q, id: String(i + 1) }));
        });
      };

      const handleSubmit = async () => {
        if (!batch_id || activities.length === 0) {
          alert('Please select a file and an activity.');
          return;
        }
        setIsSubmitting(true);
        try {
          const payload: BulkRetrieveRequest = {
            requests: textBoxes.map(textBox => ({
              batch_id: batch_id,
              query: textBox.question,
              processing_activity: activities
            }))
          };
          const response = await GeneratePIARepository.generatePia(payload);
          if (response.ok) {
            const result = await response.json();
            Swal.fire({
              title: 'Questions submitted successfully!',
              text: 'Do you want to show answers?',
              icon: 'success',
              showCancelButton: true,
              confirmButtonText: 'Yes, show answers',
              cancelButtonText: 'No',
            }).then((res: SweetAlertResult) => {
              if (res.isConfirmed) {
                console.log('API Response:', result); // Debug log
                const resultsArray = result.results || result; // Handle both {results: [...]} and [...] formats
                const questionsAndAnswers = textBoxes.map((textBox, index) => {
                  // Add safety checks for result structure
                  if (!Array.isArray(resultsArray)) {
                    console.error('Results is not an array:', resultsArray);
                    return `**Question ${index + 1}:** ${textBox.question}\n\n**Answer:**\nError: Unexpected response format\n\n`;
                  }
                  
                  if (!resultsArray[index]) {
                    console.error(`No result found for index ${index}:`, resultsArray);
                    return `**Question ${index + 1}:** ${textBox.question}\n\n**Answer:**\nNo answer available\n\n`;
                  }
                  
                  const answer = resultsArray[index].answer || 'No answer available';
                  return `**Question ${index + 1}:** ${textBox.question}\n\n**Answer:**\n${answer}\n\n`;
                }).join('---\n\n');
    
                // Create a custom component for markdown rendering
                const MarkdownContent = () => (
                  <div style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto' }}>
                    <ReactMarkdown>{questionsAndAnswers}</ReactMarkdown>
                  </div>
                );
    
                Swal.fire({
                  title: 'Answers',
                  html: ReactDOMServer.renderToString(<MarkdownContent />),
                  width: 700,
                  customClass: { popup: 'swal2-answers-popup' },
                  confirmButtonText: 'Close'
                });
              }
            });
          } else {
            Swal.fire('Failed to submit questions.', '', 'error');
          }
        } catch (error) {
          Swal.fire('An error occurred while submitting questions.', '', 'error');
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="questions-section">
            <Breadcrumb paths={[
                { name: 'Home', href: '/' },
                { name: 'Upload', href: '/upload' },
                { name: 'Activity', href: `/activity?batch_id=${batch_id}` },
                { name: 'Questionaire', href: '/questionaire' }
            ]} />
          <h3 className="section-heading">Questions</h3>
          {textBoxes.map((_, idx) => (
            <div key={idx} className="question-row">
              <span className="question-index">{idx + 1}.</span>
              <input
                type="text"
                value={textBoxes[idx].question}
                onChange={e => handleTextBoxChange(idx, e.target.value)}
                placeholder={`Enter question ${idx + 1}`}
                className="question-input"
              />
              {textBoxes.length > 1 && (
                <button
                  onClick={() => handleRemoveTextBox(idx)}
                  className="remove-question-btn"
                  aria-label="Remove question"
                  title="Remove question"
                >
                  ×
                </button>
              )}
              {idx === textBoxes.length - 1 && (
                <button
                  onClick={handleAddTextBox}
                  className="add-question-btn"
                  aria-label="Add question"
                  title="Add question"
                >
                  ＋
                </button>
              )}
            </div>
          ))}
          <button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner"></span>
          ) : (
            'Submit'
          )}
        </button>
        </div>
    )
};

export default QuestionairePage
