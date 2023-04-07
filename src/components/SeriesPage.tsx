import { SeriesList } from 'components/SeriesList';
import { Component } from 'solid-js';

export const SeriesPage: Component<{ following: boolean }> = (props) => {
  return (
    <div>
      <SeriesList following={props.following} />
    </div>
  );
};
