interface RetrieveRequest {
    query: string;
    batch_id?: string;
    processing_activity: string[];
}

interface BulkRetrieveRequest {
    requests: RetrieveRequest[];
}
