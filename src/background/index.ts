import { onInitialize, onRefresh, refreshBooks } from 'background/onRefresh';
import { onShowApp } from 'background/onShowApp';
import { getOptions } from 'services/options';

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
  return true;
});

chrome.notifications.onClicked.addListener((id) => {
  getOptions().then((o) => {
    chrome.tabs.create({ url: `${o.audibleBaseUrl}/pd/${id}` });
  });
});
