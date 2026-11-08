import { calculateBill, deliveryFee, freeDeliveryThreshold } from './cartLogic';
import { validateCoupon } from './couponRules';

describe('bill and coupon rules', () => {
  it('charges ₹40 below ₹499 and no delivery fee at ₹499', () => {
    expect(calculateBill(498, null).delivery).toBe(deliveryFee);
    expect(calculateBill(freeDeliveryThreshold, null).delivery).toBe(0);
    expect(calculateBill(0, null).total).toBe(0);
  });

  it('requires ₹300 for FLAT50 and caps discount at item total', () => {
    expect(validateCoupon('FLAT50', 299).valid).toBe(false);
    expect(calculateBill(300, 'FLAT50')).toEqual({
      subtotal: 300,
      discount: 50,
      delivery: 40,
      total: 290,
    });
    expect(calculateBill(30, 'FLAT50').discount).toBe(0);
  });

  it('takes 10% off with a ₹100 SAVE10 cap', () => {
    expect(calculateBill(200, 'SAVE10').discount).toBe(20);
    expect(calculateBill(1500, 'SAVE10').discount).toBe(100);
  });

  it('waives delivery for FREEDEL', () => {
    expect(calculateBill(150, 'FREEDEL')).toEqual({
      subtotal: 150,
      discount: 0,
      delivery: 0,
      total: 150,
    });
  });

  it('requires ₹200 for FIRST100 and only permits one use', () => {
    expect(validateCoupon('FIRST100', 199).valid).toBe(false);
    expect(calculateBill(200, 'FIRST100').discount).toBe(100);
    expect(validateCoupon('FIRST100', 300, ['FIRST100'])).toEqual({
      valid: false,
      reason: 'FIRST100 has already been used on this account.',
    });
  });

  it('normalizes coupon codes and rejects unknown codes and empty carts', () => {
    expect(validateCoupon(' save10 ', 200)).toEqual({ valid: true });
    expect(validateCoupon('NOTREAL', 200).valid).toBe(false);
    expect(validateCoupon('SAVE10', 0).valid).toBe(false);
  });

  it('never applies a stale or invalid coupon while calculating a bill', () => {
    expect(calculateBill(100, 'FIRST100')).toEqual({
      subtotal: 100,
      discount: 0,
      delivery: 40,
      total: 140,
    });
    expect(calculateBill(200, 'FIRST100', ['FIRST100']).discount).toBe(0);
  });
});
