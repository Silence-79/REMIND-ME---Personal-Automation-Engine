import { evaluateConditions } from "./conditionEvaluator";
import { executeActions } from "./actionExecutor";

export const sortRulesByPriority = (rules) => {
  return [...rules].sort((a, b) => (a.priority || 2) - (b.priority || 2));
};

export const processRules = (rules, triggerType, context, onLog) => {

  const sortedRules = sortRulesByPriority(rules);

  sortedRules.forEach(rule => {

    if (!rule.enabled) return;

    if (rule.trigger.type !== triggerType) return;

    // TIME TRIGGER
    if (triggerType === "time") {

      if (rule.trigger.value !== context.currentTime) {
        return;
      }

    }

    // INTERVAL TRIGGER
    if (triggerType === "interval") {

      const intervalSeconds = rule.trigger.value;
      const now = Date.now();

      if (!rule.lastRun) {
        rule.lastRun = now;
        return;
      }

      const elapsed = (now - rule.lastRun) / 1000;

      if (elapsed < intervalSeconds) {
        return;
      }

    }

    const conditionsValid = evaluateConditions(rule.conditions, context);

    if (conditionsValid) {
      executeActions(rule.actions, context);

      // Create log entry
      const logEntry = {
        id: Date.now(),
        ruleId: rule.id,
        triggerType: triggerType,
        timestamp: new Date().toISOString()
      };

      // Invoke onLog callback
      if (onLog) {
        onLog(logEntry);
      }

      // Update lastRun timestamp
      rule.lastRun = Date.now();
    }

  });

}

export const testRule = (rule, context, onLog) => {
  // Execute rule actions immediately without checking trigger conditions
  executeActions(rule.actions, context);

  // Create log entry with triggerType "manual"
  const logEntry = {
    id: Date.now(),
    ruleId: rule.id,
    triggerType: "manual",
    timestamp: new Date().toISOString()
  };

  // Invoke onLog callback if provided
  if (onLog) {
    onLog(logEntry);
  }

  // Update and return rule with new lastRun timestamp
  const updatedRule = {
    ...rule,
    lastRun: Date.now()
  };

  return updatedRule;
};
