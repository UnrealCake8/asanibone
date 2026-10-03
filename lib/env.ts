function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const DEFAULT_SUPABASE_URL = "https://smetzgpxvlgkmbaeqais.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fsVIfV9_E_WcR3QbZi03Lg_rp-zMqhU";

export const publicEnv = {
  supabaseUrl: () => process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  supabasePublishableKey: () =>
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
};

export const serverEnv = {
  supabaseSecretKey: () => required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY),
  ziinaApiKey: () => required("ZIINA_API_KEY", process.env.ZIINA_API_KEY),
  ziinaApiBaseUrl: () => process.env.ZIINA_API_BASE_URL || "https://api-v2.ziina.com",
  ziinaWebhookSecret: () => required("ZIINA_WEBHOOK_SECRET", process.env.ZIINA_WEBHOOK_SECRET),
  ziinaTestMode: () => process.env.ZIINA_TEST_MODE === "true",
};
