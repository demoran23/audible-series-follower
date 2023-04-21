import { IMessage } from 'background/IMessage';

export const onClear = async (msg: IMessage) => {
  if (msg.type !== 'clear') return false;

  chrome.storage.local.clear().catch(console.error);

  return true;
};
