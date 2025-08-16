import React, { useState, useEffect } from 'react';
import { SessionRepository } from '../../Repositories/SessionRepository';
import './Styles.css';


const SessionsList: React.FC<ISessionsListProps> = ({
  onSessionSelect,
  selectedSessionId,
}) => {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await SessionRepository.fetchAllSessions();
      
      // Transform the string array into Session objects
      const sessionObjects: ISession[] = response.sessions.map((sessionId: string, index: number) => ({
        id: sessionId,
        title: `Session ${index + 1}`,
        createdAt: new Date().toISOString(), // You might want to get actual dates from your API
        lastModified: new Date().toISOString(),
        isActive: sessionId === selectedSessionId
      }));
      
      setSessions(sessionObjects);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };

  const handleCreateNewSession = async () => {
    if (!newSessionTitle.trim()) return;
    
    try {
      // Here you would typically call an API to create a new session
      const newSession: ISession = {
        id: `session-${Date.now()}`,
        title: newSessionTitle,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isActive: true
      };
      
      setSessions(prev => [newSession, ...prev]);
      setNewSessionTitle('');
      setShowNewSessionForm(false);
      
      if (onSessionSelect) {
        onSessionSelect(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        // Here you would typically call an API to delete the session
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="sessions-list">
      <div className="sessions-header">
        <div className="sessions-title">
          <h3>Sessions</h3>
        </div>
        
        <button 
          className="new-session-button"
          onClick={() => setShowNewSessionForm(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Session
        </button>
      </div>

      {showNewSessionForm && (
        <div className="new-session-form">
          <input
            type="text"
            placeholder="Enter session title..."
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateNewSession()}
            autoFocus
          />
          <div className="form-actions">
            <button 
              className="create-button"
              onClick={handleCreateNewSession}
              disabled={!newSessionTitle.trim()}
            >
              Create
            </button>
            <button 
              className="cancel-button"
              onClick={() => {
                setShowNewSessionForm(false);
                setNewSessionTitle('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="search-container">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="sessions-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Loading sessions...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <p>No sessions found</p>
                <span>Try adjusting your search terms</span>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <p>No sessions yet</p>
                <span>Create your first session to get started</span>
              </>
            )}
          </div>
        ) : (
          <div className="sessions-list-items">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${session.id === selectedSessionId ? 'active' : ''}`}
                onClick={() => handleSessionClick(session.id)}
              >
                <div className="session-content">
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-date">
                      {formatDate(session.lastModified)}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-session-button"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete session"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
