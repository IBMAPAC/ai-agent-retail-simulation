// --- STATE MANAGEMENT ---
let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

// --- DEMO CONFIGURATION ---
// This object defines the entire content for the RetailWorld Demo.
const config = {
    title: "RetailWorld Agentic AI Simulation",
    subtitle: "Choose a scenario to simulate agentic AI behavior in retail:",
    // Define the 6 industry-specific agents
    agents: [
        { id: 'agent1', key: 'forecasting', name: '📊 Forecasting', desc: 'Analyzes historical data to predict future sales and demand.' },
        { id: 'agent2', key: 'diagnostics', name: '🛠️ Diagnostics', desc: 'Analyzes data to find root causes and predict business impact.' },
        { id: 'agent3', key: 'planner', name: '🎯 Planner', desc: 'Generates and models strategic response plans to achieve goals.' },
        { id: 'agent4', key: 'procurement', name: '📝 Procurement', desc: 'Manages supplier interactions and inventory purchase data.' },
        { id: 'agent5', key: 'logistics', name: '📦 Logistics', desc: 'Handles physical inventory movement and supply chain execution.' },
        { id: 'agent6', key: 'learning', name: '🔁 Learning', desc: 'Analyzes past events to improve future processes and models.' }
    ],
    // Define the scenarios for this industry
    scenarios: {
        competitiveThreat: {
            name: "⚔️ Competitive Threat",
            steps: [
                { text: "‼️ COMPETITIVE ALERT: Forecasting agent detects a 20% price drop on a key product from our main rival, 'ShopSphere'.", bubble: ["forecasting", "Rival price drop detected!"], agent: "forecasting", type: 'event', handoffTo: "diagnostics",
                  explanation: "<h3>Proactive Market Monitoring</h3><p>The agent autonomously scans competitor websites and market data to detect strategic moves in real-time.</p><ul><li><b>vs. Manual:</b> A marketing team might discover this days later, losing critical response time.</li><li><b>vs. RPA:</b> An RPA bot could scrape a price but can't understand the context or identify that 'ShopSphere' is a key rival.</li></ul>",
                  challenge: "<h3>Data Source Trustworthiness</h3><p>How do you ensure the agent is acting on reliable data and not a typo on a competitor's test page? A false positive could trigger a premature and costly price war.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.data</strong> to connect to a curated, trusted set of market intelligence APIs and data sources.</li><li>Implement a rule in <strong>watsonx.governance</strong> requiring a second source confirmation or a confidence score above 95% before escalating an alert.</li></ul>"
                },
                { text: "🛠️ Diagnostics agent analyzes market impact, predicting a 15% drop in our sales within 48 hours if no action is taken.", bubble: ["diagnostics", "Predicting market share loss."], agent: "diagnostics", handoffTo: "planner",
                  explanation: "<h3>Automated Impact Analysis</h3><p>The agent connects the competitor's action to our own sales data, running a predictive model to quantify the potential business impact.</p><ul><li><b>vs. Manual:</b> This automates the work of a data analyst, providing an instant, data-backed assessment of the threat level.</li></ul>",
                  challenge: "<h3>Model Accuracy & Drift</h3><p>The predictive model's accuracy is critical. If it overestimates the impact, the company might overreact. If it underestimates, the response may be too weak. The model could also become outdated (drift) as market conditions change.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.governance</strong> to continuously monitor the sales impact model for drift and accuracy against real-world outcomes.</li><li>Employ smaller, specialized <strong>IBM Granite models</strong> tuned on your specific data via <strong>watsonx.ai</strong> for more accurate, context-aware predictions.</li></ul>"
                },
                { text: "🎯 Planner agent models three response strategies: Price Match, Value-Add Bundle, or Targeted Ad Campaign.", bubble: ["planner", "Modeling responses..."], agent: "planner",
                  explanation: "<h3>Strategic Option Generation</h3><p>Instead of one path, the agent generates multiple viable strategies, each with predicted outcomes for revenue, margin, and market share.</p><ul><li><b>vs. Chatbot:</b> A chatbot could suggest generic ideas, but it cannot model the specific financial outcomes of each strategy.</li></ul>",
                  challenge: "<h3>Computational Cost</h3><p>Modeling three complex business strategies, each with multiple variables and data sources, can be computationally expensive. Running such simulations constantly could lead to soaring operational costs.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Turbonomic</strong> and <strong>Apptio</strong> to get a real-time view of the computational cost vs. the business value of the insights generated.</li><li>Leverage <strong>watsonx Orchestrate</strong> to trigger these complex modeling workflows on a schedule or only when specific, high-impact alert thresholds are met, avoiding unnecessary runs.</li></ul>"
                },
                { type: 'human_approval', text: 'Planner recommends a "Value-Add Bundle" strategy. It protects margins but requires quick execution. Please approve.', options: [{text: '✅ Approve Bundle', branch: 'approveBundle'}, {text: '❌ Initiate Price Match', branch: 'priceMatch'}],
                  explanation: "<h3>Human-in-the-Loop Decision</h3><p>For a major strategic decision, the system presents its data-driven recommendation to a human for final approval, acting as a trusted advisor.</p><ul><li><b>vs. RPA:</b> An RPA bot cannot handle this ambiguity; it would either stop or execute a single, pre-programmed path.</li></ul>",
                  challenge: "<h3>Explainability & Trust</h3><p>Why is the bundle recommended over the price match? A human decision-maker needs to trust the agent's reasoning. A black-box recommendation is unlikely to be approved.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.governance</strong> to generate a transparent 'chain-of-thought' audit log, showing the data, models, and rules the agent used to arrive at its recommendation.</li><li>Present the potential outcomes of each choice using clear visualizations built with tools in <strong>watsonx.ai</strong>.</li></ul>"
                }
            ]
        },
        productRecall: {
            name: "⚠️ Product Recall",
            steps: [
                { text: "‼️ CRITICAL ALERT: Diagnostics agent flags a cluster of customer complaints linked to 'PowerUp' energy bars.", bubble: ["diagnostics", "Safety alert! Batch B-452."], agent: "diagnostics", type: 'event', handoffTo: "procurement",
                  explanation: "<h3>Anomaly Detection in Unstructured Data</h3><p>The agent identifies a safety issue by detecting a statistically significant cluster of keywords (e.g., 'sick', 'unwell') in unstructured customer support tickets and social media posts.</p><ul><li><b>vs. Rule-Based System:</b> A simple keyword alert creates too much noise. The agent detects the pattern and connection.</li></ul>",
                  challenge: "<h3>Data Privacy & PII</h3><p>Scanning customer complaints involves processing sensitive Personally Identifiable Information (PII). The system must access this data securely and without improper exposure.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Vault</strong> to securely manage and audit the credentials the agent needs to access sensitive data sources.</li><li>Use <strong>watsonx.governance</strong> to automatically detect and redact PII from the data stream before it's processed by analytical models.</li></ul>"
                },
                { text: "📝 Procurement agent confirms the supplier used a faulty ingredient in batch B-452. A recall is necessary.", bubble: ["procurement", "Fault confirmed."], agent: "procurement", handoffTo: "planner",
                  explanation: "<h3>Automated Root Cause Analysis</h3><p>The agent instantly cross-references the product batch number with supply chain records to pinpoint the exact source of the problem.</p><ul><li><b>vs. Manual:</b> This investigation would take a team days of sifting through spreadsheets and emails, delaying a critical safety response.</li></ul>",
                  challenge: "<h3>Data Silos & Integration</h3><p>Supply chain, manufacturing, and sales data often live in separate, incompatible legacy systems. Getting a single, unified view to perform a root cause analysis is a major technical hurdle.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>webMethods Hybrid Integration</strong> to create robust APIs that connect the agentic platform to various legacy and modern enterprise systems.</li><li>Leverage <strong>watsonx.data</strong> to create a virtualized data layer, allowing the agent to query these connected systems as if they were one.</li></ul>"
                },
                { text: "COLLABORATIVE ACTION: Procurement, Logistics, and Planner agents coordinate to issue return labels and notify distributors.", agent: ['procurement', 'logistics', 'planner'], bubble: ["planner", "Coordinating returns..."],
                  explanation: "<h3>Synchronized Multi-Agent Execution</h3><p>The system executes a complex, multi-departmental plan in parallel. Logistics halts shipments, Procurement notifies the supplier, and the Planner coordinates the overall response.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the slow, sequential hand-offs between departments, enabling a swift, unified response.</li></ul>",
                  challenge: "<h3>Workflow Orchestration & Reliability</h3><p>Coordinating multiple actions across different enterprise applications (e.g., ERP, WMS, CRM) is complex. A failure in one action could undermine the entire recall process.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to define the high-level business workflow.</li><li>Leverage <strong>webMethods Hybrid Integration</strong> to handle the low-level technical integrations between Orchestrate and the specific enterprise applications.</li></ul>"
                },
                { text: "📈 Learning agent analyzes the incident to identify supply chain weaknesses and improve future supplier vetting.", bubble: ["learning", "This must not happen again."], agent: "learning", type: 'learning',
                  explanation: "<h3>Adaptive Process Improvement</h3><p>The system learns from the failure. The agent analyzes the event and updates the company's risk models and supplier-vetting protocols to prevent similar incidents.</p><ul><li><b>vs. All Others:</b> This is a unique agentic capability. The system doesn't just fix the problem; it improves itself.</li></ul>",
                  challenge: "<h3>Governing Self-Improvement</h3><p>An agent that can change its own operational procedures is powerful but risky. How do you ensure its 'improvements' are genuinely better and don't introduce new vulnerabilities?</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Terraform</strong> to automatically provision a clean, consistent, and sandboxed test environment for any proposed process update.</li><li>Implement an <strong>AgentOps</strong> framework where updates are tested in the Terraform-provisioned environment before receiving human sign-off via <strong>watsonx.governance</strong>.</li></ul>"
                }
            ]
        },
        blackFridaySale: {
            name: "🛍️ Black Friday Sale",
            steps: [
                { text: "PROACTIVE GOAL: Planner agent sets the objective for a 'Black Friday Flash Sale'.", bubble: ["planner", "Let's run a flash sale!"], agent: "planner", type: 'optimized', handoffTo: "forecasting",
                  explanation: "<h3>Autonomous Goal Setting</h3><p>Based on the high-level goal of 'increase Q4 revenue', the Planner agent proactively devises a specific, actionable plan to achieve it.</p><ul><li><b>vs. Virtual Assistant:</b> You don't tell the system *how* to increase sales; you give it the goal, and it determines the best strategy.</li></ul>",
                  challenge: "<h3>Goal Alignment & Constraints</h3><p>How do we ensure the agent's goal of 'increase revenue' doesn't lead it to propose a strategy that violates other, unstated constraints, like 'maintain brand prestige' or 'don't cannibalize sales of new product lines'?</p><p><strong>Potential Solutions:</strong></p><ul><li>Define clear objectives, constraints, and guardrails for agents within <strong>watsonx.governance</strong>.</li><li>Use a human-in-the-loop workflow in <strong>watsonx Orchestrate</strong> to require management approval for any agent-initiated campaigns that exceed a certain budget threshold.</li></ul>"
                },
                { text: "📊 Forecasting agent predicts which products will have the highest demand elasticity.", bubble: ["forecasting", "These items will fly off the shelves."], agent: "forecasting", handoffTo: "procurement",
                  explanation: "<h3>Data-Driven Strategy</h3><p>The agent uses predictive analytics to determine which products to discount and by how much, maximizing revenue instead of just giving away margin.</p><ul><li><b>vs. Manual:</b> This replaces guesswork with a data-driven forecast, leading to a more profitable sales event.</li></ul>",
                  challenge: "<h3>Data Quality & Bias</h3><p>The forecast is only as good as the data it's trained on. If historical sales data is incomplete or reflects past biases, the agent's forecast will amplify those errors.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Vault</strong> to securely manage and audit the credentials the agent needs to access the governed data lakehouse.</li><li>Leverage <strong>watsonx.data</strong> to access a clean, centralized view of sales and inventory data.</li><li>Use the fairness and bias detection toolkits in <strong>watsonx.governance</strong> to inspect the model for hidden biases.</li></ul>"
                },
                { text: "📦 Logistics agent pre-positions the extra stock in regional hubs closest to predicted demand centers.", bubble: ["logistics", "Stock is in position."], agent: "logistics",
                  explanation: "<h3>Anticipatory Execution</h3><p>The agent acts on the forecast *before* the event. The Logistics agent moves inventory to where it will be needed, minimizing shipping times and costs once the sale is live.</p><ul><li><b>vs. Reactive Systems:</b> A traditional system ships orders after they are placed, leading to delays and higher costs.</li></ul>",
                  challenge: "<h3>Resource Optimization</h3><p>Moving physical inventory costs money. Pre-positioning too much stock based on a slightly inaccurate forecast can be wasteful. How does the system balance the benefit of speed with the cost of logistics?</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Terraform</strong> to manage the underlying cloud infrastructure for the forecasting models, ensuring resources are scaled efficiently.</li><li>Use <strong>Turbonomic</strong> to balance multiple key performance indicators (KPIs)—e.g., maximize revenue while keeping logistics costs below a set percentage.</li></ul>"
                },
                { text: "‼️ DYNAMIC RE-PLANNING: The top item is selling out too fast. Planner reallocates inventory from a lower-performing sale item.", bubble: ["planner", "Shifting inventory now!"], agent: "planner", type: 'event',
                  explanation: "<h3>Real-Time Adaptation</h3><p>The system monitors the live event and adapts its plan on the fly. When reality deviates from the forecast, the agent makes a real-time decision to reallocate resources.</p><ul><li><b>vs. RPA/Scripts:</b> A rigid script would continue with the original, now-suboptimal plan. It cannot dynamically re-plan.</li></ul>",
                  challenge: "<h3>System Stability & Performance</h3><p>Making real-time planning decisions during a peak sales event puts immense strain on underlying systems. A system failure or performance lag during the event would be disastrous.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Terraform</strong> to define infrastructure that can automatically scale to handle peak load, managed by a tool like <strong>Turbonomic</strong>.</li><li>Use <strong>Instana</strong> to provide full-stack observability of all applications, ensuring the system can handle the demand of the flash sale.</li></ul>"
                }
            ]
        }
    },
    // Define the branches for this industry
    branches: {
        approveBundle: [
          { text: "HUMAN INPUT: ✅ Bundle strategy approved. Planner is coordinating with Procurement to create new product bundles.", bubble: ["planner", "Creating new bundles."], agent: "planner", type: 'optimized', handoffTo: 'procurement',
            explanation: "<h3>Action from Approval</h3><p>With human oversight, the agentic system now executes the complex task of creating new product bundles in the inventory and e-commerce systems.</p>",
            challenge: "<h3>Complex Task Execution</h3><p>Creating a 'bundle' isn't one action; it involves updating inventory, pricing, e-commerce front-ends, and marketing materials. A failure in any one of these sub-tasks could lead to a broken customer experience.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to manage the entire sequence of bundle creation as a single, reliable workflow that can track the status of each sub-task and handle any errors.</li></ul>"
          }
        ],
        priceMatch: [
          { text: "HUMAN INPUT: ❌ Price Match initiated. This will protect market share but reduce profit margins by 8%.", bubble: ["planner", "Executing price match."], agent: "planner",
            explanation: "<h3>Executing Alternative Strategy</h3><p>The system respects the human decision and immediately pivots to the alternative strategy, updating pricing across all relevant sales channels.</p>",
            challenge: "<h3>Ensuring Consistent State</h3><p>When a price match is executed, the new price must be updated instantly and consistently across the website, mobile app, in-store POS systems, and marketing channels. Any inconsistency can lead to customer frustration and legal issues.</p><p><strong>Potential Solutions:</strong></p><ul><li>Deploy the pricing update logic as a containerized service managed by <strong>Instana</strong> to ensure consistent deployment and performance across all channels.</li><li>Use <strong>watsonx.governance</strong> to maintain an immutable log of all pricing changes for audit and compliance purposes.</li></ul>"
          }
        ]
    }
};

