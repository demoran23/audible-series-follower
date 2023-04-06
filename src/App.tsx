import { Button, ButtonGroup } from '@suid/material';
import { BooksPage } from 'components/BooksPage';
import { SeriesPage } from 'components/SeriesPage';
import { createSignal, Match, Switch } from 'solid-js';
import type { Component } from 'solid-js';

type AppPage = 'upcoming' | 'followed' | 'others';

const App: Component = () => {
  const [page, setPage] = createSignal<AppPage>('upcoming');
  return (
    <div>
      <ButtonGroup variant="text" aria-label="text button group">
        <Button onClick={() => setPage('upcoming')}>Upcoming</Button>
        <Button onClick={() => setPage('followed')}>Followed</Button>
        <Button onClick={() => setPage('others')}>Others</Button>
      </ButtonGroup>
      <Switch fallback={<BooksPage />}>
        <Match when={page() === 'followed'}>
          <SeriesPage following={true} />
        </Match>
        <Match when={page() === 'others'}>
          <SeriesPage following={false} />
        </Match>
      </Switch>
    </div>
  );
};

export default App;
