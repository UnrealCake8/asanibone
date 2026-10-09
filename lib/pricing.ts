import { getDeliveryFee, type DeliverySpeed, type Emirate } from "@/lib/delivery-pricing";

export const SHOPPING_SERVICE_PERCENT = 0.06;
export const MIN_SHOPPING_SERVICE_FEE = 15;

export function calculateQuote({
  itemAllowance,
  pickupEmirate,
  deliveryEmirate,
  deliverySpeed,
  orderType,
}: {
  itemAllowance: number;
  pickupEmirate: Emirate;
  deliveryEmirate: Emirate;
  deliverySpeed: DeliverySpeed;
  orderType: "purchase" | "pickup";
}) {
  const deliveryFee = getDeliveryFee(pickupEmirate, deliveryEmirate, deliverySpeed);
  const serviceFee = orderType === "purchase"
    ? Math.max(MIN_SHOPPING_SERVICE_FEE, Math.ceil(itemAllowance * SHOPPING_SERVICE_PERCENT * 100) / 100)
    : 0;

  return {
    itemAllowance,
    deliveryFee,
    serviceFee,
    paymentFee: 0,
    total: Math.round((itemAllowance + deliveryFee + serviceFee) * 100) / 100,
  };
}
