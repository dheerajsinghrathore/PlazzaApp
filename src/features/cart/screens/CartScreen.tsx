import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BillBreakdown } from '../components/BillBreakdown';
import { CartItemRow } from '../components/CartItemRow';
import { CouponEntry } from '../components/CouponEntry';
import { calculateBill } from '../domain/cartLogic';
import {
  addToCart,
  applyCoupon,
  clearCart,
  consumeNotice,
  decreaseQuantity,
  placeOrder,
  setCoupon,
} from '../state/cartSlice';
import { medicines } from '../../catalog/domain/medicines';
import { RootState } from '../../../store/store';
import { colors, formatRupees } from '../../../theme/colors';

export function CartScreen() {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const [couponInput, setCouponInput] = useState('');
  const subtotal = cart.lines.reduce((sum, line) => {
    const medicine = medicines.find(item => item.id === line.medicineId);
    return sum + (medicine?.price ?? 0) * line.quantity;
  }, 0);
  const bill = calculateBill(subtotal, cart.coupon, cart.usedCoupons);
  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    if (!cart.notice) return;
    if (Platform.OS === 'android')
      ToastAndroid.show(cart.notice, ToastAndroid.LONG);
    else Alert.alert('Plazza', cart.notice);
    dispatch(consumeNotice());
  }, [cart.notice, dispatch]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>YOUR BAG</Text>
      <Text style={styles.pageTitle}>Shopping cart</Text>
      <Text style={styles.pageSub}>
        {itemCount} items · thoughtfully picked
      </Text>

      {cart.lines.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyIcon}>✚</Text>
          <Text style={styles.emptyTitle}>
            Your cart is taking a little rest
          </Text>
          <Text style={styles.emptyText}>
            Add a few essentials and they’ll show up here.
          </Text>
          <Text style={styles.emptyHint}>
            Browse the Home tab to find medicines.
          </Text>
        </View>
      ) : (
        <>
          {cart.lines.map(line => {
            const medicine = medicines.find(
              item => item.id === line.medicineId,
            );
            if (!medicine) return null;
            return (
              <CartItemRow
                key={line.medicineId}
                medicine={medicine}
                quantity={line.quantity}
                onIncrease={() => dispatch(addToCart(medicine.id))}
                onDecrease={() => dispatch(decreaseQuantity(medicine.id))}
              />
            );
          })}
          <Text style={styles.sectionTitle}>A little something off?</Text>
          <CouponEntry
            value={couponInput}
            onChange={setCouponInput}
            onApply={() => {
              dispatch(applyCoupon(couponInput));
              setCouponInput('');
            }}
            appliedCode={cart.coupon}
            onRemove={() => dispatch(setCoupon(null))}
          />
          <BillBreakdown bill={bill} />
          <Pressable
            accessibilityRole="button"
            style={styles.placeOrder}
            onPress={() => dispatch(placeOrder())}
          >
            <Text style={styles.placeOrderText}>
              Place order · {formatRupees(bill.total)}
            </Text>
            <Text style={styles.placeOrderArrow}>→</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear cart"
            onPress={() => dispatch(clearCart())}
            style={styles.clearCart}
          >
            <Text style={styles.clearCartText}>Clear cart</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 36 },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  pageTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 5,
  },
  pageSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 22,
  },
  emptyCart: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 27,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyIcon: { color: colors.green, fontSize: 29, marginBottom: 10 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginVertical: 12,
  },
  emptyHint: { color: colors.green, fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.3,
    marginBottom: 12,
    marginTop: 20,
  },
  placeOrder: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: colors.green,
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  placeOrderText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  placeOrderArrow: { color: colors.white, fontSize: 19 },
  clearCart: {
    alignSelf: 'center',
    padding: 12,
    marginTop: 3,
    minHeight: 44,
    justifyContent: 'center',
  },
  clearCartText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
});
