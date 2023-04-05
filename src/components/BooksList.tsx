import { Box, List, Stack } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { series } from 'store/series';

export const BooksList: Component = () => {
  console.log('list', series, books);
  const items = createMemo(
    () =>
      orderBy(
        values(books)
          .filter((b) => series[b.seriesId ?? '']?.following)
          .filter((b) => b.releaseDate && new Date(b.releaseDate) > new Date()),
        ['releaseDate'],
        'asc',
      ),
    [],
    { name: 'book list items' },
  );
  console.log('items', items());
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
        {(item, index) => <BookCard book={item} data-index={index()} />}
      </For>
    </Box>
  );
};
