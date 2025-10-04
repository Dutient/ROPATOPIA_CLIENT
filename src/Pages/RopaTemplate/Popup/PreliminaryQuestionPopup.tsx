import { useEffect, useState } from "react";
import { RopaTemplateRepository } from "../../../Repositories/RopaTemplateRepository";
import type { IPreliminaryQuestionPopupProps } from "./IPreliminaryQuestionPopupProps";
import "./Styles.css";
import type { IQuestion } from "../../../Models/IQuestion";
import { LoadingSpinner } from "../../../Components";



interface AnswerState {
    [questionId: string]: string;
}

const PreliminaryQuestionPopup: React.FC<IPreliminaryQuestionPopupProps> = ({ 
    onNext 
}) => {
    const [preliminaryQuestions, setPreliminaryQuestions] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPreliminaryQuestions = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await RopaTemplateRepository.getPreliminaryQuestions();
            
            if (!response.ok) {
                throw new Error('Failed to fetch preliminary questions');
            }
            
            const data = await response.json();
            setPreliminaryQuestions(data.questions || []);
        } catch (err) {
            console.error('Error fetching preliminary questions:', err);
            setError('Failed to load questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPreliminaryQuestions();
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateAnswers = (): boolean => {
        for (const question of preliminaryQuestions) {
            if (!answers[question.id] || answers[question.id].trim() === '') {
                setError(`Please answer the required question: "${question.question}"`);
                return false;
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

    const renderQuestionInput = (id: string) => {
        const value = answers[id] || '';
        
        return (
            <input
                type="text"
                className="question-input"
                value={value}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                placeholder={`Please provide your answer for this question`}
            />
        );
    };

    return (
        <div className="preliminary-question-popup">
            <div className="popup-container">
                <div className="popup-header">
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
                                {preliminaryQuestions.map((question) => (
                                    <div key={question.id} className="question-item">
                                        <h3 className="question-text">
                                            {question.question}
                                        </h3>
                                        {renderQuestionInput(question.id)}
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

                {!isLoading && preliminaryQuestions.length > 0 && (
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
    );
};

export default PreliminaryQuestionPopup;