import { ExtensionMessageEventHandler } from 'background/ExtensionMessageEventHandler';
import { keyBy, values } from 'lodash';
import { getListenHistory } from 'services/audible';
import { IType } from 'store/books';

export const onRefresh: ExtensionMessageEventHandler = (
  msg,
  _,
  sendResponse,
) => {
  if (msg.type !== 'refresh') return false;

  refreshBooks().then(sendResponse).catch(console.error);

  return true;
};
export const onInitialize: ExtensionMessageEventHandler = (
  msg,
  _,
  sendResponse,
) => {
  if (msg.type !== 'initialize') return false;

  getBooksFromStorage().then(sendResponse).catch(console.error);

  return true;
};

export const refreshBooks = async () => {
  const history = await getListenHistory();
  await chrome.storage.sync.set(keyBy(history, 'id'));
  return await getBooksFromStorage();
};

export const getBooksFromStorage = async () => {
  const sync = await chrome.storage.sync.get(null);
  const books = keyBy(
    values(sync).filter((t: IType) => t.type === 'book'),
    'id',
  );
  console.log('SYNC', sync, books);
  return books;
};
