import { trim } from 'lodash';
import { Book } from 'store/books';
import { DOMParser } from 'linkedom';
import { parse as parseDate } from 'date-fns';
import { uniq, uniqBy, flatten } from 'lodash';

const parser = new DOMParser();
export const getOwnedBooks = async (): Promise<Book[]> => {
  console.log('getLibraryBooks');
  const res = await fetch('https://www.audible.com/library/titles');
  const html = await res.text();
  const document = parser.parseFromString(html, 'text/html');
  const rows = document.querySelectorAll(
    "div[id='adbl-library-content-main'] > div[class='adbl-library-content-row']",
  );

  const books = rows.map(extractOwnedBook);
  const owned = books.filter((b) => b) as Book[];

  for (const book of owned) book.owned = true;

  const seriesAsins = uniq(owned.map((b) => b.seriesId)) as string[];
  console.log({ books: owned.length, series: seriesAsins.length });
  const seriesBooks = await Promise.all(seriesAsins.map(getSeriesBooks));
  console.log('seriesBooks', seriesBooks);
  return uniqBy(flatten([...owned, ...seriesBooks]), 'id');
};

function extractOwnedBook(element: HTMLElement): Book | null {
  const book: Partial<Book> = {};

  book.id = element
    .querySelector("div[asin][class*='bc-rating-stars']")!
    .getAttribute('asin')!;
  if (book.id === 'id') return null;

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
  console.log('getLibraryBooks');
  const res = await fetch(`https://www.audible.com/series/${asin}`);
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

  return books;
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

  book.owned = !!element.querySelector(
    "span[class*='adblBuyBoxInLibraryButton']",
  );
  book.imageUrl = element
    .querySelector<HTMLElement>('picture img')!
    .getAttribute('src')!;

  book.type = 'book';

  return book as Book;
}
