import React from 'react';

/**
 * LogViewer component displays execution log history
 * 
 * @param {Object} props - Component props
 * @param {Array} props.logs - Array of log entry objects
 * @returns {JSX.Element} LogViewer component
 */
const LogViewer = ({ logs }) => {
  // Handle empty log state
  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state">
        No executions yet. Test a rule or wait for scheduled triggers to see logs here.
      </div>
    );
  }

  // Sort logs in reverse chronological order (newest first)
  const sortedLogs = [...logs].reverse();

  return (
    <div className="log-viewer">
      {sortedLogs.map(log => {
        // Format timestamp as HH:MM:SS
        const date = new Date(log.timestamp);
        const time = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
        
        return (
          <div key={log.id} className="log-entry">
            <span style={{ color: '#667eea', fontWeight: 'bold' }}>Rule {log.ruleId}</span> executed | 
            <span style={{ color: '#fbbf24' }}> Trigger: {log.triggerType}</span> | 
            <span style={{ color: '#9ca3af' }}> {time}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LogViewer;
