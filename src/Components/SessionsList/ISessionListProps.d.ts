export interface ISessionsListProps {
    selectedSessionId?: string;
    onSessionSelect?: (sessionId: string) => void;
    onUploadClick?: () => void;
  }