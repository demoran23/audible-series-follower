import {
  Favorite,
  FavoriteBorder,
  FavoriteOutlined,
  Image,
} from '@suid/icons-material';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from '@suid/material';
import { SwitchBaseProps } from '@suid/material/internal/SwitchBaseProps';
import {
  Component,
  createMemo,
  createSignal,
  Match,
  Show,
  Switch,
} from 'solid-js';
import { produce } from 'solid-js/store';
import { Book } from 'store/books';
import { formatDistance } from 'date-fns';
import { series, setSeries } from 'store/series';

export interface BookCardProps {
  book: Book;
}
const cardPadding = 16;
const width = 300 - cardPadding * 2;
export const BookCard: Component<BookCardProps> = ({ book }) => {
  const releasesIn =
    book.releaseDate &&
    formatDistance(new Date(book.releaseDate), Date.now(), {
      // addSuffix: true,
    });
  const [isFollowing, setIsFollowing] = createSignal(
    !!series[book.seriesId!]?.following,
  );
  const onFavoriteClick: SwitchBaseProps['onChange'] = (e, checked) => {
    console.log('click', { isFollowing: isFollowing(), e, checked });

    setSeries(
      produce((store) => {
        const s = store[book.seriesId!];
        setIsFollowing(!s.following);
        s.following = !s.following;
        store[book.seriesId!] = s;
      }),
    );
  };
  return (
    <Card
      sx={{
        display: 'flex',
        margin: 1,
        maxWidth: 300,
      }}
    >
      <CardContent sx={{ flex: '1 0 auto' }}>
        <CardMedia
          component="img"
          sx={{ maxWidth: width }}
          image={book.imageUrl}
          alt={book.title}
        />

        <Typography
          variant="subtitle1"
          title={book.title}
          noWrap
          sx={{ inlineSize: width, fontWeight: 'bold' }}
        >
          {book.title}
        </Typography>
        <Typography variant={'body2'}>{releasesIn}</Typography>

        <Show when={book.seriesName}>
          <Typography
            variant="body2"
            title={book.seriesName!}
            noWrap
            sx={{ inlineSize: width }}
          >
            {book.seriesName}
          </Typography>
        </Show>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          maxWidth={width}
        >
          <Show when={book.status} fallback={<span></span>}>
            <Chip label={book.status} />
          </Show>
          <Checkbox
            checked={isFollowing()}
            onChange={onFavoriteClick}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
