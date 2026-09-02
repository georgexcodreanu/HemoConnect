import React from 'react';
import './components.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  highlightColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, highlightColor }) => {
  return (
    <div className="bento-card stat-card">
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value" style={{ color: highlightColor || 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
