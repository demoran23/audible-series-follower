import { onClear } from 'background/onClear';
import { onInitialize, onRefresh, refreshBooks } from 'background/onRefresh';
import { onShowApp } from 'background/onShowApp';
import { getOptions } from 'services/options';

for (const onMessage of [
  chrome.runtime.onMessageExternal,
  chrome.runtime.onMessage,
]) {
  for (const listener of [onShowApp, onRefresh, onInitialize, onClear]) {
    onMessage.addListener(listener);
  }
}
chrome.notifications.onClicked.addListener((id) => {
  console.log('handling notification by id', id);
  getOptions().then((o) => {
    if (id === 'login') {
      chrome.tabs.create({ url: `${o.audibleBaseUrl}/library/titles` });
    } else if (/^newbook:(.+)/.test(id)) {
      const asin = /^new:(.+)/[Symbol.match](id)![1];
      chrome.tabs.create({ url: `${o.audibleBaseUrl}/pd/${asin}` });
    } else if (/^released:(.+)/.test(id)) {
      const asin = /^released:(.+)/[Symbol.match](id)![1];
      chrome.tabs.create({ url: `${o.audibleBaseUrl}/pd/${asin}` });
    }
  });
  return true;
});

// Refresh data every day
chrome.alarms.create({ periodInMinutes: 60 * 24 });

// Run when extension starts
chrome.alarms.create({ when: Date.now() });

chrome.alarms.onAlarm.addListener((alarm) => {
  onRefresh({ type: 'refresh', data: null }, null as any, console.log);
  return true;
});
