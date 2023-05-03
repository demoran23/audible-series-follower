import { Stack } from '@suid/material';
import { BookCard } from 'components/BookCard';
import { subDays } from 'date-fns';
import { first, groupBy, orderBy, values } from 'lodash';
import { Component, createMemo, For } from 'solid-js';
import { Book, books } from 'store/books';
import { followingStore } from 'store/following';
import { titleFilter } from 'store/titleFilter';

export const NextList: Component<{ owned: boolean }> = (props) => {
  const items = createMemo(
    () =>
      orderBy(
        values(groupBy(values(books), 'seriesId'))
          .flatMap((seriesBooks) =>
            first(orderBy(seriesBooks, 'number').filter((b) => !b.rating)),
          )
          .filter(Boolean)
          .filter((b) => !props.owned || b?.status === 'owned')
          .filter(
            (b) =>
              !titleFilter() ||
              [b?.seriesName, b?.title]
                .filter(Boolean)
                .some((title) => new RegExp(titleFilter()!, 'i').test(title!)),
          )
          .filter((b) => followingStore[b!.seriesId ?? '']?.following)
          .filter(
            (b) => b!.releaseDate && new Date(b!.releaseDate) < new Date(),
          ),
        ['releaseDate'],
        'desc',
      ) as Book[],
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
