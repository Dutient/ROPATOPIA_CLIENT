export interface IActivityPopupProps {
    batchId: string;
    companyName: string;
    onNext?: (selectedActivities: string) => void;
  }