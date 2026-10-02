export type OrderStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "finding_courier"
  | "courier_assigned"
  | "heading_to_store"
  | "at_store"
  | "purchased"
  | "delivering"
  | "delivered"
  | "cancelled"
  | "failed";

export type Quote = {
  itemAllowance: number;
  deliveryFee: number;
  serviceFee: number;
  paymentFee: number;
  total: number;
};

export type OrderDraft = {
  itemDescription: string;
  productUrl?: string;
  storeName: string;
  storeLocation: string;
  estimate: number;
  buffer: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  phone: string;
};
