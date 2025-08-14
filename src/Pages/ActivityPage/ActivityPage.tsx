import React, { useState, useLayoutEffect } from 'react';
import './Styles.css';
import Breadcrumb from '../../Components/Breadcrump/Breadcrumb';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProcessingActivityRepository } from '../../Repositories/ProcessingActivityRepository';

const initialCheckboxes = [
  { label: 'Sample Activity', checked: false },
];

const AcitivityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const batch_id = searchParams.get('batch_id');
  const [checkboxes, setCheckboxes] = useState<{ label: string; checked: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  

  useLayoutEffect(() => {
    if (!batch_id) {
      alert('File is not selected. Please upload a file first.');
      return;
    }

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await ProcessingActivityRepository.fetchActivitiesByBatchId(batch_id);
        setCheckboxes(data.processing_activities.map(activity => ({ label: activity, checked: false })));
      } catch (error) {
        console.error('Error fetching activities:', error);
        setCheckboxes(initialCheckboxes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [batch_id]);

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
    navigate(`/questionaire?batch_id=${batch_id}&activity=${selectedActivities}`);
  };

  return (
    <div className="questionnaire-page">
      <Breadcrumb paths={[
        { name: 'Home', href: '/' },
        { name: 'Upload', href: '/upload' },
        { name: 'Activity', href: '/activity' }
      ]} />
      <div className="questionnaire-container">
        {/* Left: Checkboxes */}
        <div className="checkboxes-section">
          <h3>Processing Activities</h3>
          {isLoading ? (
            <div className="loading-message">Loading activities...</div>
          ) : (
            checkboxes.map((cb, idx) => (
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
            ))
          )}
        </div>
        <button 
          className="submit-btn" 
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default AcitivityPage;
