import React, { useState, useEffect } from 'react';
import { SessionRepository } from '../../Repositories/SessionRepository';
import type { ISession } from '../../Models/ISession';
import type { ISessionsListProps } from './ISessionListProps';
import './Styles.css';
import Swal from 'sweetalert2';

const SessionsList: React.FC<ISessionsListProps> = ({
  onSessionSelect,
  selectedSessionId,
  onUploadClick,
}) => {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await SessionRepository.fetchAllSessions();
      const activeSession = response.filter(session => session.isActive);
      setSessions(activeSession);
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

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await SessionRepository.deleteSession(sessionId);
          fetchSessions();
          Swal.fire('Deleted!', 'The session has been deleted.', 'success');
        } catch (error) {
          console.error('Failed to delete session:', error);
          Swal.fire('Error!', 'Failed to delete the session.', 'error');
        }
      }
    });
  };

  const filteredSessions = (sessions).filter(session =>
    session.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.processing_activities.some((activity: string) => 
      activity.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
  //   if (diffInHours < 24) {
  //     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //   } else if (diffInHours < 168) // 7 days
  //     return date.toLocaleDateString([], { weekday: 'short' });
  //   } else {
  //     return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  //   }
  // };

  useEffect(() => {
    const handleFetchSessions = () => {
      fetchSessions();
    };

    const sessionsListElement = document.querySelector('.sessions-list');
    if (sessionsListElement) {
      sessionsListElement.addEventListener('fetchSessions', handleFetchSessions);
    }

    return () => {
      if (sessionsListElement) {
        sessionsListElement.removeEventListener('fetchSessions', handleFetchSessions);
      }
    };
  }, []);

  return (
    <div className="sessions-list">
      <div className="sessions-header">
        <div className="sessions-title">
          <h3>Sessions</h3>
        </div>
        
        <button 
          className="new-session-button"
          onClick={onUploadClick}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Session
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by company name or processing activities..."
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
                key={session.session_id}
                className={`session-item ${session.session_id === selectedSessionId ? 'active' : ''}`}
                onClick={() => handleSessionClick(session.session_id)}
              >
                <div className="session-content">
                  <div className="session-title">{session.company_name}</div>
                  <div className="session-meta">
                    <div className="processing-activities">
                      {session.processing_activities.length > 0 ? (
                        session.processing_activities.slice(0, 3).map((activity: string, index: number) => (
                          <span key={index} className="activity-tag">
                            {activity}
                          </span>
                        ))
                      ) : (
                        <span className="no-activities">No processing activities</span>
                      )}
                      {session.processing_activities.length > 3 && (
                        <span className="more-activities">
                          +{session.processing_activities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="delete-session-button"
                  onClick={(e) => handleDeleteSession(session.session_id, e)}
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
