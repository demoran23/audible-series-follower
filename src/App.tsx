import {
  Box,
  Container,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@suid/material';
import { InputProps as StandardInputProps } from '@suid/material/Input/InputProps';
import { BooksPage } from 'components/BooksPage';
import { SeriesPage } from 'components/SeriesPage';
import { createSignal, Match, Switch } from 'solid-js';
import type { Component } from 'solid-js';
import { setTitleFilter, titleFilter } from 'store/titleFilter';

type AppPage = 'upcoming' | 'followed' | 'others';

const App: Component = () => {
  const [page, setPage] = createSignal<AppPage>('upcoming');
  const onFilterChange: StandardInputProps['onChange'] = (e, value) => {
    setTitleFilter(value);
  };
  return (
    <Box>
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
          <ToggleButton value="upcoming">Upcoming</ToggleButton>
          <ToggleButton value="followed">Followed</ToggleButton>
          <ToggleButton value="others">Others</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          label="Search"
          type="search"
          variant={'standard'}
          size={'small'}
          value={titleFilter()}
          onChange={onFilterChange}
          sx={{ backgroundColor: 'white' }}
        />
      </Stack>
      <Switch fallback={<BooksPage />}>
        <Match when={page() === 'followed'} keyed>
          <SeriesPage following={true} />
        </Match>
        <Match when={page() === 'others'} keyed>
          <SeriesPage following={false} />
        </Match>
      </Switch>
    </Box>
  );
};

export default App;
