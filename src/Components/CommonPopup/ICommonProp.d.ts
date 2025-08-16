export interface ICommonPopupProps {
    isOpen: boolean;
    onClose: () => void;
    popupType: PopupType;
    children: React.ReactNode;
    title?: string;
  }