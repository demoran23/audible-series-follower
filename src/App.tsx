import {
  Box,
  Button,
  ButtonGroup,
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
    <Container>
      <Stack
        alignItems={'center'}
        justifyContent={'space-around'}
        position={'sticky'}
        top={4}
      >
        <ToggleButtonGroup
          color="primary"
          value={page()}
          exclusive
          onChange={(event, value) => {
            setPage(value);
          }}
        >
          <ToggleButton value="upcoming">Upcoming</ToggleButton>
          <ToggleButton value="followed">Followed</ToggleButton>
          <ToggleButton value="others">Others</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          label="Search"
          type="search"
          value={titleFilter()}
          onChange={onFilterChange}
        />
      </Stack>
      <Switch fallback={<BooksPage />}>
        <Match when={page() === 'followed'}>
          <SeriesPage following={true} />
        </Match>
        <Match when={page() === 'others'}>
          <SeriesPage following={false} />
        </Match>
      </Switch>
    </Container>
  );
};

export default App;