// --- (The rest of the JS framework is the same for all demos) ---

// --- CANVAS & DRAWING FUNCTIONS ---
let dashOffset = 0;
let animationFrameId = null;

function clearCanvas() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const canvas = document.getElementById('arrowCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArrow(fromId, toId, offset) {
  const canvas = document.getElementById('arrowCanvas');
  const container = document.querySelector('.dashboard-container'); 
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext('2d');

  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  
  if (!fromEl || !toEl) return;

  const containerPadding = parseFloat(window.getComputedStyle(container).paddingLeft);

  const startX = fromEl.offsetLeft + fromEl.offsetWidth / 2 - containerPadding;
  const startY = fromEl.offsetTop + fromEl.offsetHeight / 2 - containerPadding;
  const endX = toEl.offsetLeft + toEl.offsetWidth / 2 - containerPadding;
  const endY = toEl.offsetTop + toEl.offsetHeight / 2 - containerPadding;

  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#0f62fe';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.setLineDash([]);
  const angle = Math.atan2(endY - startY, endX - startX);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = '#0f62fe';
  ctx.fill();
}

function startArrowAnimation(fromId, toId) {
  dashOffset = 0;
  const animate = () => {
    dashOffset += 0.5;
    clearCanvas();
    drawArrow(fromId, toId, dashOffset);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
}

function showBubble(agent, msg) {
  const icons = { 'forecasting': '📊 ', 'diagnostics': '🛠️ ', 'planner': '🎯 ', 'procurement': '📝 ', 'logistics': '📦 ', 'learning': '🔁 '};
  const bubble = document.getElementById("bubble-" + agent);
  if (!bubble) return;
  bubble.textContent = '';
  bubble.className = 'bubble typing';
  setTimeout(() => {
    bubble.textContent = icons[agent] + msg;
    bubble.className = 'bubble show';
    setTimeout(() => { bubble.className = 'bubble shrink-out'; }, 2500);
  }, 800);
}

// --- UI & STATE MANAGEMENT FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function updateChallenges(htmlContent) {
    const challengesContainer = document.getElementById('challenges-text');
    challengesContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = config.branches[branchName];
  currentScenarioSteps.splice(stepIndex, 1, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);
  updateChallenges(step.challenge);

  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = `<p>${step.text}</p>`;
  
  step.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option.text;
    btn.onclick = () => handleHumanChoice(option.branch);
    humanInputContainer.appendChild(btn);
  });
}

