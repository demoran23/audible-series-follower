import { keyBy, values } from 'lodash';
import { Book } from 'store/books';
import { Following } from 'store/following';
import { Series } from 'store/series';

export const getFollowingsFromStorage = async (
  seriesIds: string[] | undefined = undefined,
): Promise<Following[]> => {
  const items = values(await chrome.storage.local.get())
    .filter((i) => i.type === 'following')
    .filter(Boolean) as Following[];
  if (!seriesIds) return items;
  return items.filter((b) => seriesIds.includes(b.seriesId));
};

export const setFollowingsInStorage = async (followings: Following[]) => {
  const items = keyBy(followings, (f) => `following:${f.seriesId}`);
  return chrome.storage.local.set(items);
};

export const getBooksFromStorage = async (
  ids: string[] | undefined = undefined,
): Promise<Book[]> => {
  const items = values(await chrome.storage.local.get())
    .filter((i) => i.type === 'book')
    .filter(Boolean) as Book[];
  if (!ids) return items;
  return items.filter((b) => ids.includes(b.id));
};

export const setBooksInStorage = async (books: Book[]) => {
  const items = keyBy(books, (b) => `book:${b.id}`);
  return chrome.storage.local.set(items);
};

export const getSeriesFromStorage = async (
  ids: string[] | undefined = undefined,
): Promise<Series[]> => {
  const items = values(await chrome.storage.local.get())
    .filter((i) => i.type === 'series')
    .filter(Boolean) as Series[];
  if (!ids) return items;
  return items.filter((b) => ids.includes(b.id));
};

export const setSeriesInStorage = async (series: Series[]) => {
  const items = keyBy(series, (s) => `series:${s.id}`);
  return chrome.storage.local.set(items);
};
