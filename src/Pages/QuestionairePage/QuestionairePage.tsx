import React, { useState, useLayoutEffect, useEffect } from 'react';
import type { IQuestion } from '../../Models/IQuestion';
import ReactMarkdown from 'react-markdown';
import { GeneratePIARepository } from '../../Repositories/GeneratePIARepository';
import Breadcrumb from '../../Components/Breadcrump/Breadcrumb';
import Spinner from '../../Components/Spinner/Spinner';
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
    const [answers, setAnswers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
    const [editMode, setEditMode] = useState(false);
    const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);

    const toggleDropdown = (id: string) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useLayoutEffect(() => {
        (async () => {
            try {
                // Only set if still default (not user-modified)
                setTextBoxes(prev => {
                    if (prev.length === 1 && prev[0].question === '') {
                        setShouldAutoSubmit(true);
                        return [
                            { id: '1', question: 'What is the purpose of this processing activity?' },
                            { id: '2', question: 'What categories of personal data are involved?' },
                            { id: '3', question: 'Who are the data subjects?' },
                            { id: '4', question: 'What are the sources of the personal data?' },
                            { id: '5', question: 'Who will have access to the data?' },
                            { id: '6', question: 'How long will the data be retained?' },
                            { id: '7', question: 'What security measures are in place to protect the data?' }
                        ];
                    }
                    return prev;
                });
            } catch (error) {
                // Optionally log or handle error
                console.error('Error in useLayoutEffect:', error);
            }
        })();
    }, []);

    useEffect(() => {
        if (shouldAutoSubmit) {
            setShouldAutoSubmit(false);
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldAutoSubmit, textBoxes]);

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

    const handleEdit = () => {
      setEditMode(prev => {
        const newEditMode = !prev;
        if (newEditMode) {
          setOpenDropdowns({}); // Close all dropdowns when entering edit mode
          setAnswers([]); // Clear all answers when entering edit mode
        }
        return newEditMode;
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
                const resultsArray = result.results || result;
                // Map answers to question ids
                if (Array.isArray(resultsArray)) {
                  const newAnswers = resultsArray.map(result => result.answer || 'No answer available');
                  setAnswers(newAnswers);
                }
            } else {
                alert('Failed to submit questions.');
            }
        } catch (error) {
            alert('An error occurred while submitting questions.');
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
            <button
                className="edit-btn"
                style={{ marginBottom: 16 }}
                onClick={handleEdit}
            >
                {editMode ? 'Done' : 'Edit'}
            </button>
            <h3>Questions</h3>
            {textBoxes.map((q, idx) => (
                <div key={q.id} className="question-row-with-dropdown">
                    <div className="question-row">
                        <span className="question-index">{idx + 1}.</span>
                        <input
                            type="text"
                            value={q.question}
                            onChange={e => editMode && handleTextBoxChange(idx, e.target.value)}
                            placeholder={`Enter question ${idx + 1}`}
                            className="question-input"
                            readOnly={!editMode}
                        />
                        <button
                            type="button"
                            className="dropdown-btn"
                            aria-label="Show answer"
                            title="Show answer"
                            onClick={() => toggleDropdown(q.id)}
                            style={{ marginLeft: 8 }}
                            disabled={editMode || isSubmitting}
                        >
                            {openDropdowns[q.id] ? '▶' : '▼'}
                        </button>
                        {editMode && textBoxes.length > 1 && (
                            <button
                                onClick={() => handleRemoveTextBox(idx)}
                                className="remove-question-btn"
                                aria-label="Remove question"
                                title="Remove question"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {openDropdowns[q.id] && (
                        <div className="answer-dropdown" style={{ marginLeft: 32, marginTop: 4, marginBottom: 8, background: '#f5f7fa', borderRadius: 4, padding: 12 }}>
                            <strong>Answer:</strong>
                            <div style={{ marginTop: 4 }}>
                                {answers[idx] ? (
                                    <ReactMarkdown>{answers[idx]}</ReactMarkdown>
                                ) : (
                                    <em>No answer available. Submit to get answer.</em>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {editMode && (
                <button
                    onClick={handleAddTextBox}
                    className="add-question-btn add-question-btn-bottom"
                    aria-label="Add question"
                    title="Add question"
                    style={{ marginTop: '16px', display: 'block', marginLeft: 'auto', marginRight: 0 }}
                >
                    ＋
                </button>
            )}
            <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || editMode}
            >
                {isSubmitting ? (
                    <Spinner size={24} />
                ) : (
                    'Submit'
                )}
            </button>
        </div>
    );
};

export default QuestionairePage;
