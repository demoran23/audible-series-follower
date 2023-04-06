import { createStore } from 'solid-js/store';
import { IType } from 'store/IType';

export interface Series extends IType<'series'> {
  id: string;
  name: string;
  bookIds: string[];
  type: 'series';
}

export interface SeriesStore {
  [id: string]: Series;
}
export const [series, setSeries] = createStore<SeriesStore>({});