function executeStep(step) {
  clearCanvas();
  const log = document.getElementById("scenarioLog");

  if (step.type === 'human_approval') {
    askForHumanInput(step);
    return;
  }
  
  updateExplanation(step.explanation || '<p>The agents are processing the next action...</p>');
  updateChallenges(step.challenge || '<p>No specific challenges highlighted for this step.</p>');


  const logEntry = document.createElement('div');
  logEntry.textContent = step.text;
  if (step.type === 'event') { logEntry.className = 'log-event'; }
  else if (step.type === 'learning') { logEntry.className = 'log-learning'; }
  else if (step.type === 'optimized') { logEntry.className = 'log-optimized'; }
  log.appendChild(logEntry);

  if (step.bubble) showBubble(step.bubble[0], step.bubble[1]);
  if (step.handoffTo) startArrowAnimation(step.agent, step.handoffTo);

  const agents = Array.isArray(step.agent) ? step.agent : [step.agent];
  agents.forEach(agentName => {
    if (agentName) {
      const cardEl = document.getElementById(agentName);
      if (cardEl) {
        const statusEl = cardEl.querySelector(".status");
        
        cardEl.classList.add("active");
        statusEl.textContent = "Active";
        statusEl.className = "status active";

        setTimeout(() => {
          cardEl.classList.remove("active");
          statusEl.textContent = "Idle";
          statusEl.className = "status idle";
        }, 2500);
      }
    }
  });
}

