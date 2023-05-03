import { OpenInNew, Refresh } from '@suid/icons-material';
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@suid/material';
import { InputProps as StandardInputProps } from '@suid/material/Input/InputProps';
import { NextPage } from 'components/NextPage';
import { UpcomingPage } from 'components/UpcomingPage';
import { SeriesPage } from 'components/SeriesPage';
import { createSignal, Match, Show, Switch } from 'solid-js';
import type { Component } from 'solid-js';
import { setTitleFilter, titleFilter } from 'store/titleFilter';

type AppPage = 'upcoming' | 'followed' | 'others' | 'next';

const App: Component = () => {
  const [page, setPage] = createSignal<AppPage>('upcoming');
  const [refreshing, setRefreshing] = createSignal(false);
  const onFilterChange: StandardInputProps['onChange'] = (e, value) => {
    setTitleFilter(value);
  };
  return (
    <Stack
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        minWidth: 750,
        marginLeft: '1em',
        marginRight: '1em',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'flex-start'}
        justifyContent={'space-around'}
        position={'sticky'}
        top={4}
        zIndex={1000}
      >
        <ToggleButtonGroup
          color="primary"
          value={page()}
          exclusive
          onChange={(event, value) => {
            setPage(value);
          }}
          sx={{ backgroundColor: 'white' }}
        >
          <ToggleButton title={'Upcoming books'} value="upcoming">
            Upcoming
          </ToggleButton>
          <ToggleButton title={'Next books'} value="next">
            Next
          </ToggleButton>
          <ToggleButton title={'Followed series'} value="followed">
            Followed
          </ToggleButton>
          <ToggleButton title={'Other series'} value="others">
            Others
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          label="Search"
          type="search"
          variant={'standard'}
          size={'small'}
          value={titleFilter()}
          onChange={onFilterChange}
          sx={{
            backgroundColor: 'white',
            flex: 1,
            marginLeft: '2em',
            marginRight: '2em',
          }}
        />
        <Stack direction={'row'}>
          <IconButton
            title={'Refresh'}
            onClick={async () => {
              try {
                setRefreshing(true);
                await chrome.runtime.sendMessage({ type: 'refresh' });
              } finally {
                setRefreshing(false);
              }
            }}
          >
            <Show when={refreshing()} fallback={<Refresh />}>
              <CircularProgress />
            </Show>
          </IconButton>
          <IconButton
            title={'Open in new tab'}
            onClick={() => chrome.runtime.sendMessage({ type: 'show-app' })}
          >
            <OpenInNew />
          </IconButton>
        </Stack>
      </Stack>
      <Switch fallback={<UpcomingPage />}>
        <Match when={page() === 'followed'} keyed>
          <SeriesPage following={true} />
        </Match>
        <Match when={page() === 'next'} keyed>
          <NextPage />
        </Match>
        <Match when={page() === 'others'} keyed>
          <SeriesPage following={false} />
        </Match>
      </Switch>
    </Stack>
  );
};

export default App;
