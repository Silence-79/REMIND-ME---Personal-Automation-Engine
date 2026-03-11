const STORAGE_KEY = "automation_rules";

export const loadRules = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  const rules = JSON.parse(data);
  
  // Ensure backward compatibility by adding default values for new fields
  return rules.map(rule => ({
    ...rule,
    priority: rule.priority !== undefined ? rule.priority : 2,
    lastRun: rule.lastRun !== undefined ? rule.lastRun : null
  }));
};

export const saveRules = (rules) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

const LOGS_KEY = "automation_logs";
const MAX_LOG_ENTRIES = 1000;

export const loadLogs = () => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs) => {
  // Trim to keep only most recent 1,000 entries
  const trimmedLogs = logs.length > MAX_LOG_ENTRIES 
    ? logs.slice(-MAX_LOG_ENTRIES) 
    : logs;
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(trimmedLogs));
};
