import React from 'react';
import './Styles.css';

export interface BreadcrumbPath {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  paths: BreadcrumbPath[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {paths.map((path, idx) => (
          <li key={path.href} className="breadcrumb-item">
            {idx < paths.length - 1 ? (
              <a href={path.href} className="breadcrumb-link">{path.name}</a>
            ) : (
              <span className="breadcrumb-current">{path.name}</span>
            )}
            {idx < paths.length - 1 && <span className="breadcrumb-separator">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 