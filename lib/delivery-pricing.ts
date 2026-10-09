export const DELIVERY_SPEEDS = ["urgent", "same_day", "next_day", "two_day"] as const;
export type DeliverySpeed = (typeof DELIVERY_SPEEDS)[number];

export const EMIRATES = ["Dubai", "Sharjah", "Ajman", "Abu Dhabi", "Ras Al Khaimah", "Al Ain"] as const;
export type Emirate = (typeof EMIRATES)[number];

type DeliveryOption = {
  speed: DeliverySpeed;
  label: string;
  deliveryFee: number;
  timeframe: string;
};

const DESTINATION_FEES: Record<Exclude<Emirate, "Dubai" | "Sharjah"> | "Dubai" | "Sharjah", Record<DeliverySpeed, number>> = {
  Dubai: { urgent: 99, same_day: 99, next_day: 99, two_day: 99 },
  Sharjah: { urgent: 129, same_day: 109, next_day: 89, two_day: 79 },
  Ajman: { urgent: 159, same_day: 139, next_day: 109, two_day: 79 },
  "Abu Dhabi": { urgent: 269, same_day: 219, next_day: 169, two_day: 129 },
  "Ras Al Khaimah": { urgent: 249, same_day: 209, next_day: 149, two_day: 109 },
  "Al Ain": { urgent: 269, same_day: 249, next_day: 189, two_day: 129 },
};

const LABELS: Record<DeliverySpeed, string> = {
  urgent: "Urgent",
  same_day: "Same-day",
  next_day: "Next-day",
  two_day: "2-day",
};

const TIMEFRAMES: Record<DeliverySpeed, string> = {
  urgent: "Delivered before 10:00 PM",
  same_day: "Pickup and delivery before 10:00 PM",
  next_day: "Tomorrow, 10:00 AM - 10:00 PM",
  two_day: "Within 2 days, 10:00 AM - 10:00 PM",
};

export function dubaiHour(now = new Date()) {
  const value = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).find((part) => part.type === "hour")?.value;

  return Number(value ?? 0);
}

export function isSameDayAvailable(now = new Date()) {
  return dubaiHour(now) < 21;
}

export function getDeliveryOptions(
  pickupEmirate: Emirate,
  deliveryEmirate: Emirate,
  now = new Date()
): DeliveryOption[] {
  const base = pickupEmirate === deliveryEmirate
    ? { urgent: 99, same_day: 99, next_day: 99, two_day: 99 }
    : DESTINATION_FEES[deliveryEmirate];

  return DELIVERY_SPEEDS
    .filter((speed) => isSameDayAvailable(now) || (speed !== "urgent" && speed !== "same_day"))
    .map((speed) => ({
      speed,
      label: LABELS[speed],
      deliveryFee: base[speed],
      timeframe: pickupEmirate === deliveryEmirate && speed === "same_day"
        ? "Same-day local delivery"
        : TIMEFRAMES[speed],
    }));
}

export function getDeliveryFee(
  pickupEmirate: Emirate,
  deliveryEmirate: Emirate,
  speed: DeliverySpeed,
  now = new Date()
) {
  const option = getDeliveryOptions(pickupEmirate, deliveryEmirate, now)
    .find((candidate) => candidate.speed === speed);

  if (!option) {
    throw new Error("This delivery option is no longer available.");
  }

  return option.deliveryFee;
}

export function isEmirate(value: unknown): value is Emirate {
  return typeof value === "string" && EMIRATES.includes(value as Emirate);
}

export function isDeliverySpeed(value: unknown): value is DeliverySpeed {
  return typeof value === "string" && DELIVERY_SPEEDS.includes(value as DeliverySpeed);
}
