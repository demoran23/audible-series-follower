import { IMessage } from 'background/IMessage';

export type ExtensionMessageEventHandler = (
  message: IMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) => void;
