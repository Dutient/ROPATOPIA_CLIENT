import React, { useState, useLayoutEffect } from 'react';
import './Styles.css';
import type { IQuestion } from '../../Models/IQuestion';
import { makeApiCall } from '../../Helper/RepositoryHelper';
import Breadcrumb from '../../Components/Breadcrumb';

const initialCheckboxes = [
  { label: 'Merchant Onboarding', checked: false },
  { label: 'HR', checked: false },
  { label: 'Promotional', checked: false },
  { label: 'Talent Acquisition', checked: false },
];

const QuestionairePage: React.FC = () => {
  const [checkboxes, setCheckboxes] = useState<{ label: string; checked: boolean }[]>([]);
  const [textBoxes, setTextBoxes] = useState<IQuestion[]>([
    { id: '1', question: '' }
  ]);

  useLayoutEffect(() => {
    (async () => {
      try {
        const response = await makeApiCall('/processing-activities');
        const data = await response.json();
        setCheckboxes(data);
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
    try {
      const activities = checkboxes.filter(cb => cb.checked).map(cb => cb.label);
      const response = await makeApiCall('/submit-questions', {
        method: 'POST',
        body: JSON.stringify({ questions: textBoxes, activities }),
      });
      if (response.ok) {
        alert('Questions submitted successfully!');
      } else {
        alert('Failed to submit questions.');
      }
    } catch (error) {
      alert('An error occurred while submitting questions.');
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
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default QuestionairePage;
