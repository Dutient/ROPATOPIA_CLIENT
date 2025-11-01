import { useEffect, useMemo, useState } from "react";
import type { IRopaQuestionairePageProps } from "./IRopaQuestionairePageProps";
import { RopaTemplateRepository } from "../../../Repositories/RopaTemplateRepository";
import type { IRopaAddQuestionPayload, IRopaAnswer, IRopaQuestion, IRopaSessionStatus } from "../../../Models/IRopaTemplate";
import { LoadingSpinner } from "../../../Components";
import "./Styles.css";
import { FaPlus } from "react-icons/fa";

const RopaQuestionairePage: React.FC<IRopaQuestionairePageProps> = ({ sessionId }) => {
	const [questions, setQuestions] = useState<IRopaQuestion[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>("");
	const [answeredOnly, setAnsweredOnly] = useState<boolean>(false);
	const [originalAnswers, setOriginalAnswers] = useState<Record<string, string>>({});
	const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
	const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
	const [saving, setSaving] = useState<boolean>(false);
	const [status, setStatus] = useState<IRopaSessionStatus | null>(null);
	const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
	const [showAddQuestionPopup, setShowAddQuestionPopup] = useState<boolean>(false);
	const [addingQuestion, setAddingQuestion] = useState<boolean>(false);
	const [addQuestionError, setAddQuestionError] = useState<string>("");
	const [addQuestionForm, setAddQuestionForm] = useState({
		question: "",
		question_type: "text",
		category: "",
		help_text: "",
		required: false,
		optionsText: ""
	});

	const fetchQuestions = async () => {
		try {
			setLoading(true);
			setError("");
			const result = await RopaTemplateRepository.getRopaQuestion(sessionId, answeredOnly);
			if (!result.success) {
				throw new Error(result.message || "Failed to fetch questions");
			}
			const fetched = result.data.questions || [];
			const filtered = !answeredOnly ? fetched.filter(q => !q.is_answered) : fetched;
			setQuestions(filtered);
			const orig: Record<string, string> = {};
			const curr: Record<string, string> = {};
			for (const q of filtered) {
				const ans = q.answer ?? "";
				orig[q.id] = ans;
				curr[q.id] = ans;
			}
			setOriginalAnswers(orig);
			setCurrentAnswers(curr);
			setChangedIds(new Set());
		} catch (e: any) {
			setError(e?.message || "Failed to load questions");
		} finally {
			setLoading(false);
		}
	};

	const fetchStatus = async () => {
		try {
			const s = await RopaTemplateRepository.getSessionStatus(sessionId);
			if (s && s.success) {
				setStatus(s);
			}
		} catch (e) {
			// ignore status errors
		}
	};

	useEffect(() => {
		fetchQuestions();
		fetchStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, answeredOnly]);

	const handleToggleAnswered = () => {
		setAnsweredOnly(prev => !prev);
	};

	const resetAddQuestionForm = () => {
		setAddQuestionForm({
			question: "",
			question_type: "text",
			category: "",
			help_text: "",
			required: false,
			optionsText: ""
		});
		setAddQuestionError("");
	};

	const handleOpenAddQuestion = () => {
		resetAddQuestionForm();
		setShowAddQuestionPopup(true);
	};

	const handleCloseAddQuestion = () => {
		setShowAddQuestionPopup(false);
	};

	const handleAddQuestionChange = (field: "question" | "question_type" | "category" | "help_text" | "required" | "optionsText", value: string | boolean) => {
		setAddQuestionForm(prev => ({
			...prev,
			[field]: value
		}));
	};

	const parseOptions = (optionsText: string): string[] => {
		return optionsText
			.split(/\r?\n|,/)
			.map(opt => opt.trim())
			.filter(opt => opt.length > 0);
	};

	const handleSubmitAddQuestion = async () => {
		const trimmedQuestion = addQuestionForm.question.trim();
		const trimmedCategory = addQuestionForm.category.trim();
		const trimmedHelpText = addQuestionForm.help_text.trim();
		if (!trimmedQuestion) {
			setAddQuestionError("Question text is required.");
			return;
		}
		if (!trimmedCategory) {
			setAddQuestionError("Category is required.");
			return;
		}
		let options: string[] = [];
		if (addQuestionForm.question_type === "multi_select") {
			options = parseOptions(addQuestionForm.optionsText);
			if (options.length === 0) {
				setAddQuestionError("Provide at least one option for multi select questions.");
				return;
			}
		}
		const payload: IRopaAddQuestionPayload = {
			session_id: sessionId,
			question: trimmedQuestion,
			question_type: addQuestionForm.question_type,
			category: trimmedCategory,
			help_text: trimmedHelpText,
			required: addQuestionForm.required,
			options
		};
		try {
			setAddingQuestion(true);
			setAddQuestionError("");
			await RopaTemplateRepository.addRopaQuestion(payload);
			setShowAddQuestionPopup(false);
			resetAddQuestionForm();
			fetchQuestions();
			fetchStatus();
		} catch (e: any) {
			setAddQuestionError(e?.message || "Failed to add question. Please try again.");
		} finally {
			setAddingQuestion(false);
		}
	};

	const markChangeIfNeeded = (id: string, nextValue: string) => {
		setCurrentAnswers(prev => ({ ...prev, [id]: nextValue }));
		setChangedIds(prev => {
			const next = new Set(prev);
			if ((originalAnswers[id] ?? "") !== nextValue) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	};

	const handleTextareaChange = (id: string, value: string) => {
		markChangeIfNeeded(id, value);
	};

	const handleBooleanChange = (id: string, value: boolean) => {
		markChangeIfNeeded(id, value ? "Yes" : "No");
	};

	const handleMultiSelectAdd = (id: string, option: string) => {
		if (!option) return;
		const current = currentAnswers[id] ? currentAnswers[id].split(",").map(s => s.trim()).filter(Boolean) : [];
		if (current.includes(option)) return;
		const nextValue = [...current, option].join(",");
		markChangeIfNeeded(id, nextValue);
	};

	const handleMultiSelectRemove = (id: string, option: string) => {
		const current = currentAnswers[id] ? currentAnswers[id].split(",").map(s => s.trim()).filter(Boolean) : [];
		const nextValue = current.filter(o => o !== option).join(",");
		markChangeIfNeeded(id, nextValue);
	};

	const changedQuestions = useMemo(() => {
		return questions.filter(q => changedIds.has(q.id));
	}, [questions, changedIds]);

	const handleSave = async () => {
		if (changedIds.size === 0) return;
		try {
			setSaving(true);
			const payloads: IRopaAnswer[] = changedQuestions.map(q => ({
				session_id: sessionId,
				question_id: q.id,
				other_text: q.other_text ?? null,
				answer: currentAnswers[q.id] ?? "",
				category: q.category,
			}));
			await Promise.all(payloads.map(p => RopaTemplateRepository.saveAnswer(p)));
			// After successful save, reset originals and changed set
			const nextOriginals = { ...originalAnswers };
			for (const q of changedQuestions) {
				nextOriginals[q.id] = currentAnswers[q.id] ?? "";
			}
			setOriginalAnswers(nextOriginals);
			setChangedIds(new Set());
			fetchQuestions();
			fetchStatus();
		} catch (e) {
			console.error("Failed to save answers", e);
		} finally {
			setSaving(false);
		}
	};

	const handleRemoveQuestion = async (questionId: string) => {
		try {
			setRemovingIds(prev => {
				const next = new Set(prev);
				next.add(questionId);
				return next;
			});
			await RopaTemplateRepository.removeRopaQuestion(questionId, sessionId);
			setQuestions(prev => prev.filter(q => q.id !== questionId));
			setOriginalAnswers(prev => {
				const next = { ...prev };
				delete next[questionId];
				return next;
			});
			setCurrentAnswers(prev => {
				const next = { ...prev };
				delete next[questionId];
				return next;
			});
			setChangedIds(prev => {
				const next = new Set(prev);
				next.delete(questionId);
				return next;
			});
			setError("");
			fetchStatus();
		} catch (e: any) {
			console.error("Failed to remove question", e);
			setError(e?.message || "Failed to remove question");
		} finally {
			setRemovingIds(prev => {
				const next = new Set(prev);
				next.delete(questionId);
				return next;
			});
		}
	};

	const renderInput = (q: IRopaQuestion) => {
		const value = (currentAnswers[q.id] ?? (q.answer ?? ""));
		switch ((q.type || "").toLowerCase()) {
			case "textarea":
				return (
					<textarea
						className="rq-textarea"
						value={value}
						onChange={(e) => handleTextareaChange(q.id, e.target.value)}
						rows={4}
					/>
				);
			case "boolean":
				return (
					<div className="rq-boolean">
						<label className={`rq-toggle ${value === "Yes" ? "active" : ""}`}>
							<input type="radio" name={`bool-${q.id}`} checked={value === "Yes"} onChange={() => handleBooleanChange(q.id, true)} />
							Yes
						</label>
						<label className={`rq-toggle ${value === "No" ? "active" : ""}`}>
							<input type="radio" name={`bool-${q.id}`} checked={value === "No"} onChange={() => handleBooleanChange(q.id, false)} />
							No
						</label>
					</div>
				);
			case "multi_select": {
				const selected = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];
				const available = (q.options || []).filter(opt => !selected.includes(opt));
				return (
					<div className="rq-multiselect">
						{(q.options && q.options.length > 0) ? (
							<select
								className="rq-input"
								value=""
								onChange={(e) => handleMultiSelectAdd(q.id, e.target.value)}
							>
								<option value="" disabled>Select option</option>
								{available.map(opt => (
									<option key={opt} value={opt}>{opt}</option>
								))}
							</select>
						) : (
							<div className="rq-help">No options available for this question.</div>
						)}

						{selected.length > 0 && (
							<div className="rq-selected">
								{selected.map(opt => (
									<span key={opt} className="rq-chip selected">
										{opt}
										<button type="button" onClick={() => handleMultiSelectRemove(q.id, opt)} aria-label={`Remove ${opt}`}>×</button>
									</span>
								))}
							</div>
						)}
					</div>
				);
			}
			default:
				return (
					<input
						className="rq-input"
						type="text"
						value={value}
						onChange={(e) => handleTextareaChange(q.id, e.target.value)}
					/>
				);
		}
	};

	return (
		<div className="rq-page">
			{status && status.success && (
				<div className="rq-metrics">
					<div className="rq-metric-card">
						<div className="rq-metric-title">Total Questions</div>
						<div className="rq-metric-value">{status.data.progress.total_questions}</div>
					</div>
					<div className="rq-metric-card">
						<div className="rq-metric-title">Answered</div>
						<div className="rq-metric-value">{status.data.progress.answered_questions}</div>
						<div className="rq-progress">
							<div
								className="rq-progress-bar"
								style={{ width: `${Math.max(0, Math.min(100, status.data.progress.completion_percentage))}%` }}
							/>
						</div>
					</div>
					<div className="rq-metric-card">
						<div className="rq-metric-title">Completion</div>
						<div className="rq-metric-value">{Math.max(0, Math.min(100, status.data.progress.completion_percentage))}%</div>
					</div>
				</div>
			)}
			<div className="rq-header">
				<h2>ROPA Questionnaire</h2>
		<div className="rq-controls">
			<button
				type="button"
				className="rq-add-btn"
				onClick={handleOpenAddQuestion}
				title="Add question"
				aria-label="Add question"
			>
				<FaPlus />
			</button>
			<button className={`rq-toggle-btn ${!answeredOnly ? "active" : ""}`} onClick={handleToggleAnswered} disabled={loading}>
				Unanswered
			</button>
			<button className={`rq-toggle-btn ${answeredOnly ? "active" : ""}`} onClick={handleToggleAnswered} disabled={loading}>
				Answered
			</button>
			<button className="rq-save" onClick={handleSave} disabled={saving || changedIds.size === 0}>
				{saving ? "Saving..." : `Save (${changedIds.size})`}
			</button>
		</div>
			</div>

		{loading ? (
				<div className="rq-loading"><LoadingSpinner /></div>
			) : error ? (
				<div className="rq-error">{error}</div>
			) : (
				<div className="rq-grid">
					{questions.map((q) => {
						return (
						<div key={q.id} className="rq-card">
							<button
								type="button"
								className="rq-remove-btn"
								onClick={() => handleRemoveQuestion(q.id)}
								disabled={removingIds.has(q.id)}
								aria-label="Remove question"
							>
								×
							</button>
								<div className="rq-qtext">{q.question}{q.required ? <span className="rq-required"> *</span> : null}</div>
								{q.help_text ? <div className="rq-help">{q.help_text}</div> : null}
								{renderInput(q)}
							</div>
						);
					})}
				</div>
		)}

		{showAddQuestionPopup && (
			<div className="rq-add-popup-overlay" onClick={handleCloseAddQuestion}>
				<div className="rq-add-popup" onClick={(e) => e.stopPropagation()}>
					<div className="rq-add-popup-header">
						<h3>Add Question</h3>
						<button
							type="button"
							className="rq-add-close"
							onClick={handleCloseAddQuestion}
							aria-label="Close add question popup"
						>
							×
						</button>
					</div>
					<div className="rq-add-popup-content">
						<div className="rq-add-field">
							<label htmlFor="rq-add-question">Question<span className="rq-required"> *</span></label>
							<input
								id="rq-add-question"
								type="text"
								value={addQuestionForm.question}
								onChange={(e) => handleAddQuestionChange("question", e.target.value)}
								placeholder="Enter question"
							/>
						</div>
						<div className="rq-add-field">
							<label htmlFor="rq-add-category">Category<span className="rq-required"> *</span></label>
							<input
								id="rq-add-category"
								type="text"
								value={addQuestionForm.category}
								onChange={(e) => handleAddQuestionChange("category", e.target.value)}
								placeholder="Enter category"
							/>
						</div>
						<div className="rq-add-field">
							<label htmlFor="rq-add-type">Question Type</label>
							<select
								id="rq-add-type"
								value={addQuestionForm.question_type}
								onChange={(e) => handleAddQuestionChange("question_type", e.target.value)}
							>
								<option value="text">Text</option>
								<option value="textarea">Textarea</option>
								<option value="boolean">Boolean</option>
								<option value="multi_select">Multi Select</option>
							</select>
						</div>
						{addQuestionForm.question_type === "multi_select" && (
							<div className="rq-add-field">
								<label htmlFor="rq-add-options">Options<span className="rq-required"> *</span></label>
								<textarea
									id="rq-add-options"
									rows={4}
									value={addQuestionForm.optionsText}
									onChange={(e) => handleAddQuestionChange("optionsText", e.target.value)}
									placeholder="Enter each option on a new line or comma separated"
								/>
							</div>
						)}
						<div className="rq-add-field">
							<label htmlFor="rq-add-help">Help Text</label>
							<textarea
								id="rq-add-help"
								rows={3}
								value={addQuestionForm.help_text}
								onChange={(e) => handleAddQuestionChange("help_text", e.target.value)}
								placeholder="Optional help text"
							/>
						</div>
						<div className="rq-add-field-checkbox">
							<label>
								<input
									type="checkbox"
									checked={addQuestionForm.required}
									onChange={(e) => handleAddQuestionChange("required", e.target.checked)}
								/>
								<span>Required question</span>
							</label>
						</div>
					</div>
					{addQuestionError && (
						<div className="rq-add-error">{addQuestionError}</div>
					)}
					<div className="rq-add-actions">
						<button type="button" className="rq-add-cancel" onClick={handleCloseAddQuestion} disabled={addingQuestion}>
							Cancel
						</button>
						<button type="button" className="rq-add-submit" onClick={handleSubmitAddQuestion} disabled={addingQuestion}>
							{addingQuestion ? "Adding..." : "Add Question"}
						</button>
					</div>
				</div>
			</div>
		)}
		</div>
	);
};

export default RopaQuestionairePage;