import { FormControlLabel, Switch } from '@suid/material';
import { NextList } from 'components/NextList';
import { Component, createSignal } from 'solid-js';

export const NextPage: Component = () => {
  const [owned, setOwned] = createSignal<boolean>(true);
  return (
    <>
      <FormControlLabel
        control={
          <Switch checked={owned()} onChange={() => setOwned((o) => !o)} />
        }
        label="Owned"
      />
      <NextList owned={owned()} />
    </>
  );
};
