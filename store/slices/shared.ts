/* Slice plumbing. SHARED FILE — changing it needs both owners to agree.
   Adding a slice means editing this file and useStore.ts; adding state or an
   action *inside* a slice you own touches nothing here. */
import type { CoreState, CoreActions } from './core';
import type { GmbState, GmbActions } from './gmb';
import type { SeoState, SeoActions } from './seo';
import type { ContentState, ContentActions } from './content';
import type { GrowthState, GrowthActions } from './growth';
import type { AccountState, AccountActions } from './account';

/** every piece of persisted data, across all slices */
export type StoreState = CoreState & GmbState & SeoState & ContentState & GrowthState & AccountState;

/** every action, across all slices */
export type StoreActions = CoreActions & GmbActions & SeoActions & ContentActions & GrowthActions & AccountActions;

export type Store = StoreState & StoreActions;

export type SetStore = (partial: Partial<Store>) => void;
export type GetStore = () => Store;

/** a slice's action bundle: written against the whole store, owned by one person */
export type Slice<T> = (set: SetStore, get: GetStore) => T;
