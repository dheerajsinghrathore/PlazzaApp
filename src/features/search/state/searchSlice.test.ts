import reducer, { addRecentSearch } from './searchSlice';

describe('recent search history', () => {
  it('deduplicates and retains only the latest five queries', () => {
    let state = reducer(undefined, addRecentSearch('one'));
    ['two', 'three', 'four', 'five', 'six', 'ONE'].forEach(query => { state = reducer(state, addRecentSearch(query)); });
    expect(state.recent).toEqual(['ONE', 'six', 'five', 'four', 'three']);
  });
});
