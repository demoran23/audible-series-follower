import { Cancel } from '@suid/icons-material';
import {
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from '@suid/material';
import { SwitchBaseProps } from '@suid/material/internal/SwitchBaseProps';
import { getOptions } from 'services/options';
import { Component, createResource, Show } from 'solid-js';
import { produce } from 'solid-js/store';
import { Book } from 'store/books';
import { formatDistance } from 'date-fns';
import { followingStore, setFollowing } from 'store/following';

export interface BookCardProps {
  book: Book;
}
const cardPadding = 16;
const width = 300 - cardPadding * 2;
export const BookCard: Component<BookCardProps> = ({ book }) => {
  const releasesIn =
    book.releaseDate &&
    formatDistance(new Date(book.releaseDate), Date.now(), {
      addSuffix: true,
    });
  const isFollowing = !!followingStore[book.seriesId!]?.following;
  const [options] = createResource(getOptions);
  const onRemoveFollowClick: SwitchBaseProps['onChange'] = (e, checked) => {
    setFollowing(
      produce((store) => {
        store[book.seriesId!].following = checked;
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
        <a
          href={`${options()?.audibleBaseUrl}/pd/${book.id}`}
          target={'_blank'}
        >
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
        </a>

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
            checked={isFollowing}
            title={'Stop following this series'}
            onChange={onRemoveFollowClick}
            checkedIcon={<Cancel color={'error'} />}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
