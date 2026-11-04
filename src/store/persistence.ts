import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedCartState, restoreCart } from '../features/cart/state/cartSlice';
import { couponRules, CouponCode } from '../features/cart/domain/couponRules';
import { medicines } from '../features/catalog/domain/medicines';
import { restoreRecentSearches } from '../features/search/state/searchSlice';
import { AppDispatch, RootState } from './store';

const STORAGE_KEY = '@plazza/persisted-state';
const LEGACY_CART_KEY = '@plazza/cart-v1';
const LEGACY_RECENT_KEY = '@plazza/recent-v1';
const CURRENT_VERSION = 1;

type PersistedState = {
  version: number;
  cart: PersistedCartState;
  recentSearches: string[];
};

export async function loadPersistedState(dispatch: AppDispatch): Promise<void> {
  try {
    const encoded = await AsyncStorage.getItem(STORAGE_KEY);
    if (encoded) {
      const parsed: unknown = JSON.parse(encoded);
      if (isPersistedState(parsed)) {
        dispatch(restoreCart(parsed.cart));
        dispatch(restoreRecentSearches(parsed.recentSearches));
        return;
      }
    }
    await loadLegacyState(dispatch);
  } catch {
    dispatch(restoreCart({ lines: [], coupon: null, usedCoupons: [] }));
    dispatch(restoreRecentSearches([]));
  }
}

export async function persistState(state: RootState): Promise<void> {
  const persisted: PersistedState = {
    version: CURRENT_VERSION,
    cart: { lines: state.cart.lines, coupon: state.cart.coupon, usedCoupons: state.cart.usedCoupons },
    recentSearches: state.search.recent.slice(0, 5),
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // A storage failure does not take down the active shopping session.
  }
}

async function loadLegacyState(dispatch: AppDispatch): Promise<void> {
  const [cartEncoded, recentEncoded] = await Promise.all([
    AsyncStorage.getItem(LEGACY_CART_KEY),
    AsyncStorage.getItem(LEGACY_RECENT_KEY),
  ]);
  const cart: PersistedCartState = cartEncoded
    ? migrateLegacyCart(JSON.parse(cartEncoded) as unknown)
    : { lines: [], coupon: null, usedCoupons: [] };
  const recent: string[] = recentEncoded
    ? parseRecentSearches(JSON.parse(recentEncoded) as unknown)
    : [];
  dispatch(restoreCart(cart));
  dispatch(restoreRecentSearches(recent));
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!isRecord(value) || value.version !== CURRENT_VERSION) return false;
  return isPersistedCart(value.cart) && isSearchList(value.recentSearches);
}

function isPersistedCart(value: unknown): value is PersistedCartState {
  if (!isRecord(value) || !Array.isArray(value.lines) || !Array.isArray(value.usedCoupons)) return false;
  const linesValid = value.lines.every((line: unknown) => {
    if (!isRecord(line) || typeof line.medicineId !== 'string' || typeof line.quantity !== 'number') return false;
    const medicine = medicines.find(item => item.id === line.medicineId);
    return Boolean(medicine && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= medicine.maxQty);
  });
  const couponValid = value.coupon === null || isCouponCode(value.coupon);
  return linesValid && couponValid && value.usedCoupons.every(isCouponCode);
}

function migrateLegacyCart(value: unknown): PersistedCartState {
  if (!isRecord(value) || !Array.isArray(value.lines)) return { lines: [], coupon: null, usedCoupons: [] };
  const lines = value.lines.filter((line: unknown): line is { medicineId: string; quantity: number } => {
    if (!isRecord(line) || typeof line.medicineId !== 'string' || typeof line.quantity !== 'number') return false;
    const medicine = medicines.find(item => item.id === line.medicineId);
    return Boolean(medicine && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= medicine.maxQty);
  });
  const coupon = isCouponCode(value.coupon) ? value.coupon : null;
  return { lines, coupon, usedCoupons: [] };
}

function parseRecentSearches(value: unknown): string[] {
  return isSearchList(value) ? value.slice(0, 5) : [];
}

function isSearchList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isCouponCode(value: unknown): value is CouponCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(couponRules, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
