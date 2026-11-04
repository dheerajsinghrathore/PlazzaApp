import reducer, { addToCart, applyCoupon, decreaseQuantity, placeOrder } from './cartSlice';

describe('cart mechanics', () => {
  it('caps each line at its catalog maxQty', () => {
    let state = reducer(undefined, addToCart('m3'));
    state = reducer(state, addToCart('m3'));
    state = reducer(state, addToCart('m3'));
    expect(state.lines).toEqual([{ medicineId: 'm3', quantity: 2 }]);
  });

  it('ignores unknown catalog IDs', () => {
    const state = reducer(undefined, addToCart('not-a-medicine'));
    expect(state.lines).toEqual([]);
  });

  it('auto-removes a coupon with a toast notice when a cart change breaks eligibility', () => {
    let state = reducer(undefined, addToCart('m3'));
    state = reducer(state, addToCart('m4'));
    state = reducer(state, applyCoupon('FIRST100'));
    expect(state.coupon).toBe('FIRST100');
    state = reducer(state, decreaseQuantity('m4'));
    state = reducer(state, decreaseQuantity('m4'));
    state = reducer(state, decreaseQuantity('m4'));
    expect(state.coupon).toBeNull();
    expect(state.notice).toContain('FIRST100 needs an item total of ₹200');
  });

  it('records FIRST100 as used when an order is placed', () => {
    let state = reducer(undefined, addToCart('m3'));
    state = reducer(state, addToCart('m4'));
    state = reducer(state, applyCoupon('FIRST100'));
    state = reducer(state, placeOrder());
    expect(state.lines).toEqual([]);
    expect(state.usedCoupons).toEqual(['FIRST100']);
    state = reducer(state, addToCart('m3'));
    state = reducer(state, addToCart('m4'));
    state = reducer(state, applyCoupon('FIRST100'));
    expect(state.coupon).toBeNull();
    expect(state.notice).toContain('already been used');
  });
});
