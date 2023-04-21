import { Box, Stack } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { subDays } from 'date-fns';
import { orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { books } from 'store/books';
import { followingStore } from 'store/following';
import { titleFilter } from 'store/titleFilter';

export const UpcomingList: Component = () => {
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
          .filter(
            (b) =>
              b.releaseDate && new Date(b.releaseDate) > subDays(new Date(), 2),
          ),
        ['releaseDate'],
        'asc',
      ),
    [],
  );

  return (
    <Stack direction={'row'} flexWrap={'wrap'} justifyContent={'center'}>
      <For each={items()}>
        {(item, index) => <BookCard book={item} data-index={index()} />}
      </For>
    </Stack>
  );
};
