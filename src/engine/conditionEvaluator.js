export const evaluateConditions = (conditions, context) => {

  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every(condition => {

    if (condition.type === "day") {
      const today = new Date().toLocaleString("en-US", { weekday: "long" });
      return today === condition.value;
    }

    if (condition.type === "hourAfter") {
      const hour = new Date().getHours();
      return hour >= condition.value;
    }

    if (condition.type === "variable") {
      return context.variables[condition.key] === condition.value;
    }

    return true;

  });

};