import React, { useState, useEffect } from 'react';
import type { IRopaSessionsListProps } from './IRopaSessionListProps';
import './Styles.css';
import Swal from 'sweetalert2';
import { RopaTemplateRepository } from '../../../Repositories/RopaTemplateRepository';
import type { IRopaSession } from '../../../Models/IRopaTemplate';

const RopaSessionsList: React.FC<IRopaSessionsListProps> = ({
  onSessionSelect,
  selectedSessionId,
  onUploadClick,
  refreshTrigger
}) => {
  const [sessions, setSessions] = useState<IRopaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await RopaTemplateRepository.getRopaSessions();
      setSessions(response);
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
      text: 'Do you want to delete this ROPA session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await RopaTemplateRepository.deleteRopaSession(sessionId);
          fetchSessions();
          Swal.fire('Deleted!', 'The ROPA session has been deleted.', 'success');
        } catch (error) {
          console.error('Failed to delete ROPA session:', error);
          Swal.fire('Error!', 'Failed to delete the ROPA session.', 'error');
        }
      }
    });
  };

  const filteredSessions = (sessions).filter(session => {
    const term = searchTerm.toLowerCase();
    return (
      session.domain.toLowerCase().includes(term) ||
      session.jurisdiction.toLowerCase().includes(term) ||
      session.status.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  return (
    <div className="sessions-list">
      <div className="sessions-header">
        <div className="sessions-title">
          <h3>ROPA Sessions</h3>
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
            placeholder="Search by domain, jurisdiction, or status"
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
            <span>Loading ROPA sessions...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <p>No ROPA sessions found</p>
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
                <p>No ROPA sessions yet</p>
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
                  <div className="session-title">{session.domain}</div>
                  <div className="session-meta">
                    <div className="session-details">
                      <span className="detail-pill"><strong>Jurisdiction:</strong> {session.jurisdiction || 'N/A'}</span>
                      <span className={`detail-pill status-pill status-${session.status.toLowerCase()}`}>{session.status}</span>
                      <span className="detail-pill"><strong>Completion:</strong> {Math.max(0, Math.min(100, session.completion_percentage))}%</span>
                    </div>
                    <div className="progress-track" aria-label="Completion progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${Math.max(0, Math.min(100, session.completion_percentage))}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="delete-session-button"
                  onClick={(e) => handleDeleteSession(session.session_id, e)}
                  title="Delete ROPA session"
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

export default RopaSessionsList;
