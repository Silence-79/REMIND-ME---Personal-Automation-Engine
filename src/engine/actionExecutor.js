export const executeActions = (actions, context) => {

  actions.forEach(action => {

    if (action.type === "message") {
      alert(action.text);
    }

    if (action.type === "setVariable") {
      context.variables[action.key] = action.value;
    }

    if (action.type === "log") {
      console.log("Actions Received:", actions);
    }

  });

};