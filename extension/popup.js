document.getElementById("openBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.sidePanel.setOptions({
      tabId: tabs[0].id,
      path: "sidepanel.html",
      enabled: true,
    });
    chrome.sidePanel.open({ tabId: tabs[0].id });
    window.close();
  });
});