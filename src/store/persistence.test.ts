import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCart } from '../features/cart/state/cartSlice';
import { addRecentSearch } from '../features/search/state/searchSlice';
import { loadPersistedState, persistState } from './persistence';
import { store } from './store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

describe('versioned local persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    store.dispatch({ type: 'cart/clearCart' });
    store.dispatch({ type: 'search/restoreRecentSearches', payload: [] });
  });

  it('writes a versioned state and restores cart and five recent searches', async () => {
    ['one', 'two', 'three', 'four', 'five', 'six'].forEach(query => store.dispatch(addRecentSearch(query)));
    store.dispatch(addToCart('m1'));
    await persistState(store.getState());
    const saved = await AsyncStorage.getItem('@plazza/persisted-state');
    expect(JSON.parse(saved ?? '{}')).toMatchObject({ version: 1, cart: { lines: [{ medicineId: 'm1', quantity: 1 }] }, recentSearches: ['six', 'five', 'four', 'three', 'two'] });

    store.dispatch({ type: 'cart/clearCart' });
    store.dispatch({ type: 'search/restoreRecentSearches', payload: [] });
    await loadPersistedState(store.dispatch);
    expect(store.getState().cart.lines).toEqual([{ medicineId: 'm1', quantity: 1 }]);
    expect(store.getState().search.recent).toHaveLength(5);
  });

  it('recovers from corrupt saved data without throwing', async () => {
    await AsyncStorage.setItem('@plazza/persisted-state', '{corrupt');
    await expect(loadPersistedState(store.dispatch)).resolves.toBeUndefined();
    expect(store.getState().cart.lines).toEqual([]);
  });
});
