import { ToggleFollowButton } from 'components/ToggleFollowButton';
import { isEqual, keyBy, values } from 'lodash';
import { getSeriesBooksFromDocument } from 'services/audible';
import {
  getFollowingsFromStorage,
  getSeriesFromStorage,
  setBooksInStorage,
  setFollowingsInStorage,
  setSeriesInStorage,
} from 'services/storage';
import { createEffect } from 'solid-js';
import { render } from 'solid-js/web';
import { followingStore, setFollowing } from 'store/following';

setFollowing(keyBy(await getFollowingsFromStorage(), 'seriesId'));

// When we update our followingStore, update storage as well
createEffect(async () => {
  const followings = values(followingStore);
  await setFollowingsInStorage(followings);
});

const parent = document.querySelector('.bc-container h1');
if (!parent) {
  console.log('MISSING PARENT CONTAINER');
}
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
