export interface IQuestionField {
    question: string;
    type: string;
    options: string[];
    required: boolean;
    placeholder?: string | null;
}

export interface IPreliminaryQuestions {
    success: boolean;
    message: string;
    data: Record<string, IQuestionField>;
}