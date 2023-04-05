import { onInitialize, onRefresh, refreshBooks } from 'background/onRefresh';
import { onShowApp } from 'background/onShowApp';

for (const onMessage of [
  chrome.runtime.onMessageExternal,
  chrome.runtime.onMessage,
]) {
  for (const listener of [onShowApp, onRefresh, onInitialize]) {
    onMessage.addListener(listener);
  }
}

// Refresh data every day
chrome.alarms.create({ periodInMinutes: 60 * 24 });

// Run when extension starts
chrome.alarms.create({ when: Date.now() });

chrome.alarms.onAlarm.addListener((alarm) => {
  refreshBooks().catch(console.error);
  // return getBooksFromStorage().catch(console.error);
  return true;
});
