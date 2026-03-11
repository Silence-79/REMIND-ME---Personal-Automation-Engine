import React from 'react';

/**
 * Dashboard component displays rule statistics summary
 * 
 * @param {Object} props - Component props
 * @param {Array} props.rules - Array of rule objects
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = ({ rules }) => {
  const total = rules.length;
  const active = rules.filter(r => r.enabled).length;
  const disabled = total - active;

  return (
    <div className="dashboard-stats">
      <div className="stat-item">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Total Rules</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#4ade80' }}>{active}</span>
        <span className="stat-label">Active Rules</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#9ca3af' }}>{disabled}</span>
        <span className="stat-label">Disabled Rules</span>
      </div>
    </div>
  );
};

export default Dashboard;
