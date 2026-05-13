/**
 * GitScope AI - Content Script
 * Detects GitHub repo pages and injects the "Analyze Repo" button
 */

(function () {
  "use strict";

  let injected = false;

  function getRepoUrl() {
    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;
    return `https://github.com${location.pathname}`;
  }

  function injectButton() {
    const repoUrl = getRepoUrl();
    if (!repoUrl || injected) return;

    // Find the repo action buttons container
    const targets = [
      "#repository-details-container .BtnGroup",
      ".pagehead-actions",
      "nav[aria-label='Repository'] ul",
      ".file-navigation",
    ];

    let container = null;
    for (const sel of targets) {
      container = document.querySelector(sel);
      if (container) break;
    }

    if (!container) return;

    // Don't inject twice
    if (document.getElementById("gitscope-btn")) return;

    const btn = document.createElement("button");
    btn.id = "gitscope-btn";
    btn.className = "gitscope-analyze-btn";
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <span>Analyze with AI</span>
    `;

    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.innerHTML = `<span class="gitscope-spinner"></span><span>Opening...</span>`;

      chrome.runtime.sendMessage({
        type: "OPEN_SIDEPANEL",
        repoUrl,
      }, () => {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Analyze with AI</span>
          `;
        }, 1500);
      });
    });

    // Insert before container's first child or append
    container.insertBefore(btn, container.firstChild);
    injected = true;
  }

  // Run on page load
  injectButton();

  // Re-run on navigation (GitHub is an SPA)
  const observer = new MutationObserver(() => {
    injected = false;
    injectButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
