export const couponRules = {
  FLAT50: {
    label: '₹50 off on item totals of ₹300 or more',
    minimumSubtotal: 300,
    oneTime: false,
    discount: () => 50,
    freeDelivery: false,
  },
  SAVE10: {
    label: '10% off, up to ₹100',
    minimumSubtotal: 0,
    oneTime: false,
    discount: (subtotal: number) => Math.min(Math.round(subtotal * 0.1), 100),
    freeDelivery: false,
  },
  FREEDEL: {
    label: 'Free delivery',
    minimumSubtotal: 0,
    oneTime: false,
    discount: () => 0,
    freeDelivery: true,
  },
  FIRST100: {
    label: '₹100 off on item totals of ₹200 or more · one use',
    minimumSubtotal: 200,
    oneTime: true,
    discount: () => 100,
    freeDelivery: false,
  },
} as const;

export type CouponCode = keyof typeof couponRules;
export type CouponValidation = { valid: true } | { valid: false; reason: string };

export function validateCoupon(
  code: string,
  subtotal: number,
  usedCoupons: readonly CouponCode[] = [],
): CouponValidation {
  const normalized = code.trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(couponRules, normalized)) return { valid: false, reason: 'That coupon code is not recognized.' };
  const couponCode = normalized as CouponCode;
  const rule = couponRules[couponCode];
  if (subtotal <= 0) return { valid: false, reason: 'Add an item before applying a coupon.' };
  if (subtotal < rule.minimumSubtotal) {
    return { valid: false, reason: `${couponCode} needs an item total of ₹${rule.minimumSubtotal}.` };
  }
  if (rule.oneTime && usedCoupons.includes(couponCode)) {
    return { valid: false, reason: `${couponCode} has already been used on this account.` };
  }
  return { valid: true };
}

export function couponDiscount(code: CouponCode | null, subtotal: number): number {
  if (!code) return 0;
  const rule = couponRules[code];
  return Math.min(subtotal, rule.discount(subtotal));
}

export function couponWaivesDelivery(code: CouponCode | null): boolean {
  return code !== null && couponRules[code].freeDelivery;
}
