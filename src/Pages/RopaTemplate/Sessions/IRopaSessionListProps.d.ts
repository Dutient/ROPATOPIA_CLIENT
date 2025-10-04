export interface IRopaSessionsListProps {
    selectedSessionId?: string;
    onSessionSelect?: (sessionId: string) => void;
    onUploadClick?: () => void;
    refreshTrigger?: boolean;
  }