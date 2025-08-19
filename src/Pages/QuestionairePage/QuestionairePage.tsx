import React, { useState, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratePIARepository } from '../../Repositories/GeneratePIARepository';
import Spinner from '../../Components/Spinner/Spinner';
import './Styles.css';
import * as XLSX from 'xlsx-js-style';
import type { RetrieveRequest } from '../../Models/IPiaPayload';
import { SessionRepository } from '../../Repositories/SessionRepository';
import type { IChat } from '../../Models/IChat';
import { FaPlay } from 'react-icons/fa'; // Import run/play icon
import type { IChatLight } from '../../Models/IChatLight';
import { LoadingSpinner } from '../../Components';
import { FaHistory } from 'react-icons/fa'; // Import history icon
import Swal from 'sweetalert2';
import ReactDOMServer from 'react-dom/server';

const QuestionairePage: React.FC<{ sessionId: string }> = ({ sessionId }) => {

    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
    const [editMode, setEditMode] = useState(false);
    const [latestChats, setLatestChats] = useState<IChatLight[]>([]);
    const [chatHistory, setChatHistory] = useState<{ [key: string]: IChat[] }>({});
    const [loadingAnswers, setLoadingAnswers] = useState<Set<string>>(new Set()); // Track loading states for specific questions
    const [isLoading, setIsLoading] = useState(true); // Track loading state for the page

    const getLatestChats = async (sessionId: string) => {
            const response = await SessionRepository.getSessionChat(sessionId);
            if (response.ok) {
                const items = await response.json();
                const chats: IChat[] = items.chats || [];
                if (chats.length > 0) {
                    // Create a dictionary mapping chats by question_id
                    const chatDictionary = chats.reduce((acc, chat) => {
                        if (!acc[chat.question_id]) {
                            acc[chat.question_id] = [];
                        }
                        acc[chat.question_id].push(chat);
                        return acc;
                    }, {} as { [key: string]: IChat[] });

                    setChatHistory(chatDictionary);

                    // Loop through the dictionary and get the latest question and answer
                    return Object.entries(chatDictionary).map(([question_id, chatList]) => {
                        const latestChat = chatList.reduce((latest, current) =>
                            new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
                        );
                        return {
                            question_id,
                            question: latestChat.question,
                            answer: latestChat.answer
                        };
                    });
                }
            }
            return new Array<IChatLight>(); // Return an empty array if no chats are found
    };

    useLayoutEffect(() => {
        (async () => {
            setIsLoading(true);
            const latestChatsData = await getLatestChats(sessionId);
            setLatestChats(latestChatsData);
            setIsLoading(false);
        })();
    }, [sessionId]);

    const toggleDropdown = (id: string) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAdd = () => {
        setLatestChats(prev => [
            ...prev,
            {
                question_id: "", // Use a unique ID based on timestamp
                question: '',
                answer: ''
            }
        ]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, question_id: string) => {
        setLatestChats(prev =>
            prev.map(chat =>
                chat.question_id === question_id ? { ...chat, question: e.target.value } : chat
            )
        );
    }

    const handleEdit = () => {
        setOpenDropdowns({}); // Close all dropdowns when entering edit mode
        setEditMode(prev => {
            const newEditMode = !prev;
            if (!newEditMode) {
                // Reload the latest chats when editing is done
                (async () => {
                    setIsLoading(true);
                    const latestChatsData = await getLatestChats(sessionId);
                    setLatestChats(latestChatsData);
                    setIsLoading(false);
                })();
            }
            return newEditMode;
        });
    };

    const getAnswerForQuestion = async (question_id: string, query: string) => {
        const payload: RetrieveRequest = {
            query: query,
            session_id: sessionId,
            question_id: question_id || "",
        };
        const response = await GeneratePIARepository.generatePia(payload);
        if (response.ok) {
            const result: IChatLight = await response.json();
            return { question_id: result.question_id, answer: result.answer };
        } else {
            return { question_id, answer: `Failed to retrieve answer for question ${question_id}` };
        }
    };

    const handleRun = async (chat: IChatLight) => {
        setLoadingAnswers(prev => new Set([...prev, chat.question_id])); // Mark question as loading
        const result = await getAnswerForQuestion(chat.question_id, chat.question);
        setLatestChats(prev =>
            prev.map(c =>
                c.question_id === chat.question_id ? { ...c, question_id: result.question_id, answer: result.answer } : c
            )
        );      
        setLoadingAnswers(prev => {
            const newSet = new Set(prev);
            newSet.delete(chat.question_id); // Remove question from loading state
            return newSet;
        });
        setOpenDropdowns(prev => ({ ...prev, [result.question_id]: true }));
    }

    const handleRemove = (question_id: string) => {
        setLatestChats(prev =>
            prev.filter(chat => chat.question_id !== question_id)
        );
        setOpenDropdowns(prev => {
            const newOpen = { ...prev };
            delete newOpen[question_id]; // Remove the dropdown state for the removed question
            return newOpen;
        });
    }

    const handleDownload = () => {
        const items = latestChats.map((q, _) => ({
            Question: q.question,
            Answer: q.answer || '' // Export as raw Markdown
        }));

        const worksheet = XLSX.utils.json_to_sheet(items);

        // Dynamic column widths with max for Answer column
        const getMaxWidth = (arr: string[]) =>
            Math.max(...arr.map(str => (str ? str.length : 0)), 10);

        const questionColWidth = getMaxWidth(latestChats.map(q => q.question));
        const maxAnswerColWidth = 100;
        const answerColWidth = Math.min(getMaxWidth(latestChats.map(q => q.answer)), maxAnswerColWidth);

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

    const handleHistory = (question_id: string) => {
        const history = chatHistory[question_id] || [];
        if (history.length === 0) {
            Swal.fire({
                title: 'No History Found',
                text: 'There is no history available for this question.',
                icon: 'info',
            });
            return;
        }

        const MarkdownContent = () => (
          <div style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto' }}>
            {history.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                }}
              >
                <strong style={{ color: '#333' }}>Question: {item.question}</strong>
                <br></br>
                <strong style={{ color: '#333', marginTop: '10px' }}>Answer:</strong>
                <div style={{ marginTop: '5px', color: '#555' }}>
                  <ReactMarkdown>{item.answer || 'No answer available'}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        );

        Swal.fire({
            title: '<strong>History</strong>',
            html: ReactDOMServer.renderToString(<MarkdownContent />),
            width: '800px',
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Close',
            customClass: {
                popup: 'history-swal-popup',
            },
        });
    }

    if (isLoading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="questions-section">
            <div className="title-edit-container">
                <h3 className='questions-title'>PIA</h3>
                <button
                    className="edit-btn"
                    onClick={handleEdit}
                >
                    {editMode ? 'Done' : 'Edit'}
                </button>
            </div>
            {latestChats.map((chat, idx) => (
                <div key={chat.question_id} className="question-container">
                    <div className="question-row">
                        <span className="question-index">{idx + 1}.</span>
                        <div className="question-content-wrapper">
                            <div className="question-content">
                                <input
                                    type="text"
                                    value={chat.question}
                                    onChange={(e) => handleChange(e, chat.question_id)}
                                    readOnly={!editMode}
                                    placeholder="Enter your question here"
                                    className="question-input"
                                />
                            </div>
                            {openDropdowns[chat.question_id] && (
                                <div className="answer-dropdown">
                                    <strong>Answer:</strong>
                                    <div style={{ marginTop: 4 }}>
                                        {chat.answer ? (
                                            <ReactMarkdown>{chat.answer}</ReactMarkdown>
                                        ) : (
                                            <em>No answer available.</em>
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
                                onClick={() => toggleDropdown(chat.question_id)}
                            >
                                {openDropdowns[chat.question_id] ? '▶' : '▼'}
                            </button>

                            {editMode && (
                                <button
                                    type="button"
                                    className="run-btn"
                                    aria-label="Run to get answer"
                                    title="Run to get answer"
                                    disabled={!editMode || loadingAnswers.has(chat.question_id)}
                                    onClick={() => handleRun(chat)}
                                >
                                    {loadingAnswers.has(chat.question_id) ? <Spinner size={16} /> : <FaPlay />}
                                </button>
                            )}

                            {editMode && latestChats.length > 1 && (
                                <button
                                    onClick={() => handleRemove(chat.question_id)}
                                    className="remove-question-btn"
                                    aria-label="Remove question"
                                    title="Remove question"
                                >
                                    ×
                                </button>
                            )}

                            {!editMode && (
                                <button
                                    type="button"
                                    className="history-btn"
                                    aria-label="View history"
                                    title="View history"
                                    onClick={() => handleHistory(chat.question_id)} 
                                >
                                    <FaHistory />
                                </button>
                            )}
                        </div>
                    </div>  
                </div>
            ))}
            {editMode && (
                <button
                    onClick={handleAdd}
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
                        className="download-btn"
                        onClick={handleDownload}
                        style={{ marginLeft: 8 }}
                        disabled={latestChats.length === 0}
                    >
                        Download Q&A
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionairePage;