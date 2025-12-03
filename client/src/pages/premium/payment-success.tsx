import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremiumAccess } from "@/context/PremiumAccessContext";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/premium/payment-success");
  const { refreshStatus } = usePremiumAccess();
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        const deviceId = urlParams.get("deviceId");
        const redirectTo = urlParams.get("redirectTo");

        if (!sessionId || !deviceId) {
          setStatus("error");
          setErrorMessage("Missing payment information. Please try again.");
          return;
        }

        // Confirm payment with backend
        const response = await fetch(
          `/api/premium/payments/confirm?session_id=${encodeURIComponent(sessionId)}&deviceId=${encodeURIComponent(deviceId)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment confirmation failed");
        }

        const data = await response.json();

        if (data.success && data.premiumUnlocked) {
          // Refresh premium status in context
          await refreshStatus();
          setStatus("success");

          // Redirect after 3 seconds
          setTimeout(() => {
            setLocation(redirectTo || "/premium/results");
          }, 3000);
        } else {
          throw new Error("Payment was not successful");
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to confirm payment"
        );
      }
    };

    confirmPayment();
  }, [refreshStatus, setLocation]);

  if (status === "confirming") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="inline-flex p-6 rounded-full bg-primary/10 animate-pulse">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-serif font-bold text-3xl">Confirming Payment...</h1>
          <p className="text-muted-foreground">
            Please wait while we verify your payment and unlock premium features.
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="inline-flex p-6 rounded-full bg-destructive/10">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="font-serif font-bold text-3xl">Payment Issue</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <Button
            onClick={() => setLocation("/premium/quiz")}
            variant="outline"
            className="gap-2"
          >
            Return to Quiz
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex p-6 rounded-full bg-green-500/10"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h1 className="font-serif font-bold text-4xl">Welcome to Premium!</h1>
          <p className="text-muted-foreground text-lg">
            Your payment was successful. You now have unlimited access to all premium
            features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4 space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>All premium content unlocked</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Unlimited quiz attempts</span>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Redirecting you in a moment...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

