// Purchase service — abstracts the store layer behind a single call.
// When EXPO_PUBLIC_RC_API_KEY is set AND react-native-purchases is installed
// (a dev/standalone build), it runs the real RevenueCat flow. Otherwise it
// resolves as a sandbox success so the app stays usable in Expo Go.
import { CONFIG } from '@/config';

export type PaidPlan = 'plus' | 'lifetime';

// RevenueCat product/entitlement identifiers (configure to match your dashboard).
export const RC_PRODUCTS: Record<string, string> = {
  monthly: 'versebite_plus_monthly',
  yearly: 'versebite_plus_yearly',
  lifetime: 'versebite_lifetime',
};

let configured = false;

async function getPurchases() {
  try {
    // Dynamically required so the app runs without the native module present.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-purchases');
    return (mod.default ?? mod) as any;
  } catch {
    return null;
  }
}

export async function configurePurchases(): Promise<void> {
  if (!CONFIG.rcApiKey || configured) return;
  const Purchases = await getPurchases();
  if (!Purchases) return;
  try {
    Purchases.configure({ apiKey: CONFIG.rcApiKey });
    configured = true;
  } catch {
    /* ignore */
  }
}

/** Purchase a plan. Returns true on success (or in sandbox/unconfigured mode). */
export async function purchasePlan(plan: PaidPlan, sku = 'yearly'): Promise<boolean> {
  if (!CONFIG.rcApiKey) return true; // sandbox: grant locally
  const Purchases = await getPurchases();
  if (!Purchases) return true;
  try {
    await configurePurchases();
    const productId = plan === 'lifetime' ? RC_PRODUCTS.lifetime : RC_PRODUCTS[sku] || RC_PRODUCTS.yearly;
    const offerings = await Purchases.getOfferings();
    const pkg = offerings?.current?.availablePackages?.find((p: any) => p.product?.identifier === productId);
    if (!pkg) return false;
    await Purchases.purchasePackage(pkg);
    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!CONFIG.rcApiKey) return false;
  const Purchases = await getPurchases();
  if (!Purchases) return false;
  try {
    const info = await Purchases.restorePurchases();
    return Object.keys(info?.entitlements?.active ?? {}).length > 0;
  } catch {
    return false;
  }
}
