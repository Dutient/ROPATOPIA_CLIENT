export interface Knowledge_Item {
    id: string,
    title: string,
    content_type: string,
    original_filename: string,
    chunk_count: number,
    status: string,
    error_message: string,
    created_at: string,
    updated_at: string
        
}

export interface knowledge_text {
    title: string,
    content: string
}