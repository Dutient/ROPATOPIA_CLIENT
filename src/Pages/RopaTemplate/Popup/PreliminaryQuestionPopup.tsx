import { useEffect, useState } from "react";
import { RopaTemplateRepository } from "../../../Repositories/RopaTemplateRepository";
import type { IPreliminaryQuestionPopupProps } from "./IPreliminaryQuestionPopupProps";
import "./Styles.css";
import { LoadingSpinner } from "../../../Components";
import type { IQuestionField } from "../../../Models/IRopaTemplate";



interface AnswerState {
    [questionId: string]: string;
}

const PreliminaryQuestionPopup: React.FC<IPreliminaryQuestionPopupProps> = ({ 
    onNext,
    isOpen,
    onClose
}) => {
    const [preliminaryQuestions, setPreliminaryQuestions] = useState<Record<string, IQuestionField>>({});
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    

    useEffect(() => {
        const fetchPreliminaryQuestions = async () => {
            try {
                setIsLoading(true);
                setError('');
                const response = await RopaTemplateRepository.getPreliminaryQuestions();
                
                if (!response.success) {
                    throw new Error('Failed to fetch preliminary questions');
                }
                
                setPreliminaryQuestions(response.data);
            } catch (err) {
                console.error('Error fetching preliminary questions:', err);
                setError('Failed to load questions. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreliminaryQuestions();
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateAnswers = (): boolean => {
        for (const key in preliminaryQuestions) {
            const field = preliminaryQuestions[key];
            if (field.required) {
                const value = answers[key];
                if (!value || String(value).trim() === '') {
                    setError(`Please answer the required question: "${field.question}"`);
                    return false;
                }
            }
        }
        
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateAnswers()) {
            return;
        }

        try {
            setSubmitting(true);

            console.log(answers);
            // Here you would typically send the answers to the server
            // For now, we'll just call onNext with a placeholder session_id
            const sessionId = `session_${Date.now()}`;
            onNext(sessionId);
        } catch (err) {
            console.error('Error submitting answers:', err);
            setError('Failed to submit answers. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestionInput = (id: string, field: IQuestionField) => {
        const value = answers[id] || '';
        const hasOptions = Array.isArray(field.options) && field.options.length > 0;
        
        if (!hasOptions) {
            return (
                <input
                    type="text"
                    className="question-input"
                    value={value}
                    onChange={(e) => handleAnswerChange(id, e.target.value)}
                    placeholder={field.placeholder ? field.placeholder : `Enter an answer`}
                />
            );
        }

        return (
            <select
                className="question-input"
                value={value}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                aria-label={`Select an option for ${id}`}
            >
                <option value="" disabled>{field.required ? 'Select an option (required)' : 'Select an option (optional)'}</option>
                {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        );
    };

    return (
        <>
        {isOpen && (
        <div className="preliminary-question-popup">
            <div className="popup-container">
                <div className="popup-header">
                    <button 
                        className="close-button" 
                        onClick={onClose}
                        aria-label="Close popup"
                    >
                        ×
                    </button>
                    <h2 className="popup-title">Preliminary Questions</h2>
                    <p className="popup-subtitle">
                        Please answer the following questions to help us understand your requirements better.
                    </p>
                </div>

                <div className="popup-content">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <div className="questions-list">
                                {Object.entries(preliminaryQuestions).map(([id, field]) => (
                                    <div key={id} className="question-item">
                                        <p className="popup-subtitle" style={{ marginTop: '6px' }}>{field.question}</p>
                                        {renderQuestionInput(id, field)}
                                    </div>
                                ))}
                            </div>
                            
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!isLoading && (
                    <div className="popup-footer">
                        <button 
                            className="next-button" 
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Next'}
                        </button>
                    </div>
                )}
            </div>
        </div>
        )}
        </>
    );
};

export default PreliminaryQuestionPopup;