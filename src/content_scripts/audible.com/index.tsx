import { Favorite, FavoriteBorder } from '@suid/icons-material';
import { Checkbox } from '@suid/material';
import { SwitchBaseProps } from '@suid/material/internal/SwitchBaseProps';
import { keyBy } from 'lodash';
import { getSeriesBooksFromDocument } from 'services/audible';
import { Component, createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { Series } from 'store/series';

const FollowButton: Component<{ series: Series }> = (props) => {
  const [checked, setChecked] = createSignal(props.series.following);
  const onClick: SwitchBaseProps['onChange'] = async (e, value) => {
    const items = {
      [props.series.id]: { ...props.series, following: value },
    };
    await chrome.storage.local.set(items);
    setChecked(value);
  };
  return (
    <Checkbox
      checked={checked()}
      onChange={onClick}
      icon={<FavoriteBorder />}
      checkedIcon={<Favorite />}
    />
  );
};
const parent = document.querySelector('.bc-container h1');
if (parent) {
  const mountPoint = document.createElement('span');
  mountPoint.id = 'audible-series-follower-follow-button';
  const asin = document
    .querySelector("form[data-form-id='asin'] input[name='asin']")!
    .getAttribute('value')!;
  const storageResult = await chrome.storage.local.get(asin);
  let series = storageResult[asin] as Series | undefined;

  if (!series) {
    const books = await getSeriesBooksFromDocument(asin, window.document);
    console.log('BOOKS', { asin, books });

    series = {
      following: false,
      name: books[0].seriesName!,
      id: asin,
      bookIds: books.map((b) => b.id),
      type: 'series',
    };
    await chrome.storage.local.set({ [asin]: series });
    await chrome.storage.local.set(keyBy(books, 'id'));
  }

  render(() => <FollowButton series={series!} />, mountPoint);
  parent.append(mountPoint);
}

export {};
