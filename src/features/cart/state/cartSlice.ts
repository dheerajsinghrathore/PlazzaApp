import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartLine } from '../domain/cartLogic';
import { couponRules, CouponCode, validateCoupon } from '../domain/couponRules';
import { medicines } from '../../catalog/domain/medicines';

export type CartState = {
  lines: CartLine[];
  coupon: CouponCode | null;
  usedCoupons: CouponCode[];
  notice: string | null;
};
export type PersistedCartState = Pick<
  CartState,
  'lines' | 'coupon' | 'usedCoupons'
>;
const initialState: CartState = {
  lines: [],
  coupon: null,
  usedCoupons: [],
  notice: null,
};

function subtotalOf(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      (medicines.find(item => item.id === line.medicineId)?.price ?? 0) *
        line.quantity,
    0,
  );
}

function validateActiveCoupon(state: CartState): void {
  if (!state.coupon) return;
  const result = validateCoupon(
    state.coupon,
    subtotalOf(state.lines),
    state.usedCoupons,
  );
  if (!result.valid) {
    state.coupon = null;
    state.notice = `${result.reason} The coupon was removed.`;
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const medicine = medicines.find(item => item.id === action.payload);
      if (!medicine) return;
      const line = state.lines.find(item => item.medicineId === action.payload);
      if (line) line.quantity = Math.min(medicine.maxQty, line.quantity + 1);
      else state.lines.push({ medicineId: action.payload, quantity: 1 });
      validateActiveCoupon(state);
    },
    decreaseQuantity(state, action: PayloadAction<string>) {
      const line = state.lines.find(item => item.medicineId === action.payload);
      if (!line) return;
      if (line.quantity <= 1)
        state.lines = state.lines.filter(
          item => item.medicineId !== action.payload,
        );
      else line.quantity -= 1;
      validateActiveCoupon(state);
    },
    applyCoupon(state, action: PayloadAction<string>) {
      const result = validateCoupon(
        action.payload,
        subtotalOf(state.lines),
        state.usedCoupons,
      );
      if (!result.valid) {
        state.notice = result.reason;
        return;
      }
      state.coupon = action.payload.trim().toUpperCase() as CouponCode;
      state.notice = `${state.coupon} applied.`;
    },
    setCoupon(state, action: PayloadAction<CouponCode | null>) {
      state.coupon = action.payload;
      state.notice = null;
    },
    restoreCart(_state, action: PayloadAction<PersistedCartState>) {
      const restored = { ...initialState, ...action.payload, notice: null };
      validateActiveCoupon(restored);
      return restored;
    },
    consumeNotice(state) {
      state.notice = null;
    },
    placeOrder(state) {
      if (state.lines.length === 0) return;
      if (
        state.coupon &&
        couponRules[state.coupon].oneTime &&
        !state.usedCoupons.includes(state.coupon)
      ) {
        state.usedCoupons.push(state.coupon);
      }
      state.lines = [];
      state.coupon = null;
      state.notice = 'Order placed. Your cart is clear.';
    },
    clearCart(state) {
      state.lines = [];
      state.coupon = null;
      state.notice = null;
    },
  },
});

export const {
  addToCart,
  decreaseQuantity,
  applyCoupon,
  setCoupon,
  restoreCart,
  consumeNotice,
  placeOrder,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
