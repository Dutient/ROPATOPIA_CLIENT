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
    processing_activity: string;
    company_name: string;
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
    processing_activity: string;
    company_name: string;
}

export interface IPreliminaryAnswerPayload {
    preliminary_answers: IPreliminaryAnswer
}

export interface IRopaQuestion {
    id: string;
    question: string;
    type: string; 
    category: string;
    help_text: string;
    required: boolean;
    options: string[] | null;
    answer: string | null;
    other_text: string | null;
    is_answered: boolean;
    answered_at: string | null;
}

export interface IRopaQuestionResponse {
    success: boolean;
    message: string;
    data: {
        session_id: string,
        questions: IRopaQuestion[],
        answered_only: boolean,
        total_questions: number | null
    }
}

export interface IRopaAnswer {
    session_id: string,
    question_id: string,
    other_text: string | null,
    answer: string,
    category: string,
}

export interface IRopaAddQuestionPayload {
    session_id: string;
    question: string;
    question_type: string;
    category: string;
    help_text: string;
    required: boolean;
    options: string[];
}

export interface IRopaSessionStatus {
    success: boolean,
    message: string,
    data: {
        session_id: string,
        status: string,
        domain: string,
        jurisdiction: string,
        organization_type: string,
        progress: {
            total_questions: number,
            answered_questions: number,
            completion_percentage: number,
        },
        created_at: string,
        updated_at: string,
    }
}