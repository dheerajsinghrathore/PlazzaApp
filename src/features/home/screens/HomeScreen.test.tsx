import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../cart/state/cartSlice';
import searchReducer from '../../search/state/searchSlice';
import { loadPersistedState, persistState } from '../../../store/persistence';
import { HomeScreen } from './HomeScreen';

let mockFocusBlur: (() => void) | undefined;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (callback: () => (() => void) | void) => {
    mockFocusBlur = callback() || undefined;
  },
}));

jest.mock('../../permissions/PermissionProvider', () => ({
  permissionStatusLabel: (status: string) => status,
  useAppPermissions: () => ({
      statuses: { location: 'unknown', notifications: 'unknown' },
      locationName: null,
      locationError: null,
      addressError: null,
      requesting: false,
      error: null,
      requestPermissions: jest.fn(),
      openAppSettings: jest.fn(),
      openDeviceLocationSettings: jest.fn(),
      retryLocation: jest.fn(),
    }),
}));

function createTestStore() {
  return configureStore({ reducer: { cart: cartReducer, search: searchReducer } });
}

function visibleText(renderer: ReactTestRenderer.ReactTestRenderer): string {
  return renderer.root.findAllByType(Text)
    .map(node => node.props.children)
    .filter((child): child is string => typeof child === 'string')
    .join(' ');
}

describe('Home medicine search workflow', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    mockFocusBlur = undefined;
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('handles empty, loading, no-results and matching results, and persists the search', async () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <HomeScreen />
        </Provider>,
      );
    });
    if (!renderer) throw new Error('Home screen did not render.');

    expect(visibleText(renderer)).toContain('Search by medicine name or salt to find a match.');

    const input = renderer.root.findByType(TextInput);
    ReactTestRenderer.act(() => input.props.onChangeText('not-a-medicine'));
    expect(visibleText(renderer)).toContain('Searching medicines…');
    ReactTestRenderer.act(() => jest.advanceTimersByTime(120));
    expect(visibleText(renderer)).toContain('No matches yet. Try another medicine or salt.');
    expect(store.getState().search.recent).toEqual([]);

    ReactTestRenderer.act(() => input.props.onChangeText('azithromycin'));
    expect(visibleText(renderer)).toContain('Searching medicines…');
    ReactTestRenderer.act(() => jest.advanceTimersByTime(120));
    expect(visibleText(renderer)).toContain('Azithral 500');
    expect(store.getState().search.recent).toEqual(['Azithral 500']);

    ReactTestRenderer.act(() => input.props.onChangeText('AZITH'));
    ReactTestRenderer.act(() => jest.advanceTimersByTime(120));
    expect(store.getState().search.recent).toEqual(['Azithral 500']);

    const addButton = renderer.root.findByProps({ accessibilityLabel: 'Add Azithral 500 to cart' });
    ReactTestRenderer.act(() => addButton.props.onPress());
    expect(store.getState().cart.lines).toEqual([{ medicineId: 'm3', quantity: 1 }]);

    ReactTestRenderer.act(() => mockFocusBlur?.());
    expect(renderer.root.findByType(TextInput).props.value).toBe('');
    expect(visibleText(renderer)).toContain('The local catalog');
    expect(visibleText(renderer)).not.toContain('Search results');

    await persistState(store.getState());
    const restoredStore = createTestStore();
    await loadPersistedState(restoredStore.dispatch);
    expect(restoredStore.getState().search.recent).toEqual(['Azithral 500']);
  });

  it('shows recent medicine names again after clearing the search', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <HomeScreen />
        </Provider>,
      );
    });
    if (!renderer) throw new Error('Home screen did not render.');

    const input = renderer.root.findByType(TextInput);
    ReactTestRenderer.act(() => input.props.onChangeText('dolo'));
    ReactTestRenderer.act(() => jest.advanceTimersByTime(120));
    expect(store.getState().search.recent).toEqual(['Dolo 650']);

    ReactTestRenderer.act(() => input.props.onChangeText(''));
    expect(visibleText(renderer)).toContain('Dolo 650');
  });
});
