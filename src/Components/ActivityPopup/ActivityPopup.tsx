import React, { useState, useEffect } from 'react';
import './Styles.css';
import type { IActivityPopupProps } from './IActivityProps';

const ActivityPopup: React.FC<IActivityPopupProps> = ({
  batchId,
  onNext
}) => {
  const [checkboxes, setCheckboxes] = useState<{ label: string; checked: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        { label: 'Sample Activity', checked: false },
        { label: 'Data Processing', checked: false },
        { label: 'Content Analysis', checked: false },
        { label: 'Report Generation', checked: false }
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

  const handleNext = () => {
    const selectedActivities = checkboxes.filter(cb => cb.checked).map(cb => cb.label).join(',');
    if (!selectedActivities) {
      alert('Please select an activity.');
      return;
    }
    
    if (onNext) {
      onNext(selectedActivities);
    }
  };

  

  return (
    <div className="activity-popup">
      <div className="activity-popup-header">
        <h3>Processing Activities</h3>
        <p className="activity-subtitle">
          Select the activities you want to perform with your uploaded data
        </p>
      </div>

      <div className="activity-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Loading activities...</span>
          </div>
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
        )}

        <div className="activity-actions">
          <button 
            className="activity-next-btn" 
            onClick={handleNext}
            disabled={isLoading || checkboxes.filter(cb => cb.checked).length === 0}
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityPopup;
