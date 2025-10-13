export interface IPreliminaryQuestionPopupProps {
    onNext: (session_id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}