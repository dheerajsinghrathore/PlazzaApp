import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Medicine } from '../../catalog/domain/medicines';
import { colors, formatRupees } from '../../../theme/colors';

type CartItemRowProps = {
  medicine: Medicine;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function CartItemRow({ medicine, quantity, onIncrease, onDecrease }: CartItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.glyph}><Text style={styles.glyphText}>{medicine.rx ? 'Rx' : '✚'}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameAndBadge}>
          <Text style={styles.name}>{medicine.name}</Text>
          {medicine.rx && <Text style={styles.rxBadge}>Rx</Text>}
        </View>
        <Text style={styles.price}>{formatRupees(medicine.price)} each</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${medicine.name} quantity`} hitSlop={8} onPress={onDecrease}>
          <Text style={styles.stepperText}>−</Text>
        </Pressable>
        <Text style={styles.quantity}>{quantity}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${medicine.name} quantity`} hitSlop={8} onPress={onIncrease}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.total}>{formatRupees(medicine.price * quantity)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 15, padding: 11, marginBottom: 9, borderWidth: 1, borderColor: '#edf0ea' },
  glyph: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#edf5ee', justifyContent: 'center', alignItems: 'center' },
  glyphText: { color: colors.green, fontSize: 17, fontWeight: '800' },
  info: { flex: 1, marginLeft: 10 },
  nameAndBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  rxBadge: { overflow: 'hidden', backgroundColor: '#fff0dc', color: '#8c5412', fontSize: 9, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  price: { color: colors.muted, fontSize: 10, marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f5f0', borderRadius: 9, paddingHorizontal: 7, gap: 9, minHeight: 40 },
  stepperText: { color: colors.green, fontSize: 18, fontWeight: '600', padding: 2 },
  quantity: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  total: { color: colors.ink, fontSize: 12, fontWeight: '800', minWidth: 43, textAlign: 'right', marginLeft: 5 },
});