function nextStep() {
  if (isWaitingForHuman) return;

  if (stepIndex < currentScenarioSteps.length) {
    executeStep(currentScenarioSteps[stepIndex]);
    stepIndex++;
  } else {
    clearCanvas(); // Add this line to stop the animation
    document.getElementById('nextStepBtn').disabled = true;
    const log = document.getElementById("scenarioLog");
    const endMessage = document.createElement('p');
    endMessage.className = 'log-end';
    endMessage.innerHTML = '🏁 End of Scenario 🏁';
    if (!log.querySelector('.log-end')) {
        log.appendChild(endMessage);
    }
    updateExplanation('<h3>Scenario Complete</h3><p>The agentic system has successfully achieved its goal. It can now be tasked with a new objective or continue monitoring for new events.</p>');
    updateChallenges('<h3>Post-Scenario Review</h3><p>After a scenario, the full trace of agent actions, decisions, and tool usage would be reviewed by an AgentOps team to ensure performance, manage costs, and identify areas for improvement.</p>');
  }
}

function runScenario(type, btnElement) {
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('btn-active'));
  if (btnElement) btnElement.classList.add('btn-active');

  stepIndex = 0;
  isWaitingForHuman = false;
  currentScenarioSteps = config.scenarios[type].steps;

  document.getElementById('humanInputContainer').innerHTML = '';
  document.getElementById('nextStepBtn').disabled = false;
  const log = document.getElementById("scenarioLog");
  log.innerHTML = "";
  clearCanvas();
  updateExplanation('<p>Select a scenario and click "Next Step" to begin. This panel will update to explain the value of each agent action.</p>');
  updateChallenges('<p>This panel will highlight the operational challenges and risks associated with each agent action.</p>');
  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));

  const scenarioName = config.scenarios[type].name;
  log.innerHTML = `<p>[ Scenario loaded: <b>${scenarioName}</b>. Click 'Next Step' to begin. ]</p>`;
}

