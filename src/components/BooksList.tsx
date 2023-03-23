import { Box, List, Stack } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';

export const BooksList: Component = () => {
  const items = createMemo(() => orderBy(values(books), 'listenDate', 'desc'));
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
