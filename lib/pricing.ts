export const DEFAULT_DELIVERY_FEE = 20;
export const DEFAULT_SERVICE_FEE = 10;
export const ZIINA_PERCENT = 0.026;
export const ZIINA_FIXED_AED = 1;

export function calculatePaymentFee(desiredNet: number) {
  if (desiredNet <= 0) return 0;
  return Math.ceil(((desiredNet + ZIINA_FIXED_AED) / (1 - ZIINA_PERCENT) - desiredNet) * 100) / 100;
}

export function calculateQuote(itemAllowance: number, deliveryFee = DEFAULT_DELIVERY_FEE, serviceFee = DEFAULT_SERVICE_FEE) {
  const desiredNet = itemAllowance + deliveryFee + serviceFee;
  const paymentFee = calculatePaymentFee(desiredNet);
  return {
    itemAllowance,
    deliveryFee,
    serviceFee,
    paymentFee,
    total: desiredNet + paymentFee,
  };
}
