import { Box, Button, Stack, TextField } from '@suid/material';
import { getOptions, IOptions, setOptions } from 'services/options';
import {
  Component,
  createEffect,
  createResource,
  Match,
  Switch,
} from 'solid-js';

export const OptionsPage: Component = () => {
  const [options, actions] = createResource<Partial<IOptions>>(getOptions);
  createEffect(async () => {
    if (options.state === 'ready') await setOptions(options());
  });
  const onChange = (event: any, value: any) => {
    actions.mutate((e) => ({ ...e, [event.target.id]: value }));
  };
  return (
    <Switch>
      <Match when={options.loading} keyed>
        <p>Loading...</p>
      </Match>
      <Match when={options.error} keyed>
        <p>{options.error}</p>
      </Match>
      <Match when={options.state === 'ready'} keyed>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '50ch' },
            textAlign: 'center',
          }}
          novalidate
          autocomplete="off"
        >
          <Stack spacing={2}>
            <TextField
              id="audibleBaseUrl"
              label="Audible Base Url"
              value={options()?.audibleBaseUrl}
              onChange={onChange}
            />
            <Button
              title={
                'Clears all of your books and series.  Follows are retained.'
              }
              onClick={() => chrome.runtime.sendMessage({ type: 'clear' })}
            >
              CLEAR BOOKS
            </Button>
          </Stack>
        </Box>
      </Match>
    </Switch>
  );
};
