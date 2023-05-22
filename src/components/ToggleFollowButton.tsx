import { Button } from '@suid/material';
import { Component, createMemo } from 'solid-js';
import { followingStore, setFollowing } from 'store/following';

export const ToggleFollowButton: Component<{ seriesId: string }> = ({
  seriesId,
}) => {
  const isFollowing = createMemo(
    () => !!followingStore[seriesId]?.following,
    false,
  );
  const onToggleFollowClick = () => {
    setFollowing({
      [seriesId]: {
        seriesId: seriesId,
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
