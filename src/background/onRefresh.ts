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
  uniq,
  values,
} from 'lodash';
import { getOwnedBooks, getSeriesBooks } from 'services/audible';
import { getOptions } from 'services/options';
import {
  getBooksFromStorage,
  getFollowingsFromStorage,
  getSeriesFromStorage,
  setBooksInStorage,
  setFollowingsInStorage,
  setSeriesInStorage,
} from 'services/storage';
import { Book } from 'store/books';
import { Following } from 'store/following';
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

  getStorage().then(sendResponse).catch(console.error);

  return true;
};

export const refreshBooks = async () => {
  let storageBooks = await getBooksFromStorage();
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
    if (storageBooks.some((b) => result.books.some((r) => r.id === b.id)))
      break;
  } while (shouldContinue);
  await setBooksInStorage(ownedBooks);
  storageBooks = await getBooksFromStorage();
  const existingBooksWithSeries = storageBooks.filter(
    (b) => b.seriesId,
  ) as Book[];
  let storageSeries = await getSeriesFromStorage();
  // Seed new series
  const bookSeriesGroup = groupBy(existingBooksWithSeries, 'seriesId');
  for (const seriesId in bookSeriesGroup) {
    // If we've already added this series, don't bother
    if (storageSeries.some((s) => s.id === seriesId)) {
      continue;
    }

    // Add new series
    const group = bookSeriesGroup[seriesId];
    const series: Series = {
      type: 'series',
      bookIds: group.map((b) => b.id),
      id: seriesId,
      name: group[0].seriesName!,
    };
    await setSeriesInStorage([series]);
  }

  // Get the series books
  const following = await getFollowingsFromStorage();
  const seriesAsins = uniq(
    storageBooks
      .filter(
        (b) =>
          // Series that are either followed or don't have a following set yet
          following.find((f) => f.seriesId === b.seriesId)?.following !== false,
      )
      .filter((b) => b.seriesId)
      .map((b) => b.seriesId!)
      .filter(Boolean),
  );

  const chunks = chunk(seriesAsins, 10);
  storageSeries = await getSeriesFromStorage();
  for (const chunk of chunks) {
    const results = await Promise.allSettled(chunk.map(getSeriesBooks));
    const seriesBooksList = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as any).value);

    for (const seriesBooks of seriesBooksList as Book[][]) {
      if (!seriesBooks.some(Boolean)) {
        continue;
      }
      const series = storageSeries.find(
        (s) => s.id === seriesBooks[0]?.seriesId,
      ) as Series | undefined;

      // If our series doesn't know whether it should auto-follow or not
      if (
        series &&
        following.find((f) => f.seriesId === series.id)?.following === undefined
      ) {
        const autoFollowYearThreshold = 5;
        const following = seriesBooks
          .map((b) =>
            merge(
              {},
              storageBooks.find((sb) => sb.id === b.id),
              b,
            ),
          )
          .filter((b) => b.rating)
          .filter((b) => b.releaseDate)
          .filter(
            (b) =>
              new Date(b.releaseDate) >
              subYears(new Date(), autoFollowYearThreshold),
          )
          .some((b) => b.rating! >= 4);

        console.log(
          'Setting follow for series',
          series.name,
          following,
          series,
        );

        // Auto-follow
        await setFollowingsInStorage([
          {
            seriesId: series.id,
            following,
            type: 'following',
          },
        ]);
      }
    }

    const seriesBooks = keyBy(
      flatten(seriesBooksList).map((b) => merge({}, b, storageBooks[b.id])),
      'id',
    ) as { [k: string]: Book };

    const newlySeenBooks = omit(
      seriesBooks,
      storageBooks.map((b) => b.id),
    );
    for (const book of values(newlySeenBooks)
      .filter(Boolean)
      .filter((b) => new Date() < new Date(b.releaseDate))) {
      chrome.notifications.create(book.id, {
        type: 'basic',
        title: `A new audiobook is available in the ${book.seriesName} series.`,
        iconUrl: `${book.imageUrl}`,
        message: `${book.title}`,
      });
    }

    await setBooksInStorage(values(seriesBooks));
  }

  return await getStorage();
};

export interface Storage {
  books: { [key: string]: Book };
  series: { [key: string]: Series };
  following: { [key: string]: Following };
}
export const getStorage = async () => {
  const books = keyBy(await getBooksFromStorage(), 'id');
  const series = keyBy(await getSeriesFromStorage(), `id`);
  const following = keyBy(await getFollowingsFromStorage(), 'seriesId');

  const result: Storage = { books, series, following };
  console.log('STORAGE', result);

  return result;
};
