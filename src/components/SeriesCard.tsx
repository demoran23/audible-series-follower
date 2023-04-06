import { Card, CardContent, Typography } from '@suid/material';
import { isArray, orderBy, values } from 'lodash';
import { getOptions } from 'services/options';
import { Component, createResource, createSignal, For } from 'solid-js';
import { Book, books } from 'store/books';
import { Series } from 'store/series';

export interface SeriesCardProps {
  series: Series;
}
const cardPadding = 16;
const width = 600 - cardPadding * 2;

export const SeriesCard: Component<SeriesCardProps> = ({ series }) => {
  const [options] = createResource(getOptions);
  const [seriesBooks, setSeriesBooks] = createSignal<Book[]>();
  try {
    // TODO: Somewhere series.bookIds is getting mutated into a index keyed object.
    // This handler is a workaround until I figure out what's going on.  We all know how that goes.
    const ids = isArray(series.bookIds)
      ? series.bookIds
      : (values(series.bookIds) as string[]);
    const sortedBooks = orderBy(
      ids.map((id) => books[id]),
      'number',
      'asc',
    );
    setSeriesBooks(sortedBooks);
  } catch (e) {
    console.error(e, series);
    setSeriesBooks([]);
  }
  return (
    <Card
      sx={{
        display: 'flex',
        margin: 1,
        width: '100%',
      }}
    >
      <CardContent sx={{ flex: '1 0 auto' }}>
        <a
          href={`${options()?.audibleBaseUrl}/series/${series.id}`}
          target={'_blank'}
        >
          <Typography
            variant="subtitle1"
            title={series.name}
            noWrap
            sx={{ inlineSize: width, fontWeight: 'bold' }}
          >
            {series.name}
          </Typography>
        </a>
        <For each={seriesBooks()}>
          {(book, index) => (
            <div data-index={index()}>
              <Typography variant={'body2'}>
                {book.number} - {book.title}
              </Typography>
            </div>
          )}
        </For>
      </CardContent>
    </Card>
  );
};
