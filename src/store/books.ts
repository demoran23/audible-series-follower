import { createStore } from 'solid-js/store';
import { IType } from 'store/IType';

export interface Book extends IType<'book'> {
  type: 'book';
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

export interface BooksStore {
  [id: string]: Book;
}

export const [books, setBooks] = createStore<BooksStore>({});
