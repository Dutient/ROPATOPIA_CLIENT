import React, { useState, useLayoutEffect, useEffect } from 'react';
import type { IQuestion } from '../../Models/IQuestion';
import ReactMarkdown from 'react-markdown';
import { GeneratePIARepository } from '../../Repositories/GeneratePIARepository';
import Breadcrumb from '../../Components/Breadcrump/Breadcrumb';
import Spinner from '../../Components/Spinner/Spinner';
import { useSearchParams } from 'react-router-dom';
import './Styles.css';
import * as XLSX from 'xlsx-js-style';

const QuestionairePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const batch_id = searchParams.get('batch_id') || '';
    // Support multiple activities in the future, for now treat as array
    const activityParam = searchParams.get('activity');
    const activities = activityParam ? activityParam.split(',') : [];

    const [textBoxes, setTextBoxes] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingQuestions, setProcessingQuestions] = useState<Set<number>>(new Set());
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
                    if (prev.length === 0) {
                        setShouldAutoSubmit(true);
                        return [
                            { id: '1', question: 'Does the processing operation involve personal data?' },
                            { id: '2', question: 'Does the processing operation involve sensitive/special category personal data?' },
                            { id: '3', question: 'Does the processing operation involve evaluation and scoring of Data Subject?' },
                            { id: '4', question: 'Does the processing operation involve automated means?' },
                            { id: '5', question: 'Does the processing operation involve processing of systematic activity of the data principal?' },
                            { id: '6', question: 'Does the processing operation involve use of new technological solutions?' },
                            { id: '7', question: 'Does the processing operation involve processing of data pertaining to vulnerable data principals?' }
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
        // Initialize answers array with empty strings
        setAnswers(new Array(textBoxes.length).fill(''));
        setProcessingQuestions(new Set());
        
        try {
            // Loop through each textbox and call generatePia individually
            for (let i = 0; i < textBoxes.length; i++) {
                const textBox = textBoxes[i];
                const payload: RetrieveRequest = {
                    batch_id: batch_id,
                    query: textBox.question,
                    processing_activity: activities
                };
                
                // Mark this question as being processed
                setProcessingQuestions(prev => new Set([...prev, i]));
                
                let response: Response | undefined;
                try {
                    response = await GeneratePIARepository.generatePia(payload);
                    if (response.ok) {
                        const result = await response.json();
                        const answer = result.answer || 'No answer available';
                        // Update answers state immediately for this question
                        setAnswers(prev => {
                            const newAnswers = [...prev];
                            newAnswers[i] = answer;
                            return newAnswers;
                        });
                    } else {
                        setAnswers(prev => {
                            const newAnswers = [...prev];
                            newAnswers[i] = 'Failed to get answer for this question.';
                            return newAnswers;
                        });
                    }
                } catch (error) {
                    console.error(`Error processing question ${i + 1}:`, error);
                    setAnswers(prev => {
                        const newAnswers = [...prev];
                        newAnswers[i] = 'Error occurred while processing this question.';
                        return newAnswers;
                    });
                } finally {
                    // Remove this question from processing set
                    setProcessingQuestions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(i);
                        return newSet;
                    });
                    
                    // Only toggle dropdown if answer was successful (after processing is complete)
                    if (response?.ok) {
                        setOpenDropdowns(prev => ({ ...prev, [textBox.id]: !prev[textBox.id] }));
                    }
                }
            }
        } catch (error) {
            alert('An error occurred while submitting questions.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = () => {
        const data = textBoxes.map((q, idx) => ({
            Question: q.question,
            Answer: answers[idx] || '' // Export as raw Markdown
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Dynamic column widths with max for Answer column
        const getMaxWidth = (arr: string[]) =>
            Math.max(...arr.map(str => (str ? str.length : 0)), 10);

        const questionColWidth = getMaxWidth(textBoxes.map(q => q.question));
        const maxAnswerColWidth = 100;
        const answerColWidth = Math.min(getMaxWidth(answers), maxAnswerColWidth);

        worksheet['!cols'] = [
            { wch: questionColWidth },
            { wch: answerColWidth }
        ];

        // Enable text wrapping for all cells and style header row
        const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
        for (let C = range.s.c; C <= range.e.c; ++C) {
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
                if (!worksheet[cell_address]) continue;
                if (R === 0) {
                    // Header row: green background
                    worksheet[cell_address].s = {
                        fill: { fgColor: { rgb: '90EE90' } }, // Light green
                        font: { bold: true },
                        alignment: { wrapText: true, vertical: "top", horizontal: "left" }
                    };
                } else {
                    worksheet[cell_address].s = {
                        alignment: { wrapText: true, vertical: "top" }
                    };
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Q&A");
        XLSX.writeFile(workbook, "questions_and_answers.xlsx");
    };

    return (
        <div className="questions-section">
            <Breadcrumb paths={[
                { name: 'Home', href: '/' },
                { name: 'Upload', href: '/upload' },
                { name: 'Activity', href: `/activity?batch_id=${batch_id}` },
                { name: 'Questionaire', href: '/questionaire' }
            ]} />
            <div className="title-edit-container">
                <h3 className='questions-title'>Questions</h3>
                <button
                    className="edit-btn"
                    onClick={handleEdit}
                >
                    {editMode ? 'Done' : 'Edit'}
                </button>
            </div>
            {textBoxes.map((q, idx) => (
                <div key={q.id} className="question-container">
                    <div className="question-row">
                        <span className="question-index">{idx + 1}.</span>
                        <div className="question-content-wrapper">
                            <div className="question-content">
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={e => editMode && handleTextBoxChange(idx, e.target.value)}
                                    placeholder={`Enter question ${idx + 1}`}
                                    className="question-input"
                                    readOnly={!editMode}
                                />
                            </div>
                            {openDropdowns[q.id] && (
                                <div className="answer-dropdown">
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
                        <div className="question-actions">
                            <button
                                type="button"
                                className="dropdown-btn"
                                aria-label="Show answer"
                                title="Show answer"
                                onClick={() => toggleDropdown(q.id)}
                                disabled={editMode || processingQuestions.has(idx)}
                            >
                                {processingQuestions.has(idx) ? (
                                    <Spinner size={24} />
                                ) : (
                                    openDropdowns[q.id] ? '▶' : '▼'
                                )}
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
                    </div>
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
            
            {!editMode && (
                <div>
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
                    <button
                        className="download-btn"
                        onClick={handleDownload}
                        style={{ marginLeft: 8 }}
                        disabled={textBoxes.length === 0 || answers.length === 0 || isSubmitting}
                    >
                        Download Q&A
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionairePage;
