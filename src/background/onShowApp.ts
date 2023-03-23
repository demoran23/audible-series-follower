import { IMessage } from 'background/IMessage';

export const onShowApp = async (msg: IMessage) => {
  if (msg.type !== 'show-app') return false;

  await chrome.tabs
    .create({
      url: chrome.runtime.getURL('index.html'),
    })
    .catch(console.error);

  return true;
};
