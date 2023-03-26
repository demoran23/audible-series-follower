import { createStore } from 'solid-js/store';

export interface IType {
  type: 'book';
}
export interface Book extends IType {
  title: string;
  listenDate: string;
  id: string;
  imageUrl: string;
  link: string;
  seriesId: string | undefined | null;
  seriesName: string | undefined | null;
  rating: number | undefined | null;
  status: 'owned' | 'wishlisted' | 'preordered' | undefined;

  // iso date
  releaseDate: string;
}
export interface Series extends IType {
  id: string;
  name: string;
  bookIds: string[];
}

export interface BooksStore {
  [id: string]: Book;
}

export const [books, setBooks] = createStore<BooksStore>({});
