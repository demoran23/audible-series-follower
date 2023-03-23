import { trim } from 'lodash';
import { Book } from 'store/books';
import { DOMParser, HTMLImageElement } from 'linkedom';

const parser = new DOMParser();
export const getListenHistory = async (): Promise<Book[]> => {
  console.log('getListenHistory');
  const res = await fetch('https://www.audible.com/account/listen-history');
  const html = await res.text();
  const document = parser.parseFromString(html, 'text/html');
  const rows = document.querySelectorAll('.listenHistoryRow');
  const books = rows.map(extractBook);
  console.log('BOOKS', books);
  return books.filter((b) => b) as Book[];
};

function extractBook(element: HTMLElement): Book | null {
  const book: Partial<Book> = {};

  book.id = element.querySelector("input[name='asin']")!.getAttribute('value')!;
  if (book.id === 'id') return null;
  book.title = trim(
    element.querySelector<HTMLDivElement>(
      '.ui-it-listenhistory-item-title :first-child',
    )!.innerText,
  );
  const displayDate = element.querySelector<HTMLDivElement>(
    '.ui-it-listenhistory-item-listendate',
  )!.innerText;

  book.listenDate = new Date(displayDate).toISOString();
  book.imageUrl = element
    .querySelector<HTMLElement>('.account-details-image-no-shrink')!
    .getAttribute('src')!;
  book.type = 'book';
  return book as Book;
}
