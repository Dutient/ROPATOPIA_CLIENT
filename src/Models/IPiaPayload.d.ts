export interface RetrieveRequest {
    query: string;
    session_id: string;
    question_id: string | null;
}

export interface BulkRetrieveRequest {
    requests: RetrieveRequest[];
}