function setupScenarioButtons() {
    const buttonContainer = document.querySelector('.header-container div');
    if (!buttonContainer) return;
    buttonContainer.innerHTML = '';

    Object.keys(config.scenarios).forEach(key => {
        const scenario = config.scenarios[key];
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.innerHTML = scenario.name;
        btn.onclick = () => runScenario(key, btn);
        buttonContainer.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Load config into HTML
    document.title = config.title;
    document.querySelector('.header-container h1').textContent = config.title;
    document.querySelector('.header-container p').textContent = config.subtitle;

    config.agents.forEach(agent => {
        const h3 = document.getElementById(`${agent.id}-h3`);
        const desc = document.getElementById(`${agent.id}-desc`);
        const card = document.getElementById(agent.id);
        const bubble = document.getElementById(`bubble-${agent.id}`);

        if(h3 && desc && card && bubble) {
            h3.innerHTML = agent.name;
            desc.textContent = agent.desc;
            // IMPORTANT: Update the card and bubble IDs to the agent's functional key
            card.id = agent.key;
            bubble.id = `bubble-${agent.key}`;
        }
    });

    setupScenarioButtons();
    
    // Set a default scenario to run
    const firstScenarioKey = Object.keys(config.scenarios)[0];
    const firstButton = document.querySelector('.scenario-btn');
    if (firstScenarioKey && firstButton) {
        runScenario(firstScenarioKey, firstButton);
    }
});
