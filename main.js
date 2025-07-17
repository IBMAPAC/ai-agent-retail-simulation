let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

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
  
  const containerPadding = parseFloat(window.getComputedStyle(container).paddingLeft);

  const startX = fromEl.offsetLeft + fromEl.offsetWidth / 2 - containerPadding;
  const startY = fromEl.offsetTop + fromEl.offsetHeight / 2 - containerPadding;
  const endX = toEl.offsetLeft + toEl.offsetWidth / 2 - containerPadding;
  const endY = toEl.offsetTop + toEl.offsetHeight / 2 - containerPadding;

  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#0f62fe';
  ctx.lineWidth = 2;

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
  // Updated icons for retail agents
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

// --- HUMAN INTERACTION & EXPLANATION FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = scenarios[branchName];
  currentScenarioSteps.splice(stepIndex, 0, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);

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
      const statusEl = document.getElementById(agentName).querySelector(".status");
      statusEl.textContent = "Active";
      statusEl.className = "status active";
      setTimeout(() => {
        statusEl.textContent = "Idle";
        statusEl.className = "status idle";
      }, 2500);
    }
  });
}

function nextStep() {
  if (isWaitingForHuman) return;

  if (stepIndex < currentScenarioSteps.length) {
    executeStep(currentScenarioSteps[stepIndex]);
    stepIndex++;
  } else {
    document.getElementById('nextStepBtn').disabled = true;
    const log = document.getElementById("scenarioLog");
    const endMessage = document.createElement('p');
    endMessage.className = 'log-end';
    endMessage.innerHTML = '🏁 End of Scenario 🏁';
    if (!log.querySelector('.log-end')) {
        log.appendChild(endMessage);
    }
    updateExplanation('<h3>Scenario Complete</h3><p>The agentic system has successfully achieved its goal. It can now be tasked with a new objective or continue monitoring for new events.</p>');
  }
}

let scenarios = {};

