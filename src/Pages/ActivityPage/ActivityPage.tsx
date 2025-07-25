import React, { useState, useLayoutEffect } from 'react';
import './Styles.css';
import Breadcrumb from '../../Components/Breadcrumb';
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
  

  useLayoutEffect(() => {
    (async () => {
      try {
        if (!batch_id) {
          alert('File is not selected. Please upload a file first.');
          return;
        }
        const data = await ProcessingActivityRepository.fetchActivitiesByBatchId(batch_id);
        setCheckboxes(data.processing_activities.map(activity => ({ label: activity, checked: false })));
      } catch (error) {
        setCheckboxes(initialCheckboxes);
      }
    })();
  }, []);

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
        <button 
          className="submit-btn" 
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AcitivityPage;
