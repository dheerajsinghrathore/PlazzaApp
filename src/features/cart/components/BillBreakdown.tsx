import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bill } from '../domain/cartLogic';
import { colors, formatRupees } from '../../../theme/colors';

export function BillBreakdown({ bill }: { bill: Bill }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Bill breakdown</Text>
      <BillRow label="Item Total" value={formatRupees(bill.subtotal)} />
      <BillRow
        label="Discount"
        value={`− ${formatRupees(bill.discount)}`}
        positive={bill.discount > 0}
      />
      <BillRow
        label="Delivery Fee"
        value={bill.delivery ? formatRupees(bill.delivery) : 'FREE'}
        positive={bill.delivery === 0}
      />
      <View style={styles.divider} />
      <BillRow label="Grand Total" value={formatRupees(bill.total)} strong />
    </View>
  );
}

function BillRow({
  label,
  value,
  positive = false,
  strong = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  strong?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
      <Text
        style={[
          styles.value,
          positive && styles.positive,
          strong && styles.strong,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  heading: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  label: { color: colors.muted, fontSize: 12 },
  value: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  positive: { color: colors.green },
  strong: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 4,
  },
});
