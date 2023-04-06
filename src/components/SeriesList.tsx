import { Box } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { SeriesCard } from 'components/SeriesCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { series } from 'store/series';

export const SeriesList: Component<{ following: boolean }> = (props) => {
  const items = createMemo(
    () =>
      orderBy(
        values(series)
          .filter(Boolean)
          .filter((s) => s.following === props.following),
        ['name'],
        'asc',
      ),
    [],
    { name: 'series list items' },
  );
  console.log('SeriesList', items);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        minWidth: 775,
      }}
    >
      <For each={items()}>
        {(item, index) => <SeriesCard series={item} data-index={index()} />}
      </For>
    </Box>
  );
};
