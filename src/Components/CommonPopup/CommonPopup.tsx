import React from 'react';
import './Styles.css';
import type { ICommonPopupProps } from './ICommonProp';

export type PopupType = 'upload' | 'activity';



const CommonPopup: React.FC<ICommonPopupProps> = ({
  isOpen,
  onClose,
  popupType,
  children,
  title,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="common-popup-overlay" onClick={handleOverlayClick}>
      <div 
        className="common-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="common-popup-header">
          <h2 className="common-popup-title">
            {title || getDefaultTitle(popupType)}
          </h2>
          <button className="common-popup-close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="common-popup-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const getDefaultTitle = (popupType: PopupType): string => {
  switch (popupType) {
    case 'upload':
      return 'Create New Session';
    case 'activity':
      return 'Processing Activities';
    default:
      return 'Popup';
  }
};

export default CommonPopup;
