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

chrome.alarms.create({ periodInMinutes: 60 * 24 });

chrome.alarms.onAlarm.addListener((alarm) => {
  refreshBooks().catch(console.error);
  return true;
});
