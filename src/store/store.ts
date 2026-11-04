import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/state/cartSlice';
import searchReducer from '../features/search/state/searchSlice';

export const store = configureStore({ reducer: { cart: cartReducer, search: searchReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
