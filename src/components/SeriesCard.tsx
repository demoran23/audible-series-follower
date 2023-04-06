import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from '@suid/material';
import { ToggleFollowButton } from 'components/ToggleFollowButton';
import { isArray, orderBy, values } from 'lodash';
import { getOptions } from 'services/options';
import { Component, createResource, createSignal, For } from 'solid-js';
import { Book, books } from 'store/books';
import { Series } from 'store/series';

export interface SeriesCardProps {
  series: Series;
}
const cardPadding = 16;
const width = 800 - cardPadding * 2;
export const SeriesCard: Component<SeriesCardProps> = ({ series }) => {
  const [options] = createResource(getOptions);
  const [seriesBooks, setSeriesBooks] = createSignal<Book[]>([]);

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
  const firstBook = seriesBooks()[0];
  return (
    <Card
      sx={{
        display: 'flex',
        margin: 1,
        width: width,
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 125, objectFit: 'contain' }}
        image={firstBook.imageUrl}
        alt={series.name}
      />
      <CardContent>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          marginBottom={'1em'}
        >
          <a
            href={`${options()?.audibleBaseUrl}/series/${series.id}`}
            target={'_blank'}
          >
            <Typography
              variant="subtitle1"
              title={series.name}
              noWrap
              sx={{ fontWeight: 'bold' }}
            >
              {series.name}
            </Typography>
          </a>
          <ToggleFollowButton series={series} />
        </Stack>

        <Stack direction={'column'} width={'600px'}>
          <For each={seriesBooks()}>
            {(book, index) => (
              <Typography variant={'body2'} noWrap data-index={index()}>
                {book.number} - {book.title}
              </Typography>
            )}
          </For>
        </Stack>
      </CardContent>
    </Card>
  );
};
