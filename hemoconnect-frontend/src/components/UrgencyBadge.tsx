import React from 'react';
import './components.css';

interface UrgencyBadgeProps {
  level: number; // 1 = Routine, 2 = Urgent, 3 = Critical
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ level }) => {
  let label = 'Routine';
  let colorClass = 'badge-routine';

  if (level === 2) {
    label = 'Urgent';
    colorClass = 'badge-urgent';
  } else if (level === 3) {
    label = 'Critical';
    colorClass = 'badge-critical';
  }

  return (
    <span className={`urgency-badge ${colorClass}`}>
      <span className="dot"></span>
      {label}
    </span>
  );
};

export default UrgencyBadge;
