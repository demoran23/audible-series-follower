import { Box } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { followingStore } from 'store/following';
import { series } from 'store/series';
import { titleFilter } from 'store/titleFilter';

export const BooksList: Component = () => {
  const items = createMemo(
    () =>
      orderBy(
        values(books)
          .filter(
            (b) =>
              !titleFilter() ||
              [b.seriesName, b.title]
                .filter(Boolean)
                .some((title) => new RegExp(titleFilter()!, 'i').test(title!)),
          )
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
