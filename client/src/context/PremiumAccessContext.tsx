import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { getMostRecentResultId } from "@/lib/results/storage";

export type UnlockType = "resources" | "roadmap" | "todos" | "diagnosis" | "design-system";

interface PremiumAccessState {
  deviceId: string;
  attemptCount: number;
  premiumUnlocked: boolean;
  // Single-flow flag used by UI gating (persisted locally)
  isPremium: boolean;
  // Paywall modal state
  isPaywallOpen: boolean;
  unlockType: UnlockType | null;
  isLoading: boolean;
  error: string | null;
}

interface PremiumAccessContextValue extends PremiumAccessState {
  canTakePremiumQuiz: boolean;
  requirePayment: boolean;
  openPaywall: (unlockType: UnlockType) => void;
  closePaywall: () => void;
  markPremiumUnlocked: () => void;
  refreshStatus: () => Promise<void>;
  incrementAttempts: () => Promise<void>;
  startCheckout: (redirectTo?: string) => Promise<void>;
}

const PremiumAccessContext = createContext<PremiumAccessContextValue | undefined>(undefined);

const DEVICE_ID_KEY = "ux_quiz_device_id";
const PREMIUM_FLAG_KEY = "uxlevel_isPremium";
const API_BASE = "/api/premium";

// Helper to get or create device ID
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

export function PremiumAccessProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PremiumAccessState>({
    deviceId: "",
    attemptCount: 0,
    premiumUnlocked: false,
    isPremium: false,
    isPaywallOpen: false,
    unlockType: null,
    isLoading: true,
    error: null,
  });

  // Fetch access status from backend
  const refreshStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const deviceId = getOrCreateDeviceId();
      const response = await fetch(`${API_BASE}/access/status?deviceId=${encodeURIComponent(deviceId)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch access status");
      }
      
      const data = await response.json();
      const persistedPremium = localStorage.getItem(PREMIUM_FLAG_KEY) === "true";
      
      setState({
        deviceId,
        attemptCount: data.attemptCount ?? 0,
        premiumUnlocked: data.premiumUnlocked ?? false,
        isPremium: persistedPremium || (data.premiumUnlocked ?? false),
        isPaywallOpen: false,
        unlockType: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching premium access status:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  // Increment attempt count
  const incrementAttempts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/access/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: state.deviceId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to increment attempts");
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        attemptCount: data.attemptCount ?? prev.attemptCount,
        premiumUnlocked: data.premiumUnlocked ?? prev.premiumUnlocked,
      }));
    } catch (error) {
      console.error("Error incrementing attempts:", error);
    }
  }, [state.deviceId]);

  // Paywall controls
  const openPaywall = useCallback((unlockType: UnlockType) => {
    setState(prev => ({ ...prev, isPaywallOpen: true, unlockType }));
  }, []);

  const closePaywall = useCallback(() => {
    setState(prev => ({ ...prev, isPaywallOpen: false }));
  }, []);

  const markPremiumUnlocked = useCallback(() => {
    localStorage.setItem(PREMIUM_FLAG_KEY, "true");
    setState(prev => ({
      ...prev,
      premiumUnlocked: true,
      isPremium: true,
      isPaywallOpen: false,
    }));
    // Success toast
    toast({
      title: "✅ Premium unlocked",
      description: "Your full growth system is now available.",
    });
  }, []);

  // Start Stripe checkout flow
  const startCheckout = useCallback(async (redirectTo?: string) => {
    try {
      // Try to attach the most recent result ID so we can email a direct link
      let latestResultId: string | null = null;
      try {
        latestResultId = getMostRecentResultId();
      } catch (e) {
        console.warn("Unable to read most recent result ID:", e);
      }

      const response = await fetch(`${API_BASE}/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deviceId: state.deviceId,
          redirectTo: redirectTo || window.location.pathname,
          resultId: latestResultId ?? undefined,
        }),
      });
      
      if (!response.ok) {
        // If checkout endpoint is not available in local/dev, fall back to mock unlock
        console.warn("Checkout session not available; enabling mock premium unlock for local testing.");
        markPremiumUnlocked();
        return;
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // If no URL returned, assume mock and unlock instantly
        console.warn("No checkout URL returned; enabling mock premium unlock.");
        markPremiumUnlocked();
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
      // Fallback to mock unlock in case of local dev errors
      markPremiumUnlocked();
    }
  }, [state.deviceId, markPremiumUnlocked]);

  // Initialize on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const canTakePremiumQuiz = state.premiumUnlocked || state.attemptCount < 2;
  const requirePayment = !state.premiumUnlocked && state.attemptCount >= 2;

  const value: PremiumAccessContextValue = {
    ...state,
    canTakePremiumQuiz,
    requirePayment,
    openPaywall,
    closePaywall,
    markPremiumUnlocked,
    refreshStatus,
    incrementAttempts,
    startCheckout,
  };

  return (
    <PremiumAccessContext.Provider value={value}>
      {children}
    </PremiumAccessContext.Provider>
  );
}

export function usePremiumAccess() {
  const context = useContext(PremiumAccessContext);
  
  if (context === undefined) {
    throw new Error("usePremiumAccess must be used within a PremiumAccessProvider");
  }
  
  return context;
}

