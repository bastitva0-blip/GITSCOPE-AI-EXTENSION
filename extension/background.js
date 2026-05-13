/**
 * GitScope AI - Background Service Worker (Fixed)
 */

const API_BASE = "http://localhost:8000/api";

// Store pending repo URL so sidepanel can fetch it after it loads
let pendingRepoUrl = null;

// Open side panel when action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Content script clicked "Analyze" on GitHub page
  if (message.type === "OPEN_SIDEPANEL") {
    pendingRepoUrl = message.repoUrl;
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ success: true });
    return true;
  }

  // Sidepanel asking if there's a pending URL to analyze
  if (message.type === "GET_PENDING_URL") {
    const url = pendingRepoUrl;
    pendingRepoUrl = null;
    sendResponse({ repoUrl: url });
    return true;
  }

  // Sidepanel requesting analysis
  if (message.type === "FETCH_ANALYSIS") {
    fetchAnalysis(message.repoUrl)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function fetchAnalysis(repoUrl) {
  const cacheKey = `gitscope:${repoUrl}`;
  const cached = await chrome.storage.local.get(cacheKey);

  if (cached[cacheKey]) {
    const { data, timestamp } = cached[cacheKey];
    if (Date.now() - timestamp < 3600000) {
      return { ...data, cached: true };
    }
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Analysis failed");
  }

  const data = await response.json();

  await chrome.storage.local.set({
    [cacheKey]: { data, timestamp: Date.now() },
  });

  return data;
}