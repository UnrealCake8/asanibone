function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const publicEnv = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: () => required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
};

export const serverEnv = {
  ziinaApiKey: () => required("ZIINA_API_KEY", process.env.ZIINA_API_KEY),
  ziinaApiBaseUrl: () => required("ZIINA_API_BASE_URL", process.env.ZIINA_API_BASE_URL),
};
