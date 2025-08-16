interface ISessionsListProps {
    onSessionSelect?: (sessionId: string) => void;
    selectedSessionId?: string;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
  }