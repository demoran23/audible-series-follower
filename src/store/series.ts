import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { IType } from 'store/IType';

export interface Series extends IType<'series'> {
  id: string;
  name: string;
  bookIds: string[];
  following: boolean | undefined;
  type: 'series';
}

export interface SeriesStore {
  [id: string]: Series;
}

export const [series, setSeries] = createStore<SeriesStore>({});

// When we update our series, update local storage with the series values
createEffect(() => chrome.storage.local.set(series));
