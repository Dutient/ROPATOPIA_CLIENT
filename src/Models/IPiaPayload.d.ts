export interface RetrieveRequest {
    query: string;
    session_id: string;
    question_id: string | null;
    feedback: string | null; // Optional feedback field
}

export interface BulkRetrieveRequest {
    requests: RetrieveRequest[];
}
