import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@suid/material';
import { BooksPage } from 'components/BooksPage';
import { SeriesPage } from 'components/SeriesPage';
import { createSignal, Match, Switch } from 'solid-js';
import type { Component } from 'solid-js';

type AppPage = 'upcoming' | 'followed' | 'others';

const App: Component = () => {
  const [page, setPage] = createSignal<AppPage>('upcoming');

  return (
    <Container>
      <Stack alignItems={'center'} position={'sticky'} top={4}>
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
