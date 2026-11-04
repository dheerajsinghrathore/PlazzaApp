import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Medicine } from '../../catalog/domain/medicines';
import { colors, formatRupees } from '../../../theme/colors';

type MedicineCardProps = {
  medicine: Medicine;
  quantity: number;
  onAdd: () => void;
};

export function MedicineCard({ medicine, quantity, onAdd }: MedicineCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glyph}><Text style={styles.glyphText}>{medicine.rx ? 'Rx' : '✚'}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameAndBadge}>
          <Text style={styles.name}>{medicine.name}</Text>
          {medicine.rx && <Text style={styles.rxBadge}>Rx</Text>}
        </View>
        <Text style={styles.salt}>Salt: {medicine.salt}</Text>
        <Text style={styles.price}>{formatRupees(medicine.price)}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={quantity >= medicine.maxQty
          ? `${medicine.name} maximum quantity reached`
          : `Add ${medicine.name} to cart`}
        accessibilityState={{ disabled: quantity >= medicine.maxQty }}
        disabled={quantity >= medicine.maxQty}
        onPress={onAdd}
        style={[styles.addButton, quantity >= medicine.maxQty && styles.addButtonDisabled]}
      >
        <Text style={styles.addButtonText}>
          {quantity >= medicine.maxQty ? 'MAX' : quantity ? `+ ${quantity}` : 'ADD +'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 17, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.borderSubtle },
  glyph: { width: 45, height: 45, borderRadius: 14, backgroundColor: colors.paleGreen, justifyContent: 'center', alignItems: 'center' },
  glyphText: { color: colors.green, fontSize: 17, fontWeight: '800' },
  info: { flex: 1, marginLeft: 11 },
  nameAndBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  rxBadge: { overflow: 'hidden', backgroundColor: colors.paleAmber, color: colors.amberText, fontSize: 9, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  salt: { color: colors.muted, fontSize: 10, marginTop: 4 },
  price: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 6 },
  addButton: { borderWidth: 1, borderColor: colors.buttonBorder, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 12, minWidth: 58, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  addButtonDisabled: { backgroundColor: colors.paleGreen, borderColor: colors.border },
  addButtonText: { color: colors.green, fontSize: 10, fontWeight: '800' },
});
