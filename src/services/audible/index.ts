import { trim } from 'lodash';
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
  const seriesLink = element
    .querySelector<HTMLElement>("li[class*=seriesLabel] a[class^='bc-link']")
    ?.getAttribute('href');
  if (seriesLink) {
    const matches = /series\/.+\/(\w+)\?/[Symbol.match](seriesLink);
    book.seriesId = matches![1];
  }

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
    console.log('get series books', asin);
    // if (asin === 'B09MZKWFTB') debugger;
    const res = await fetch(`https://www.audible.com/series/${asin}`);
    if (res.status >= 300) {
      console.warn('FAILED to fetch series', asin);
      return [];
    }
    const html = await res.text();
    const document = parser.parseFromString(html, 'text/html');
    const rows = document.querySelectorAll(
      "div[data-widget='productList'] li[class*='productListItem']",
    );

    const books = rows.map(extractSeriesBook).filter((b) => b) as Book[];
    for (const book of books) {
      book.seriesId = asin;
      book.seriesName = trim(
        document.querySelector("h1[class*='bc-heading']")!.innerText,
      );
    }

    console.log('series books', asin, books);

    return books;
  } catch (e) {
    console.warn('Error with asin', asin, e);
    throw e;
  }
};

function extractSeriesBook(element: HTMLElement): Book | null {
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
    console.log(
      'wishlisted',
      element.querySelector<HTMLElement>(
        'span:not(.bc-hidden).adblGoToWishlistButton',
      )?.innerText,
    );
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

  return book as Book;
}
