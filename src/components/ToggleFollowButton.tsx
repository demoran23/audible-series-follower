import { Button } from '@suid/material';
import { Component, createMemo } from 'solid-js';
import { followingStore, setFollowing } from 'store/following';
import { Series } from 'store/series';

export const ToggleFollowButton: Component<{ series: Series }> = ({
  series,
}) => {
  const isFollowing = createMemo(
    () => !!followingStore[series.id]?.following,
    false,
  );
  const onToggleFollowClick = () => {
    console.log('following', series.name, !isFollowing());
    setFollowing({
      [series.id]: {
        seriesId: series.id,
        following: !isFollowing(),
        type: 'following',
      },
    });
  };
  return (
    <Button
      onClick={onToggleFollowClick}
      variant={'outlined'}
      color={isFollowing() ? 'error' : undefined}
    >
      {isFollowing() ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
