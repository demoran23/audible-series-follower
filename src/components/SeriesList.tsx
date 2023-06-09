import { Box, Stack } from '@suid/material';
import { SeriesCard } from 'components/SeriesCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { followingStore } from 'store/following';
import { series } from 'store/series';
import { titleFilter } from 'store/titleFilter';

export const SeriesList: Component<{ following: boolean }> = (props) => {
  const items = createMemo(
    () =>
      orderBy(
        values(series)
          .filter(Boolean)
          .filter(
            (s) =>
              !titleFilter() || new RegExp(titleFilter()!, 'i').test(s.name),
          )
          .filter(
            (s) => !!followingStore[`${s.id}`]?.following === props.following,
          ),
        ['name'],
        'asc',
      ),
    [],
  );
  return (
    <Stack direction={'row'} flexWrap={'wrap'} justifyContent={'center'}>
      <For each={items()}>
        {(item, index) => <SeriesCard series={item} data-index={index()} />}
      </For>
    </Stack>
  );
};
