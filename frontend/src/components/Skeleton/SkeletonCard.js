import React from 'react';
import './Skeleton.css';

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-actions">
          <div className="skeleton-circle"></div>
          <div className="skeleton-circle"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-short"></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-small"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;







