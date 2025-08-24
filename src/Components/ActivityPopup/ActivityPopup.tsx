import React, { useState, useEffect } from 'react';
import './Styles.css';
import type { IActivityPopupProps } from './IActivityProps';
import { SessionRepository } from '../../Repositories/SessionRepository';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Spinner from '../Spinner/Spinner';

const ActivityPopup: React.FC<IActivityPopupProps> = ({
  batchId,
  companyName,
  onNext
}) => {
  const [checkboxes, setCheckboxes] = useState<{ label: string; checked: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmittingMessage, setShowSubmittingMessage] = useState(false);

  useEffect(() => {
    if (batchId) {
      fetchActivities();
    } else {
      // Set default activities if no batch ID
      setCheckboxes([
        { label: 'Sample Activity', checked: false },
        { label: 'Data Processing', checked: false },
        { label: 'Content Analysis', checked: false },
        { label: 'Report Generation', checked: false }
      ]);
    }
  }, [batchId]);

  const fetchActivities = async () => {
    if (!batchId) return;

    setIsLoading(true);
    try {
      // Import the repository dynamically to avoid circular dependencies
      const { ProcessingActivityRepository } = await import('../../Repositories/ProcessingActivityRepository');
      const data = await ProcessingActivityRepository.fetchActivitiesByBatchId(batchId);
      setCheckboxes(data.processing_activities.map(activity => ({ label: activity, checked: false })));
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Fallback to default activities
      setCheckboxes([
        { label: 'Activity 1', checked: false },
        { label: 'Activity 2', checked: false },
        { label: 'Activity 3', checked: false },
        { label: 'Activity 4', checked: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (index: number) => {
    setCheckboxes(prev =>
      prev.map((cb, i) =>
        i === index ? { ...cb, checked: !cb.checked } : cb
      )
    );
  };

  const handleNext = async () => {
    const selectedActivities = checkboxes.filter(cb => cb.checked).map(cb => cb.label);
    
    if (selectedActivities.length === 0) {
      alert('Please select an activity.');
      return;
    } 
    setIsSubmitting(true);
    setShowSubmittingMessage(false);

    // Show the message after 2-3 seconds
    setTimeout(() => {
      setShowSubmittingMessage(true);
    }, 2000);

    try {
      const response = await SessionRepository.createSession(batchId, selectedActivities, companyName);

      if (response.ok && onNext) {
        const result = await response.json();
        onNext(result.session_id);
      }
    } catch (error) {
      alert('Failed to create session. Please try again.');
      console.error('Error creating session:', error);
    } finally {
      setIsSubmitting(false);
      setShowSubmittingMessage(false);
    }
  };

  return (
    <div className="activity-popup">
      <div className="activity-popup-header">
        <p className="activity-subtitle">
          Select the activities you want to perform with your uploaded data
        </p>
      </div>

      <div className="activity-content">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          checkboxes.length === 0 ? (
            <span>No activity found</span>
          ) : (
            <div className="checkboxes-section">
              {checkboxes.map((cb, idx) => (
                <div key={cb.label} className="checkbox-item">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={cb.checked}
                      onChange={() => handleCheckboxChange(idx)}
                    />
                    <span className="checkmark"></span>
                    {cb.label}
                  </label>
                </div>
              ))}
            </div>
          )
        )}
        <div className="activity-actions">
          <div>
            <button
              className="activity-next-btn"
              onClick={handleNext}
              disabled={isLoading || checkboxes.filter(cb => cb.checked).length === 0 || isSubmitting}
            >
              {isSubmitting ? <Spinner size={16} /> : 'Continue'}
            </button>
          </div>
          {showSubmittingMessage && (
            <div className="submitting-message-container">
              <p className="submitting-message">
                This may take 1-2 minutes. Please do not close the page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPopup;