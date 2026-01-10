import React from 'react';
import './Skeleton.css';

const SkeletonList = ({ count = 5 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-circle skeleton-icon"></div>
          <div className="skeleton-line skeleton-list-text"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;







