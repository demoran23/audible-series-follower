import { ExtensionMessageEventHandler } from 'background/ExtensionMessageEventHandler';
import { flatten, keyBy, uniq, values, merge } from 'lodash';
import { getOwnedBooks, getSeriesBooks } from 'services/audible';
import { Book, IType } from 'store/books';

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
  const existing = await chrome.storage.local.get();
  // Get our owned books
  let shouldContinue = false;
  let url = new URL('https://www.audible.com/library/titles?pageSize=50');

  const ownedBooks: Book[] = [];
  do {
    const result = await getOwnedBooks(url);
    console.log('result', result);
    shouldContinue = result.isNextEnabled;
    url = new URL(`${url.origin}${result.nextUrl}`);
    ownedBooks.push(...result.books);

    // If we already have the last book that was returned, don't bother asking for more,
    // since they're chronologically ordered on the page
    if (existing[result.books[result.books.length - 1].id]) break;
  } while (shouldContinue);

  const items = keyBy(ownedBooks, 'id');
  console.log('items:', Object.keys(items).length, items);
  await chrome.storage.local.set(items);

  // Get the series books
  const seriesAsins = uniq([
    ...ownedBooks.map((b) => b.seriesId),
    ...Object.values(existing)
      .filter((b) => b.type === 'book')
      .map((b) => b.seriesId),
  ]).filter((a) => a) as string[];

  console.log('seriesAsins', seriesAsins);

  for (const asin of seriesAsins) {
    const books = await getSeriesBooks(asin);
    const obj = keyBy(
      books.map((b) => merge(b, existing[b.id])),
      'id',
    );
    console.log('setting', asin, obj);
    await chrome.storage.local.set(obj);
  }

  return await getBooksFromStorage();
};

export const getBooksFromStorage = async () => {
  const sync = await chrome.storage.local.get(null);
  const books = keyBy(
    values(sync).filter((t: IType) => t.type === 'book'),
    'id',
  );
  console.log('SYNC', sync, books);
  return books;
};
