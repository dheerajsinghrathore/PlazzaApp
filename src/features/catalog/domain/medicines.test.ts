import { searchMedicines } from './medicines';

describe('local medicine catalog search', () => {
  it('matches medicine name and salt case-insensitively', () => {
    expect(searchMedicines('DOLO').map(item => item.id)).toEqual(['m1']);
    expect(searchMedicines('paracetamol').map(item => item.id)).toEqual(['m1', 'm2', 'm7', 'm12']);
  });

  it('returns no results for an empty query and includes the required catalog', () => {
    expect(searchMedicines('  ')).toEqual([]);
    expect(searchMedicines('azithromycin')[0]).toMatchObject({ name: 'Azithral 500', rx: true, maxQty: 2 });
  });
});
