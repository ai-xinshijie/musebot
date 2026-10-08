/* popup.js
 * Tiny launcher: opens the full editor in a new tab.
 * No network, no tracking — this file only calls chrome.tabs.create. */
document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
  window.close();
});
