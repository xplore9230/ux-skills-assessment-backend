import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY not configured. Premium payment features will not work.");
}

// Create and export the Stripe client
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
    })
  : null;

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

// Get the price ID from environment (for the premium bundle)
export function getStripePriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ID;
}

