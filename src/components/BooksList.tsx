import { Box } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { followingStore } from 'store/following';
import { series } from 'store/series';

export const BooksList: Component = () => {
  const items = createMemo(
    () =>
      orderBy(
        values(books)
          .filter((b) => followingStore[b.seriesId ?? '']?.following)
          .filter((b) => b.releaseDate && new Date(b.releaseDate) > new Date()),
        ['releaseDate'],
        'asc',
      ),
    [],
  );

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
