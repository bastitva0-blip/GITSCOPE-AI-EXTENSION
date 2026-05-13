/**
 * GitScope AI - Side Panel Script (Fixed)
 */

let currentTab = "beginner";
let currentResult = null;

// On load, ask background if there's a pending URL (from GitHub page button click)
document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ type: "GET_PENDING_URL" }, (response) => {
    if (response && response.repoUrl) {
      document.getElementById("urlInput").value = response.repoUrl;
      startAnalysis(response.repoUrl);
    }
  });

  // Also auto-populate from current tab if on GitHub
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.match(/github\.com\/[^/]+\/[^/]+/)) {
      const input = document.getElementById("urlInput");
      if (!input.value) input.value = tab.url;
    }
  });
});

// Listen for analyze requests relayed from background (fallback)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ANALYZE_REPO" && message.repoUrl) {
    document.getElementById("urlInput").value = message.repoUrl;
    startAnalysis(message.repoUrl);
  }
});

// Allow Enter key in input
document.getElementById("urlInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") triggerAnalyze();
});

function triggerAnalyze() {
  const url = document.getElementById("urlInput").value.trim();
  if (!url) return;
  startAnalysis(url);
}

function startAnalysis(repoUrl) {
  const btn = document.getElementById("analyzeBtn");
  btn.disabled = true;
  btn.textContent = "Analyzing...";

  showLoading("Fetching repository...");

  chrome.runtime.sendMessage(
    { type: "FETCH_ANALYSIS", repoUrl },
    (response) => {
      btn.disabled = false;
      btn.textContent = "Analyze";

      if (chrome.runtime.lastError) {
        showError("Extension error: " + chrome.runtime.lastError.message);
        return;
      }

      if (!response || !response.success) {
        showError(response?.error || "Analysis failed. Is the backend running on localhost:8000?");
        return;
      }

      currentResult = response.data;
      renderResults(response.data);
    }
  );
}

function showLoading(message) {
  document.getElementById("content").innerHTML = `
    <div class="loading">
      <div class="spinner-wrap">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="stage-label">${message}</div>
    </div>
  `;
}

function showError(message) {
  document.getElementById("content").innerHTML = `
    <div class="error">⚠️ ${message}</div>
  `;
}

function renderResults(data) {
  const meta = data.metadata || {};
  const issues = data.issues || [];
  const techStack = data.tech_stack || [];
  const summary = data.summary || {};

  const critCount = issues.filter((i) => i.severity === "critical").length;

  document.getElementById("content").innerHTML = `
    <div class="meta-bar">
      <div class="repo-name">${meta.name || "Repository"} ${data.cached ? '<span style="font-size:10px;color:#a78bfa">⚡ cached</span>' : ''}</div>
      <div class="repo-desc">${meta.description || ""}</div>
      <div class="meta-stats">
        <span>⭐ ${(meta.stars || 0).toLocaleString()}</span>
        <span>🔵 ${meta.language || "??"}</span>
        <span>📊 ${data.score || "N/A"}</span>
        ${critCount > 0 ? `<span style="color:#f87171">🔴 ${critCount} critical</span>` : ""}
      </div>
    </div>

    <div class="results">
      <div class="card">
        <div class="card-header" onclick="toggleCard(this)">
          <div class="card-title">📝 Summary</div>
          <div class="chevron open">▼</div>
        </div>
        <div class="card-body">
          ${summary.one_liner ? `<p style="color:#e2e8f0;font-size:12px;margin-bottom:10px;font-style:italic">${summary.one_liner}</p>` : ""}
          <div class="tab-row">
            <button class="tab-btn active" id="tab-beginner" onclick="switchTab('beginner')">🌱 Beginner</button>
            <button class="tab-btn" id="tab-expert" onclick="switchTab('expert')">🔬 Expert</button>
          </div>
          <div id="summary-text" class="summary-text">${summary.beginner || "No summary available."}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggleCard(this)">
          <div class="card-title">⚙️ Tech Stack <span style="color:#64748b;font-size:11px;font-weight:400">${techStack.length} detected</span></div>
          <div class="chevron open">▼</div>
        </div>
        <div class="card-body">
          <div class="tech-grid">
            ${techStack.map((t) => `
              <div class="tech-chip">
                <span>${t.icon || "⚙️"}</span>
                <span>${t.name}</span>
              </div>
            `).join("")}
            ${!techStack.length ? '<span style="color:#475569;font-size:11px">No technologies detected</span>' : ""}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggleCard(this)">
          <div class="card-title">🔍 Issues <span style="color:#64748b;font-size:11px;font-weight:400">${issues.length} found</span></div>
          <div class="chevron open">▼</div>
        </div>
        <div class="card-body">
          ${issues.length === 0
            ? '<div style="color:#4ade80;font-size:12px">✅ No issues detected — looks healthy!</div>'
            : issues.slice(0, 10).map((issue) => `
              <div class="issue-item issue-${issue.severity}">
                <div class="issue-title">${issue.title}</div>
                <div class="issue-desc">${issue.description}</div>
              </div>
            `).join("")
          }
        </div>
      </div>

      <div style="text-align:center;padding:12px 0 4px;">
        <a href="http://localhost:5173?repo=${encodeURIComponent(document.getElementById('urlInput').value)}"
           target="_blank"
           style="font-size:11px;color:#38bdf8;text-decoration:none;font-family:'JetBrains Mono',monospace;">
          Open full analysis →
        </a>
      </div>
    </div>
  `;

  window._summaryData = summary;
}

function toggleCard(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector(".chevron");
  const isOpen = chevron.classList.contains("open");

  if (isOpen) {
    body.style.display = "none";
    chevron.classList.remove("open");
    chevron.classList.add("closed");
  } else {
    body.style.display = "block";
    chevron.classList.remove("closed");
    chevron.classList.add("open");
  }
}

function switchTab(tab) {
  currentTab = tab;
  const summary = window._summaryData || {};

  document.getElementById("tab-beginner").className = `tab-btn${tab === "beginner" ? " active" : ""}`;
  document.getElementById("tab-expert").className = `tab-btn${tab === "expert" ? " active" : ""}`;
  document.getElementById("summary-text").textContent = summary[tab] || "No content.";
}