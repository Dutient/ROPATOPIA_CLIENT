import React, { useState, useLayoutEffect } from 'react';
import './Styles.css';
import type { IQuestion } from '../../Models/IQuestion';
import Breadcrumb from '../../Components/Breadcrumb';
import { useSearchParams } from 'react-router-dom';
import { ProcessingActivityRepository } from '../../Repositories/ProcessingActivityRepository';
import { GeneratePIARepository } from '../../Repositories/GeneratePIARepository';
import Swal from 'sweetalert2';
import type { SweetAlertResult } from 'sweetalert2';
import ReactMarkdown from 'react-markdown';
import ReactDOMServer from 'react-dom/server';

const initialCheckboxes = [
  { label: 'Sample Activity', checked: false },
];

const AcitivityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const batch_id = searchParams.get('batch_id');
  const [checkboxes, setCheckboxes] = useState<{ label: string; checked: boolean }[]>([]);
  const [textBoxes, setTextBoxes] = useState<IQuestion[]>([
    { id: '1', question: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useLayoutEffect(() => {
    (async () => {
      try {
        if (!batch_id) {
          alert('File is not selected. Please upload a file first.');
          return;
        }
        const data = await ProcessingActivityRepository.fetchActivitiesByBatchId(batch_id);
        setCheckboxes(data.processing_activities.map(activity => ({ label: activity, checked: false })));
      } catch (error) {
        setCheckboxes(initialCheckboxes);
      }
    })();
  }, []);

  const handleCheckboxChange = (index: number) => {
    setCheckboxes(prev =>
      prev.map((cb, i) =>
        i === index ? { ...cb, checked: !cb.checked } : cb
      )
    );
  };

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
    if (!batch_id) {
      alert('File is not selected. Please upload a file first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const activities = checkboxes.filter(cb => cb.checked).map(cb => cb.label);
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
    <div className="questionnaire-page">
      <Breadcrumb paths={[
        { name: 'Home', href: '/' },
        { name: 'Upload', href: '/upload' },
        { name: 'Questionnaire', href: '/questionnaire' }
      ]} />
      <div className="questionnaire-container">
        {/* Left: Checkboxes */}
        <div className="checkboxes-section">
          <h3>Processing Activities</h3>
          {checkboxes.map((cb, idx) => (
            <div key={cb.label} className="checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={cb.checked}
                  onChange={() => handleCheckboxChange(idx)}
                />
                {cb.label}
              </label>
            </div>
          ))}
        </div>
        {/* Right: Dynamic Text Boxes */}
        <div className="questions-section">
          <h3>Questions</h3>
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
        </div>
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
    </div>
  );
};

export default AcitivityPage;
