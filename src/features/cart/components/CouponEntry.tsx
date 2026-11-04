import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme/colors';

type CouponEntryProps = {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  appliedCode: string | null;
  onRemove: () => void;
};

export function CouponEntry({ value, onChange, onApply, appliedCode, onRemove }: CouponEntryProps) {
  return (
    <>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel="Coupon code"
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          placeholder="Enter a coupon code"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Apply coupon" onPress={onApply} style={styles.button}>
          <Text style={styles.buttonText}>APPLY</Text>
        </Pressable>
      </View>
      {appliedCode && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${appliedCode} coupon`} onPress={onRemove} style={styles.applied}>
          <Text style={styles.appliedText}>✓  {appliedCode} applied  ·  Remove</Text>
        </Pressable>
      )}
      <View style={styles.hints}>
        <Text style={styles.hintText}>FLAT50 from ₹300 · SAVE10 up to ₹100 · FREEDEL</Text>
        <Text style={styles.hintText}>FIRST100 from ₹200 · one use per user</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderColor: colors.border, borderWidth: 1, borderRadius: 13, backgroundColor: colors.surface, paddingLeft: 12, paddingRight: 5, marginBottom: 8 },
  input: { flex: 1, color: colors.ink, fontSize: 12, paddingVertical: 12, minHeight: 48 },
  button: { borderRadius: 9, backgroundColor: colors.tintGreen, paddingHorizontal: 13, minHeight: 44, justifyContent: 'center' },
  buttonText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  applied: { paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  appliedText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  hints: { marginBottom: 19 },
  hintText: { color: colors.muted, fontSize: 10, lineHeight: 17 },
});
