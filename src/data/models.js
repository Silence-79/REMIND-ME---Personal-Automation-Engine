/**
 * Data Models for Personal Automation Engine
 * 
 * This file defines the structure and validation for data models used throughout the application.
 */

/**
 * LogEntry Object Structure
 * 
 * Represents a single execution log entry for a rule.
 * 
 * @typedef {Object} LogEntry
 * @property {number} id - Unique identifier (timestamp)
 * @property {number} ruleId - Reference to the executed rule's ID
 * @property {string} triggerType - Type of trigger that caused execution: "button" | "interval" | "time" | "manual"
 * @property {string} timestamp - ISO 8601 timestamp string (e.g., "2024-01-15T10:30:00.000Z")
 * 
 * @example
 * {
 *   id: 1705315800000,
 *   ruleId: 1705315700000,
 *   triggerType: "button",
 *   timestamp: "2024-01-15T10:30:00.000Z"
 * }
 */

/**
 * Creates a new LogEntry object
 * 
 * @param {number} ruleId - The ID of the rule that was executed
 * @param {string} triggerType - The type of trigger ("button" | "interval" | "time" | "manual")
 * @returns {LogEntry} A new log entry object
 */
export const createLogEntry = (ruleId, triggerType) => {
  return {
    id: Date.now(),
    ruleId,
    triggerType,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validates a LogEntry object structure
 * 
 * @param {*} entry - The object to validate
 * @returns {boolean} True if the object is a valid LogEntry
 */
export const isValidLogEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return false;
  
  const hasRequiredFields = 
    typeof entry.id === 'number' &&
    typeof entry.ruleId === 'number' &&
    typeof entry.triggerType === 'string' &&
    typeof entry.timestamp === 'string';
  
  if (!hasRequiredFields) return false;
  
  const validTriggerTypes = ['button', 'interval', 'time', 'manual'];
  if (!validTriggerTypes.includes(entry.triggerType)) return false;
  
  // Validate ISO 8601 timestamp format
  const date = new Date(entry.timestamp);
  if (isNaN(date.getTime())) return false;
  
  return true;
};

/**
 * Rule Object Structure (Enhanced)
 * 
 * Represents an automation rule with trigger, conditions, actions, and metadata.
 * 
 * @typedef {Object} Rule
 * @property {number} id - Unique identifier (timestamp)
 * @property {boolean} enabled - Rule active status
 * @property {number} priority - Execution priority: 1=High, 2=Medium, 3=Low (default: 2)
 * @property {number|null} lastRun - Timestamp of last execution, null if never executed
 * @property {Object} trigger - Trigger configuration
 * @property {string} trigger.type - Trigger type: "button" | "interval" | "time"
 * @property {number|string|null} trigger.value - Trigger-specific value
 * @property {Array} conditions - Array of condition objects
 * @property {Array} actions - Array of action objects
 * 
 * @example
 * {
 *   id: 1705315700000,
 *   enabled: true,
 *   priority: 2,
 *   lastRun: 1705315800000,
 *   trigger: {
 *     type: "button",
 *     value: null
 *   },
 *   conditions: [],
 *   actions: [{ type: "message", text: "Hello World" }]
 * }
 */
