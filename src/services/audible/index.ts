import { trim } from 'lodash';
import { getOptions } from 'services/options';
import { getBooksFromStorage } from 'services/storage';
import { Book } from 'store/books';
import { DOMParser } from 'linkedom';
import { parse as parseDate } from 'date-fns';

const parser = new DOMParser();
export interface OwnedBooksResult {
  nextUrl: string;
  isNextEnabled: boolean;
  books: Book[];
}
export const getOwnedBooks = async (url: URL): Promise<OwnedBooksResult> => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const document = parser.parseFromString(html, 'text/html');
    const rows = document.querySelectorAll(
      "div[id='adbl-library-content-main'] > div[class='adbl-library-content-row']",
    );

    const books = rows.map(extractOwnedBook);
    const owned = books.filter((b) => b) as Book[];

    const nextButton = document.querySelector("span[class*='nextButton']");

    return {
      isNextEnabled: !/bc-button-disabled/.test(nextButton.className),
      nextUrl: nextButton.querySelector('a').getAttribute('href'),
      books: owned,
    };
  } catch (e) {
    if (/failed to fetch/i.test((e as Error).message)) {
      chrome.notifications.create('login', {
        type: 'basic',
        title: 'Audible Series Follower',
        message: 'Please log back into Audible to continue to get updates',
        iconUrl: 'favicon-32x32.png',
      });
    }
    throw e;
  }
};

function extractOwnedBook(element: HTMLElement): Book | null {
  const book: Partial<Book> = {};
  book.status = 'owned';

  const id = element
    .querySelector("div[asin][class*='bc-rating-stars']")
    ?.getAttribute('asin');
  if (!id || id === 'id') {
    console.warn('MISSING ASIN for book:', element);
    return null;
  }
  book.id = id;
  book.title = trim(
    element.querySelector<HTMLDivElement>(
      "a[class*='bc-link'] span[class*='bc-size-headline3']",
    )!.innerText,
  );
  const seriesAnchor = element.querySelector<HTMLElement>(
    "li[class*=seriesLabel] a[class^='bc-link']",
  );
  const seriesLink = seriesAnchor?.getAttribute('href');
  if (seriesLink) {
    const matches = /series\/.+\/(\w+)\?/[Symbol.match](seriesLink);
    book.seriesId = matches![1];
  }
  book.seriesName = trim(seriesAnchor?.innerText);

  const rating = element
    .querySelector<HTMLElement>(
      "div[class*='bc-rating-stars'] span[class='bc-rating-star'][aria-checked='true']",
    )
    ?.getAttribute('data-index');
  book.rating = rating ? Number(rating) : null;

  book.link = element
    .querySelector<HTMLElement>("a[class*='bc-link']")!
    .getAttribute('href')!;

  book.imageUrl = element
    .querySelector<HTMLElement>('a img')!
    .getAttribute('src')!;

  book.type = 'book';

  return book as Book;
}

export const getSeriesBooks = async (asin: string): Promise<Book[]> => {
  try {
    const options = await getOptions();
    const url = `${options.audibleBaseUrl}/series/${asin}`;
    const res = await fetch(url);
    if (res.status >= 300) {
      console.warn('FAILED to fetch series', asin);
      return [];
    }
    const html = await res.text();
    const document = parser.parseFromString(html, 'text/html');
    return getSeriesBooksFromDocument(asin, document as unknown as Document);
  } catch (e) {
    console.warn('Error with asin', asin, e);
    throw e;
  }
};

export async function getSeriesBooksFromDocument(
  asin: string,
  document: Document,
) {
  const htmlElementNodeListOf = document.querySelectorAll<HTMLElement>(
    "div[data-widget='productList'] li[class*='productListItem']",
  );
  const rows = [...htmlElementNodeListOf];
  const books = (
    await Promise.all(rows.map((e) => extractSeriesBook(e)))
  ).filter((b) => b) as Book[];
  for (const book of books) {
    book.seriesId = asin;
    book.seriesName = trim(
      document.querySelector<HTMLElement>("h1[class*='bc-heading']")!.innerText,
    );
  }

  return books;
}
async function extractSeriesBook(element: HTMLElement): Promise<Book | null> {
  const book: Partial<Book> = {};

  const id = element.querySelector('div[data-asin]')?.getAttribute('data-asin');
  if (!id || id === 'id') {
    return null;
  }
  book.id = id;
  book.title = trim(
    element.querySelector<HTMLDivElement>("li h3[class*='bc-heading'] a")!
      .innerText,
  );
  const bookNumberHeader =
    element.querySelector<HTMLSpanElement>('div > div > h2.bc-heading')
      ?.innerText ?? '';
  const matches = /.*Book ([\d.]+)/[Symbol.match](trim(bookNumberHeader));
  if (matches) {
    book.number = Number(matches[1]);
  }

  book.link = element
    .querySelector<HTMLDivElement>("li h3[class*='bc-heading'] a")!
    .getAttribute('href')!;

  const releaseDateLabel = element.querySelector<HTMLElement>(
    "li[class*='releaseDateLabel']",
  )?.innerText;
  if (releaseDateLabel) {
    const stringDate = releaseDateLabel.split(':').map(trim)[1];
    book.releaseDate = parseDate(
      stringDate,
      'MM-dd-yy',
      new Date(),
    ).toISOString();
  }

  if (element.querySelector('span:not(.bc-hidden).adblBuyBoxInLibraryButton')) {
    book.status = 'owned';
  } else if (
    /in wish list/i.test(
      element.querySelector<HTMLElement>(
        'span:not(.bc-hidden).adblGoToWishlistButton',
      )?.innerText || '',
    )
  ) {
    book.status = 'wishlisted';
  } else if (
    /in your pre-orders/i.test(
      element.querySelector<HTMLElement>(
        'span:not(.bc-hidden).adblBuyBoxPreorderButton',
      )?.innerText || '',
    )
  ) {
    book.status = 'preordered';
  }

  book.imageUrl = element
    .querySelector<HTMLElement>('picture img')!
    .getAttribute('src')!;

  book.type = 'book';

  // Get the rating for existing books
  const existing = (await getBooksFromStorage([book.id]))[0];
  if (existing) {
    book.rating = existing.rating;
  }

  return book as Book;
}
