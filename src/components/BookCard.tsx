import { Cancel, LibraryBooks, ManageSearch } from '@suid/icons-material';
import {
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Icon,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from '@suid/material';
import { SwitchBaseProps } from '@suid/material/internal/SwitchBaseProps';
import { ToggleFollowButton } from 'components/ToggleFollowButton';
import { getOptions } from 'services/options';
import { Component, createResource, Show } from 'solid-js';
import { produce } from 'solid-js/store';
import { Book } from 'store/books';
import { formatDistance } from 'date-fns';
import { followingStore, setFollowing } from 'store/following';
import AudibleIcon from 'assets/audible.svg';
export interface BookCardProps {
  book: Book;
}
const cardPadding = 16;
const imageMaxWidth = 300;
const cardMaxWidth = 700;
const noWrapSize = cardMaxWidth - imageMaxWidth;
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
  const bookLink = () => `${options()?.audibleBaseUrl}/pd/${book.id}`;
  return (
    <Card
      sx={{
        display: 'flex',
        maxWidth: cardMaxWidth,
        margin: '1em',
      }}
    >
      <a href={bookLink()} target={'_blank'}>
        <CardMedia component="img" image={book.imageUrl} alt={book.title} />
      </a>
      <CardContent
        sx={{
          flex: '1 0 auto',
          flexDirection: 'row',
          paddingTop: '0px',
          paddingBottom: '0px',
        }}
      >
        <Stack>
          <Typography
            variant="subtitle1"
            title={book.title}
            noWrap
            sx={{ inlineSize: noWrapSize, fontWeight: 'bold' }}
          >
            {book.title}
          </Typography>
          <Typography variant={'body2'}>{releasesIn}</Typography>

          <Show when={book.seriesName}>
            <Stack direction="row">
              <Typography
                variant="body2"
                title={`${book.seriesName} #${book.number}`}
                noWrap
                sx={{ inlineSize: noWrapSize }}
              >
                {book.seriesName} #{book.number}
              </Typography>
              <IconButton
                title={'Search your library'}
                onClick={() =>
                  chrome.tabs.create({
                    url: `${
                      options()?.audibleBaseUrl
                    }/library/titles?searchTerm=${book.seriesName}`,
                  })
                }
                size={'small'}
                sx={{ marginLeft: '1em' }}
              >
                <ManageSearch />
              </IconButton>
              <IconButton
                title={'Go to series'}
                onClick={() =>
                  chrome.tabs.create({
                    url: `${options()?.audibleBaseUrl}/series/${book.seriesId}`,
                  })
                }
                size={'small'}
                sx={{ marginLeft: '1em' }}
              >
                <LibraryBooks />
              </IconButton>
            </Stack>
          </Show>
          <Stack
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Show when={book.status} fallback={<span></span>}>
              <Chip label={book.status} />
            </Show>
            <ToggleFollowButton seriesId={book.seriesId!} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
