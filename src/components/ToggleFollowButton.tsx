import { Button } from '@suid/material';
import { Component } from 'solid-js';
import { followingStore, setFollowing } from 'store/following';
import { Series, setSeries } from 'store/series';

export const ToggleFollowButton: Component<{ series: Series }> = ({
  series,
}) => {
  const isFollowing = !!followingStore[series.id]?.following;
  const onToggleFollowClick = () => {
    setFollowing({
      [series.id]: {
        seriesId: series.id,
        following: !isFollowing,
        type: 'following',
      },
    });
  };
  return (
    <Button
      onClick={onToggleFollowClick}
      variant={'outlined'}
      color={isFollowing ? 'error' : undefined}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
