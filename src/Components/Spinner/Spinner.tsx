import './Styles.css';

const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <span
    className="spinner"
    style={{ width: size, height: size}}
    aria-label="Loading"
    role="status"
  />
);

export default Spinner; 