function runScenario(type, btnElement) {
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('btn-active'));
  if (btnElement) btnElement.classList.add('btn-active');

  stepIndex = 0;
  isWaitingForHuman = false;
  document.getElementById('humanInputContainer').innerHTML = '';
  document.getElementById('nextStepBtn').disabled = false;
  const log = document.getElementById("scenarioLog");
  log.innerHTML = "";
  clearCanvas();
  updateExplanation('<p>Select a scenario and click "Next Step" to begin. This panel will update to explain the value of each agent action.</p>');

  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });

  // --- RETAIL SCENARIO DEFINITIONS WITH EXPLANATIONS ---
  scenarios = {
    competitiveThreat: [
        { text: "‼️ COMPETITIVE ALERT: Forecasting agent detects a 20% price drop on a key product from our main rival, 'ShopSphere'.", bubble: ["forecasting", "Rival price drop detected!"], agent: "forecasting", type: 'event', handoffTo: "diagnostics", explanation: "<h3>Proactive Market Monitoring</h3><p>The agent autonomously scans competitor websites, press releases, and social media to detect strategic moves in real-time.</p><ul><li><b>vs. Manual:</b> A marketing team might discover this days later through manual checks, losing critical response time.</li><li><b>vs. RPA:</b> An RPA bot could scrape a price but can't understand the context or identify that 'ShopSphere' is a key rival without being explicitly programmed to.</li></ul>" },
        { text: "🛠️ Diagnostics agent analyzes market impact, predicting a 15% drop in our sales within 48 hours if no action is taken.", bubble: ["diagnostics", "Predicting market share loss."], agent: "diagnostics", handoffTo: "planner", explanation: "<h3>Automated Impact Analysis</h3><p>The agent immediately connects the competitor's action to our own sales data, running a predictive model to quantify the potential business impact.</p><ul><li><b>vs. Manual:</b> This automates the work of a data analyst, providing an instant, data-backed assessment of the threat level instead of a gut-feel reaction.</li></ul>" },
        { text: "🎯 Planner agent models three response strategies: Price Match, Value-Add Bundle, or Targeted Ad Campaign.", bubble: ["planner", "Modeling responses..."], agent: "planner", explanation: "<h3>Strategic Option Generation</h3><p>Instead of presenting just one path, the Planner agent generates multiple viable strategies, each with predicted outcomes for revenue, margin, and market share. It thinks like a business strategist.</p><ul><li><b>vs. Chatbot:</b> A chatbot could suggest generic ideas, but it cannot model the specific financial outcomes of each strategy based on real company data.</li></ul>" },
        { type: 'human_approval', text: 'Planner recommends a "Value-Add Bundle" strategy. It protects margins but requires quick execution. Please approve.', options: [{text: '✅ Approve Bundle', branch: 'approveBundle'}, {text: '❌ Initiate Price Match', branch: 'priceMatch'}], explanation: "<h3>Human-in-the-Loop Decision</h3><p>For a major strategic decision, the system presents its data-driven recommendation to a human for final approval. It acts as a trusted advisor, not just an automation tool.</p><ul><li><b>vs. RPA:</b> An RPA bot cannot handle this ambiguity; it would either stop or execute a single, pre-programmed path, potentially making a poor strategic choice.</li></ul>" }
    ],
    productRecall: [
        { text: "‼️ CRITICAL ALERT: Diagnostics agent flags a cluster of customer complaints linked to 'PowerUp' energy bars.", bubble: ["diagnostics", "Safety alert! Batch B-452."], agent: "diagnostics", type: 'event', handoffTo: "procurement", explanation: "<h3>Anomaly Detection in Unstructured Data</h3><p>The agent identifies a safety issue not from a structured report, but by detecting a statistically significant cluster of keywords (e.g., 'sick', 'unwell') in unstructured customer support tickets and social media posts.</p><ul><li><b>vs. Rule-Based System:</b> A simple keyword alert would create too much noise. The agent detects the pattern and connection between the complaints.</li></ul>" },
        { text: "📝 Procurement agent confirms the supplier used a faulty ingredient in batch B-452. A recall is necessary.", bubble: ["procurement", "Fault confirmed."], agent: "procurement", handoffTo: "planner", explanation: "<h3>Automated Root Cause Analysis</h3><p>The agent instantly cross-references the product batch number with supply chain records to pinpoint the exact source of the problem—the specific ingredient from a specific supplier.</p><ul><li><b>vs. Manual:</b> This investigation would take a team days of sifting through spreadsheets and emails, delaying a critical safety response.</li></ul>" },
        { text: "COLLABORATIVE ACTION: Procurement, Logistics, and Planner agents coordinate to issue return labels and notify distributors.", agent: ['procurement', 'logistics', 'planner'], bubble: ["planner", "Coordinating returns..."], explanation: "<h3>Synchronized Multi-Agent Execution</h3><p>The system executes a complex, multi-departmental plan in parallel. Logistics halts shipments, Procurement notifies the supplier, and the Planner coordinates the overall response simultaneously.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the slow, sequential hand-offs between departments, allowing for a swift and unified response to a crisis.</li></ul>" },
        { text: "📈 Learning agent analyzes the incident to identify supply chain weaknesses and improve future supplier vetting.", bubble: ["learning", "This must not happen again."], agent: "learning", type: 'learning', explanation: "<h3>Adaptive Process Improvement</h3><p>The system learns from the failure. The Learning agent analyzes the entire event chain and updates the company's internal risk models and supplier-vetting protocols to prevent similar incidents from happening again.</p><ul><li><b>vs. All Others:</b> This is a unique agentic capability. The system doesn't just fix the problem; it improves itself to become more resilient in the future.</li></ul>" }
    ],
    blackFridaySale: [
        { text: "PROACTIVE GOAL: Planner agent sets the objective for a 'Black Friday Flash Sale'.", bubble: ["planner", "Let's run a flash sale!"], agent: "planner", type: 'optimized', handoffTo: "forecasting", explanation: "<h3>Autonomous Goal Setting</h3><p>The agent team is not waiting for instructions. Based on the high-level company goal of 'increase Q4 revenue', the Planner agent proactively devises a specific, actionable plan to achieve it.</p><ul><li><b>vs. Virtual Assistant:</b> You don't tell the system *how* to increase sales; you give it the goal, and it determines the best strategy on its own.</li></ul>" },
        { text: "📊 Forecasting agent predicts which products will have the highest demand elasticity.", bubble: ["forecasting", "These items will fly off the shelves."], agent: "forecasting", handoffTo: "procurement", explanation: "<h3>Data-Driven Strategy</h3><p>The agent uses predictive analytics to determine which products to discount and by how much, ensuring the sale maximizes revenue instead of just giving away margin unnecessarily.</p><ul><li><b>vs. Manual:</b> This replaces guesswork or tedious analysis with a data-driven forecast, leading to a more profitable and effective sales event.</li></ul>" },
        { text: "📦 Logistics agent pre-positions the extra stock in regional hubs closest to predicted demand centers.", bubble: ["logistics", "Stock is in position."], agent: "logistics", explanation: "<h3>Anticipatory Execution</h3><p>The agentic system acts on the forecast *before* the event begins. The Logistics agent physically moves inventory to where it will be needed, minimizing shipping times and costs once the sale is live.</p><ul><li><b>vs. Reactive Systems:</b> A traditional system would only start shipping orders after they are placed, leading to delays and higher costs during a sales peak.</li></ul>" },
        { text: "‼️ DYNAMIC RE-PLANNING: The top item is selling out too fast. Planner reallocates inventory from a lower-performing sale item.", bubble: ["planner", "Shifting inventory now!"], agent: "planner", type: 'event', explanation: "<h3>Real-Time Adaptation</h3><p>The system monitors the live event and adapts its plan on the fly. When reality deviates from the forecast, the Planner agent makes a real-time decision to reallocate resources to maximize the overall goal.</p><ul><li><b>vs. RPA/Scripts:</b> A rigid script would continue with the original, now-suboptimal plan. It cannot dynamically re-plan based on live feedback.</li></ul>" }
    ],
    // Branches for human choice
    approveBundle: [
      { text: "HUMAN INPUT: ✅ Bundle strategy approved. Planner is coordinating with Procurement to create new product bundles.", bubble: ["planner", "Creating new bundles."], agent: "planner", type: 'optimized', handoffTo: 'procurement', explanation: "<h3>Action from Approval</h3><p>With human oversight, the agentic system now executes the complex task of creating new product bundles in the inventory and e-commerce systems, a task that would typically require manual coordination between multiple teams.</p>" }
    ],
    priceMatch: [
      { text: "HUMAN INPUT: ❌ Price Match initiated. This will protect market share but reduce profit margins by 8%.", bubble: ["planner", "Executing price match."], agent: "planner", explanation: "<h3>Executing Alternative Strategy</h3><p>The system respects the human decision and immediately pivots to the alternative strategy. It automatically updates pricing across all relevant sales channels, ensuring a swift and consistent response.</p>" }
    ]
  };

  currentScenarioSteps = scenarios[type];

  // Update button list based on new scenarios
  const buttonContainer = document.querySelector('.header-container div');
  buttonContainer.innerHTML = '';
  Object.keys(scenarios).forEach(key => {
    if (!key.startsWith('approve') && !key.startsWith('priceMatch')) {
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        
        let emoji = '⚙️';
        if (key === 'competitiveThreat') emoji = '⚔️';
        if (key === 'productRecall') emoji = '⚠️';
        if (key === 'blackFridaySale') emoji = '🛍️';
        let name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        btn.innerHTML = `${emoji} ${name}`;
        btn.onclick = () => runScenario(key, btn);
        buttonContainer.appendChild(btn);
    }
  });

  const newActiveBtn = Array.from(buttonContainer.children).find(btn => btn.textContent.includes(type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())));
  if(newActiveBtn) newActiveBtn.classList.add('btn-active');
  
  log.innerHTML = `<p>[ Scenario loaded: <b>${type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</b>. Click 'Next Step' to begin. ]</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
    runScenario('competitiveThreat', null);
    const firstButton = document.querySelector('.scenario-btn');
    if (firstButton) {
        firstButton.classList.add('btn-active');
    }
});
