import React from 'react';

export const StatusBadge = ({ scenario }) => {
  if (scenario === 'HIGH') {
    return <span className="badge-high">HIGH (RISK 95)</span>;
  }
  if (scenario === 'MEDIUM') {
    return <span className="badge-medium">MEDIUM (RISK 55)</span>;
  }
  return <span className="badge-low">LOW (RISK 15)</span>;
};
