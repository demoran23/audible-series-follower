import { Star } from '@suid/icons-material';
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@suid/material';
import { yellow } from '@suid/material/colors';
import { ToggleFollowButton } from 'components/ToggleFollowButton';
import { isArray, orderBy, values } from 'lodash';
import { getOptions } from 'services/options';
import { Component, createResource, createSignal, For, Show } from 'solid-js';
import { Book, books } from 'store/books';
import { Series } from 'store/series';

export interface SeriesCardProps {
  series: Series;
}
const cardPadding = 16;
const width = 800 - cardPadding * 2;
const getStarColorFromRating = (rating: number | null | undefined): any => {
  if (!rating) return 'black';
  return { 5: 'green', 4: 'green', 3: 'yellow' }[rating] ?? 'black';
};
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

        <Grid container width={'600px'} rowSpacing={1}>
          <For each={seriesBooks()}>
            {(book, index) => (
              <Grid container data-index={index()} spacing={1}>
                <Grid item xs={1}>
                  <Show when={book.rating}>
                    <Chip
                      icon={<Star sx={{ color: yellow[500] }} />}
                      size={'small'}
                      variant="outlined"
                      label={book.rating?.toFixed()}
                    ></Chip>
                  </Show>
                </Grid>
                <Grid item xs={1}>
                  <Show when={book.number !== undefined}>
                    <Typography variant={'body2'} noWrap>
                      # {book.number}
                    </Typography>
                  </Show>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant={'body2'} noWrap>
                    {book.status}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <a
                    href={`${options()?.audibleBaseUrl}/pd/${book.id}`}
                    target={'_blank'}
                  >
                    <Typography variant={'body2'} noWrap title={book.title}>
                      {book.title}
                    </Typography>
                  </a>
                </Grid>
              </Grid>
            )}
          </For>
        </Grid>
      </CardContent>
    </Card>
  );
};
