import { Box } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { SeriesCard } from 'components/SeriesCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { followingStore } from 'store/following';
import { series } from 'store/series';

export const SeriesList: Component<{ following: boolean }> = (props) => {
  const items = orderBy(
    values(series)
      .filter(Boolean)
      .filter(
        (s) => !!followingStore[`${s.id}`]?.following === props.following,
      ),
    ['name'],
    'asc',
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
      <For each={items}>
        {(item, index) => <SeriesCard series={item} data-index={index()} />}
      </For>
    </Box>
  );
};
