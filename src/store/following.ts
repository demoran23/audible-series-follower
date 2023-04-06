import { values } from 'lodash';
import { setFollowingsInStorage } from 'services/storage';
import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { IType } from 'store/IType';

export interface Following extends IType<'following'> {
  seriesId: string;
  following: boolean;
}

export interface FollowingStore {
  [id: string]: Following;
}

export const [followingStore, setFollowing] = createStore<FollowingStore>({});

// When we update our followingStore, update storage as well
createEffect(async () => {
  const followings = values(followingStore);
  await setFollowingsInStorage(followings);
});
