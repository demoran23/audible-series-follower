import { createStore } from 'solid-js/store';

export interface IType {
  type: 'book';
}
export interface Book extends IType {
  title: string;
  listenDate: string;
  id: string;
  imageUrl: string;
}

export interface BooksStore {
  [id: string]: Book;
}

export const [books, setBooks] = createStore<BooksStore>({});
