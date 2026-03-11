import { useState, useEffect } from "react";
import { processRules, testRule } from "./engine/automationEngine";
import { loadRules, saveRules, loadLogs, saveLogs } from "./storage/ruleStorage";
import Dashboard from "./components/Dashboard";
import LogViewer from "./components/LogViewer";
import "./App.css";

function App() {

  const [rules, setRules] = useState(() => loadRules() || []);

  const [triggerType, setTriggerType] = useState("button");
  const [intervalValue, setIntervalValue] = useState(5);
  const [timeValue, setTimeValue] = useState("12:00");
  const [messageText, setMessageText] = useState("");
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [priority, setPriority] = useState(2); // Task 8.1: Priority state with default Medium (2)

  // State variables for logs and filters (Task 6.1)
  const [logs, setLogs] = useState(() => loadLogs());
  const [searchText, setSearchText] = useState("");
  const [filterTrigger, setFilterTrigger] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const context = {
    variables: {}
  };

  // Save rules
  useEffect(() => {
    saveRules(rules);
  }, [rules]);

  useEffect(() => {

    const intervalEngine = setInterval(() => {

      processRules(rules, "interval", context);

    }, 1000); // check every 1 second

    return () => clearInterval(intervalEngine);

  }, [rules]);

  // Time trigger engine (aligned with clock)
  useEffect(() => {

    const runTimeCheck = () => {

      const now = new Date();

      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      processRules(rules, "time", {
        ...context,
        currentTime
      });

    };

    const now = new Date();

    const secondsUntilNextMinute = 60 - now.getSeconds();

    const timeout = setTimeout(() => {

      runTimeCheck();

      const interval = setInterval(runTimeCheck, 60000);

    }, secondsUntilNextMinute * 1000);

    return () => clearTimeout(timeout);

  }, [rules]);

  const runAutomation = () => {
    processRules(rules, "button", context);
  };

  const createRule = () => {

  const triggerValue =
    triggerType === "interval"
      ? intervalValue
      : triggerType === "time"
      ? timeValue
      : null;

  const actionsList = [
    {
      type: "message",
      text: messageText || "Automation triggered!"
    },
    {
      type: "log",
      text: "Rule executed successfully"
    }
  ];

  if (editingRuleId) {

    const updatedRules = rules.map(rule =>
      rule.id === editingRuleId
        ? {
            ...rule,
            priority: priority, 
            trigger: {
              type: triggerType,
              value: triggerValue
            },
            actions: actionsList
          }
        : rule
    );

    setRules(updatedRules);
    setEditingRuleId(null);

  } else {

    const newRule = {
      id: Date.now(),
      enabled: true,
      priority: priority,
      lastRun: null,
      trigger: {
        type: triggerType,
        value: triggerValue
      },
      conditions: [],
      actions: actionsList
    };

    setRules(prev => [...prev, newRule]);
  }

  setMessageText("");
  setPriority(2); 
  };

  const toggleRule = (id) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === id
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const deleteRule = (id) => {
    setRules(prevRules =>
      prevRules.filter(rule => rule.id !== id)
    );
  };

  const editRule = (rule) => {

    setEditingRuleId(rule.id);

    setTriggerType(rule.trigger.type);

    if (rule.trigger.type === "interval") {
      setIntervalValue(rule.trigger.value);
    }

    if (rule.trigger.type === "time") {
      setTimeValue(rule.trigger.value);
    }

    setMessageText(rule.actions[0]?.text || "");
    
   
    setPriority(rule.priority || 2);

  };

  
  const handleLog = (logEntry) => {
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, logEntry];
      saveLogs(updatedLogs);
      return updatedLogs;
    });
  };

  
  const handleTestRule = (rule) => {
    const updatedRule = testRule(rule, context, handleLog);

    setRules(prevRules =>
      prevRules.map(r =>
        r.id === rule.id ? updatedRule : r
      )
    );
  };

  
  const getFilteredRules = () => {
    return rules.filter(rule => {
      // Filter by search text (match against action message content)
      const matchesSearch = searchText === "" || 
        rule.actions.some(action => 
          action.text && action.text.toLowerCase().includes(searchText.toLowerCase())
        );

      // Filter by trigger type
      const matchesTrigger = filterTrigger === "All" || 
        rule.trigger.type === filterTrigger;

      // Filter by status (enabled/disabled)
      const matchesStatus = filterStatus === "All" ||
        (filterStatus === "Enabled" && rule.enabled) ||
        (filterStatus === "Disabled" && !rule.enabled);

      // Apply all filters simultaneously
      return matchesSearch && matchesTrigger && matchesStatus;
    });
  };

  
  const handleExportRules = () => {
    const jsonString = JSON.stringify(rules, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rules.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  
  const handleImportRules = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedRules = JSON.parse(content);

        // Validate structure: must be an array
        if (!Array.isArray(importedRules)) {
          alert("Import failed: Invalid JSON format. Expected an array of rules. Your existing rules are preserved.");
          return;
        }

        // Validate each rule has required fields
        const validRules = importedRules.filter(rule => {
          return rule.id !== undefined && 
                 rule.trigger !== undefined && 
                 rule.actions !== undefined;
        });

        if (validRules.length < importedRules.length) {
          const skippedCount = importedRules.length - validRules.length;
          alert(`Import completed with warnings: ${skippedCount} rule(s) skipped due to missing required fields.`);
        }

        // Replace rules state with imported rules
        setRules(validRules);
        saveRules(validRules);

      } catch (error) {
        // Handle invalid JSON
        alert("Import failed: Invalid JSON format. Your existing rules are preserved.");
      }
    };

    reader.onerror = () => {
      alert("Import failed: Could not read file. Your existing rules are preserved.");
    };

    reader.readAsText(file);
  };

  // Clear execution logs
  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all execution logs?")) {
      setLogs([]);
      saveLogs([]);
    }
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">⏰ Remind Me</h1>
      </header>

      <div className="app-content">
        {/* Create Rule Section */}
        <div className="glass-card">
          <h2 className="section-header">Create Automation Rule</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="button">Button</option>
                <option value="interval">Interval</option>
                <option value="time">Time</option>
              </select>
            </div>

            {triggerType === "interval" && (
              <div className="form-group">
                <label>Interval (seconds)</label>
                <input
                  type="number"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(Number(e.target.value))}
                />
              </div>
            )}

            {triggerType === "time" && (
              <div className="form-group">
                <label>Run At Time</label>
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={1}>High (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>Low (3)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message Action</label>
            <input
              type="text"
              placeholder="Enter your reminder message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ maxWidth: '100%' }}
            />
          </div>

          <div className="button-group">
            <button onClick={createRule} className="btn-primary">
              {editingRuleId ? "Update Rule" : "Create Rule"}
            </button>

            <button onClick={runAutomation} className="btn-secondary">
              Run Automation
            </button>

            <button onClick={handleExportRules} className="btn-secondary">
              Export Rules
            </button>

            <button
              onClick={() => document.getElementById('import-file-input').click()}
              className="btn-secondary"
            >
              Import Rules
            </button>
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImportRules(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="glass-card">
          <h2 className="section-header">Dashboard</h2>
          <Dashboard rules={rules} />
        </div>

        {/* Rules List Section */}
        <div className="glass-card">
          <h2 className="section-header">Your Rules</h2>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-item">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search rules by message..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: '100%' }}
              />
            </div>

            <div className="filter-item">
              <label>Filter by Trigger</label>
              <select
                value={filterTrigger}
                onChange={(e) => setFilterTrigger(e.target.value)}
                style={{ maxWidth: '100%' }}
              >
                <option value="All">All</option>
                <option value="button">Button</option>
                <option value="interval">Interval</option>
                <option value="time">Time</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ maxWidth: '100%' }}
              >
                <option value="All">All</option>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Rules Display */}
          {rules.length === 0 && (
            <div className="empty-state">
              No rules created yet. Create your first automation rule above!
            </div>
          )}
          
          {rules.length > 0 && getFilteredRules().length === 0 && (
            <div className="empty-state">
              No rules match your filters. Try adjusting your search criteria.
            </div>
          )}

          {getFilteredRules().map(rule => (
            <div key={rule.id} className="rule-card">
              <div className="rule-header">
                <span className="rule-id">ID: {rule.id}</span>
                <span className={`rule-status ${rule.enabled ? 'enabled' : 'disabled'}`}>
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="rule-details">
                <div className="rule-detail-item">
                  <span className="rule-detail-label">Trigger</span>
                  <span className="rule-detail-value">
                    {rule.trigger.type}
                    {rule.trigger.value && ` (${rule.trigger.value})`}
                  </span>
                </div>

                <div className="rule-detail-item">
                  <span className="rule-detail-label">Priority</span>
                  <span className={`priority-badge priority-${
                    rule.priority === 1 ? 'high' :
                    rule.priority === 3 ? 'low' : 'medium'
                  }`}>
                    {rule.priority === 1 ? 'High' :
                     rule.priority === 3 ? 'Low' : 'Medium'}
                  </span>
                </div>

                <div className="rule-detail-item">
                  <span className="rule-detail-label">Last Run</span>
                  <span className="rule-detail-value">
                    {rule.lastRun 
                      ? new Date(rule.lastRun).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit',
                          hour12: false 
                        })
                      : "Never"}
                  </span>
                </div>

                <div className="rule-detail-item">
                  <span className="rule-detail-label">Message</span>
                  <span className="rule-detail-value">
                    {rule.actions[0]?.text || 'No message'}
                  </span>
                </div>
              </div>

              <div className="rule-actions">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={rule.enabled ? 'btn-secondary' : 'btn-success'}
                >
                  {rule.enabled ? "Disable" : "Enable"}
                </button>

                <button onClick={() => editRule(rule)} className="btn-secondary">
                  Edit
                </button>

                <button onClick={() => handleTestRule(rule)} className="btn-primary">
                  Test Rule
                </button>

                <button onClick={() => deleteRule(rule.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Execution Log Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-header" style={{ marginBottom: 0 }}>Execution Log</h2>
            <button onClick={handleClearLogs} className="btn-danger">
              Clear Logs
            </button>
          </div>
          <LogViewer logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;