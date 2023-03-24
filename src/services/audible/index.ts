import { HTMLDocument } from 'linkedom/types/html/document';
import { trim } from 'lodash';
import { Book } from 'store/books';
import { DOMParser, HTMLImageElement } from 'linkedom';

const parser = new DOMParser();
export const getLibraryBooks = async (): Promise<Book[]> => {
  console.log('getLibraryBooks');
  const res = await fetch('https://www.audible.com/library/titles');
  const html = await res.text();
  const document = parser.parseFromString(html, 'text/html');
  const rows = document.querySelectorAll(
    "div[id='adbl-library-content-main'] > div[class='adbl-library-content-row']",
  );

  const books = rows.map((r) => extractBook(document, r));
  const owned = books.filter((b) => b) as Book[];

  for (const book of owned) book.owned = true;

  return owned;
};

function extractBook(
  document: HTMLDocument,
  element: HTMLElement,
): Book | null {
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
