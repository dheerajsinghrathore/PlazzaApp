import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SearchState = { recent: string[] };
const searchSlice = createSlice({
  name: 'search',
  initialState: { recent: [] } as SearchState,
  reducers: {
    addRecentSearch(state, action: PayloadAction<string>) {
      const query = action.payload.trim();
      if (!query) return;
      state.recent = [
        query,
        ...state.recent.filter(
          item => item.toLocaleLowerCase() !== query.toLocaleLowerCase(),
        ),
      ].slice(0, 5);
    },
    restoreRecentSearches(_state, action: PayloadAction<string[]>) {
      return { recent: action.payload.slice(0, 5) };
    },
  },
});
export const { addRecentSearch, restoreRecentSearches } = searchSlice.actions;
export default searchSlice.reducer;
