import { ExtensionMessageEventHandler } from 'background/ExtensionMessageEventHandler';
import { subYears } from 'date-fns';
import {
  chunk,
  flatten,
  groupBy,
  keyBy,
  keys,
  merge,
  omit,
  values,
} from 'lodash';
import { getOwnedBooks, getSeriesBooks } from 'services/audible';
import { getOptions } from 'services/options';
import { Book } from 'store/books';
import { IType } from 'store/IType';
import { Series } from 'store/series';

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
  let existing = (await chrome.storage.local.get()) as {
    [key: string]: Book | Series;
  };
  const options = await getOptions();
  // Get our owned books
  let shouldContinue = false;
  let url = new URL(`${options.audibleBaseUrl}/library/titles?pageSize=50`);

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

  await chrome.storage.local.set(keyBy(ownedBooks, 'id'));
  existing = await chrome.storage.local.get();
  const existingBooks = values(existing)
    .filter(Boolean)
    .filter((s) => s.type === 'book')
    .filter((b) => (b as Book).seriesId) as Book[];

  // Seed new series
  const bookSeriesGroup = groupBy(existingBooks, 'seriesId');
  for (const seriesId in bookSeriesGroup) {
    // If we've already added this series, don't bother
    if (existing[seriesId]) {
      continue;
    }

    // Add new series
    const group = bookSeriesGroup[seriesId];
    const series: Series = {
      type: 'series',
      bookIds: group.map((b) => b.id),
      id: seriesId,
      following: undefined,
      name: group[0].seriesName!,
    };
    await chrome.storage.local.set({ [seriesId]: series });
  }

  // Get the series books
  existing = await chrome.storage.local.get();
  const seriesAsins = values(existing)
    .filter(Boolean)
    .filter((b) => b.type === 'series')
    .filter((b) => [true, undefined].includes((b as Series).following))
    .map((b) => b.id);

  const chunks = chunk(seriesAsins, 10);
  for (const chunk of chunks) {
    const results = await Promise.allSettled(chunk.map(getSeriesBooks));
    const seriesBooksList = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as any).value);

    for (const seriesBooks of seriesBooksList as Book[][]) {
      if (!seriesBooks.some(Boolean)) {
        continue;
      }
      const series = existing[seriesBooks[0]?.seriesId ?? ''] as
        | Series
        | undefined;
      // If our series doesn't know whether it should auto-follow or not
      if (series && series.following === undefined) {
        const autoFollowYearThreshold = 5;
        const following = seriesBooks
          .map((b) => merge({}, existing[b.id], b))
          .filter((b) => b.rating)
          .filter((b) => b.releaseDate)
          .filter(
            (b) =>
              new Date(b.releaseDate) >
              subYears(new Date(), autoFollowYearThreshold),
          )
          .some((b) => b.rating! >= 4);

        // Auto-follow
        await chrome.storage.local.set({
          [series.id]: {
            ...series,
            name: seriesBooks[0]?.seriesName,
            following,
          },
        });
      }
    }

    const seriesBooks = keyBy(
      flatten(seriesBooksList).map((b) => merge({}, b, existing[b.id])),
      'id',
    );

    const newlySeenBooks = omit(
      seriesBooks,
      values(existing)
        .filter(Boolean)
        .map((b) => b.id),
    );
    for (const book of values(newlySeenBooks as Book[])
      .filter(Boolean)
      .filter((b) => new Date() < new Date(b.releaseDate))) {
      console.log('new book notification', book);
      chrome.notifications.create(
        book.id,
        {
          type: 'basic',
          title: `A new audiobook is available in the ${book.seriesName} series.`,
          iconUrl: `${book.imageUrl}`,
          message: `${book.title}`,
        },
        (id) =>
          console.log('created notification', id, chrome.runtime.lastError),
      );
    }

    await chrome.storage.local.set(seriesBooks);
  }

  return await getBooksFromStorage();
};

export const getBooksFromStorage = async () => {
  const sync = await chrome.storage.local.get(null);
  const books = keyBy(
    values(sync).filter((t: IType<'book'>) => t.type === 'book'),
    'id',
  );
  const series = keyBy(
    values(sync).filter((t: IType<'series'>) => t.type === 'series'),
    'id',
  );
  console.log('SYNC', sync, books, series);
  return { books, series };
};
