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

export interface IRopaSession {
    session_id: string;
    status: string;
    domain: string;
    jurisdiction: string;
    completion_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface IRopaSessionResponse {
    success: boolean;
    message: string;
    data: {
        sessions: IRopaSession[];
    };
}

export interface IPreliminaryAnswer {
    domain: string;
    jurisdiction: string;
    organization_type: string;
    data_types: string;
}

export interface IPreliminaryAnswerPayload {
    preliminary_answers: IPreliminaryAnswer
}