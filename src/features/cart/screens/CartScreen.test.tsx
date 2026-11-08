import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../state/cartSlice';
import { CartScreen } from './CartScreen';

describe('empty cart screen', () => {
  it('shows a browse hint without coupon or zero-value bill controls', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    const store = configureStore({ reducer: { cart: cartReducer } });
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <CartScreen />
        </Provider>,
      );
    });

    if (!renderer) throw new Error('Cart screen did not render.');
    const text = renderer.root
      .findAllByType(Text)
      .map(node => node.props.children)
      .join(' ');
    expect(text).toContain('Browse the Home tab to find medicines.');
    expect(text).not.toContain('Bill breakdown');
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Coupon code' }),
    ).toHaveLength(0);
  });
});
