import {
  couponDiscount,
  couponWaivesDelivery,
  CouponCode,
  validateCoupon,
} from './couponRules';

export type CartLine = { medicineId: string; quantity: number };
export type Bill = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export const deliveryFee = 40;
export const freeDeliveryThreshold = 499;

export function calculateBill(
  subtotal: number,
  coupon: CouponCode | null,
  usedCoupons: readonly CouponCode[] = [],
): Bill {
  const activeCoupon =
    coupon && validateCoupon(coupon, subtotal, usedCoupons).valid
      ? coupon
      : null;
  const discount = couponDiscount(activeCoupon, subtotal);
  const delivery =
    subtotal === 0 ||
    couponWaivesDelivery(activeCoupon) ||
    subtotal >= freeDeliveryThreshold
      ? 0
      : deliveryFee;
  return {
    subtotal,
    discount,
    delivery,
    total: Math.max(0, subtotal - discount + delivery),
  };
}
