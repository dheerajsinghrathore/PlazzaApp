import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../cart/state/cartSlice';
import { medicines, Medicine, searchMedicines } from '../../catalog/domain/medicines';
import { addRecentSearch } from '../../search/state/searchSlice';
import { RootState } from '../../../store/store';
import { PermissionStatusCard } from '../components/PermissionStatusCard';
import { MedicineCard } from '../components/MedicineCard';
import { useAppPermissions } from '../../permissions/PermissionProvider';
import { colors } from '../../../theme/colors';

export function HomeScreen() {
  const dispatch = useDispatch();
  const { recent } = useSelector((state: RootState) => state.search);
  const { lines } = useSelector((state: RootState) => state.cart);
  const permissions = useAppPermissions();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      setResults(searchMedicines(query));
      setSearching(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  const submitSearch = (value = query) => {
    if (value.trim()) dispatch(addRecentSearch(value));
  };
  const quantityFor = (medicineId: string) => lines.find(line => line.medicineId === medicineId)?.quantity ?? 0;
  const visibleMedicines = query.trim() ? (searching ? [] : results) : medicines;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>YOUR HEALTH, DELIVERED</Text>
          <Text style={styles.brand}>Plazza<Text style={styles.brandDot}>.</Text></Text>
        </View>
        <View style={styles.deliveryPill}><Text style={styles.deliveryText}>⌖  Delivering to you</Text></View>
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Feel better, sooner.</Text>
        <Text style={styles.heroSub}>Trusted essentials, at your doorstep.</Text>
        <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>Convenient doorstep delivery</Text></View>
      </View>
      <PermissionStatusCard
        statuses={permissions.statuses}
        coordinates={permissions.coordinates}
        locationError={permissions.locationError}
        requesting={permissions.requesting}
        error={permissions.error}
        onRequest={permissions.requestPermissions}
        onOpenSettings={permissions.openAppSettings}
      />
      <Text style={styles.sectionTitle}>Find your medicine</Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search medicines by name or salt"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => submitSearch()}
          returnKeyType="search"
          placeholder="Search medicine name or salt..."
          placeholderTextColor="#9aa5a1"
          style={styles.searchInput}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12} onPress={() => setQuery('')}>
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      </View>
      {!query.trim() && <Text style={styles.emptySearchHint}>Search by medicine name or salt to find a match.</Text>}
      {!query.trim() && recent.length > 0 && (
        <View style={styles.recentRow}>
          <Text style={styles.recentLabel}>RECENT</Text>
          {recent.map(item => (
            <Pressable key={item} style={styles.chip} onPress={() => { setQuery(item); submitSearch(item); }}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{query.trim() ? 'Search results' : 'The local catalog'}</Text>
        <Text style={styles.itemCount}>{query.trim() ? searching ? 'Searching…' : `${results.length} found` : `${medicines.length} medicines`}</Text>
      </View>
      {query.trim() && searching && <Text accessibilityRole="progressbar" style={styles.emptyText}>Searching medicines…</Text>}
      {visibleMedicines.map(medicine => (
        <MedicineCard
          key={medicine.id}
          medicine={medicine}
          quantity={quantityFor(medicine.id)}
          onAdd={() => dispatch(addToCart(medicine.id))}
        />
      ))}
      {query.trim() && !searching && results.length === 0 && (
        <Text style={styles.emptyText}>No matches yet. Try another medicine or salt.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 36 },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: colors.green },
  brand: { fontSize: 29, fontWeight: '800', letterSpacing: -1.2, color: colors.ink, marginTop: 2 },
  brandDot: { color: colors.accent },
  deliveryPill: { backgroundColor: '#e7f1eb', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 9 },
  deliveryText: { color: colors.green, fontWeight: '700', fontSize: 11 },
  hero: { backgroundColor: '#174e43', borderRadius: 22, padding: 21, marginBottom: 22, overflow: 'hidden' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  heroSub: { color: '#c3dbd2', fontSize: 13, marginTop: 6 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: '#ffffff1f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginTop: 16 },
  heroBadgeText: { color: '#f6d99e', fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 17, letterSpacing: -0.3, marginBottom: 12 },
  searchBox: { minHeight: 52, borderColor: colors.border, borderWidth: 1, borderRadius: 15, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  searchIcon: { color: colors.green, fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink, paddingVertical: 11 },
  clearText: { color: colors.muted, fontSize: 22, paddingLeft: 8 },
  emptySearchHint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14, marginBottom: 5, flexWrap: 'wrap' },
  recentLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  chip: { backgroundColor: '#eef2ed', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 10, minHeight: 40 },
  chipText: { color: '#52645e', fontSize: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  itemCount: { color: colors.muted, fontSize: 11, marginBottom: 12 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginVertical: 22 },
});
