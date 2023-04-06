import { ToggleFollowButton } from 'components/ToggleFollowButton';
import { keyBy } from 'lodash';
import { getSeriesBooksFromDocument } from 'services/audible';
import {
  getSeriesFromStorage,
  setBooksInStorage,
  setSeriesInStorage,
} from 'services/storage';
import { render } from 'solid-js/web';

const parent = document.querySelector('.bc-container h1');
if (parent) {
  const mountPoint = document.createElement('span');
  mountPoint.id = 'audible-series-follower-follow-button';
  const asin = document
    .querySelector("form[data-form-id='asin'] input[name='asin']")!
    .getAttribute('value')!;
  let series = (await getSeriesFromStorage([asin]))[0];

  if (!series) {
    const books = await getSeriesBooksFromDocument(asin, window.document);

    series = {
      name: books[0].seriesName!,
      id: asin,
      bookIds: books.map((b) => b.id),
      type: 'series',
    };
    await setSeriesInStorage([series]);
    await setBooksInStorage(books);
  }

  render(() => <ToggleFollowButton series={series!} />, mountPoint);
  parent.append(mountPoint);
}

export {};
