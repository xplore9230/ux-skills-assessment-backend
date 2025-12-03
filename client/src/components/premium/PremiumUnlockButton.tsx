import React from "react";

interface PremiumUnlockButtonProps {
  children?: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * Glossy blue pill with soft glow and animated shimmer.
 * Use inside clickable wrappers (e.g., a parent button).
 */
export default function PremiumUnlockButton({
  children,
  label,
  className,
}: PremiumUnlockButtonProps) {
  return (
    <span
      className={
        "relative inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white " +
        "bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600 " +
        "shadow-[0_10px_30px_rgba(56,189,248,0.25)] " +
        "hover:shadow-[0_16px_40px_rgba(56,189,248,0.35)] " +
        "transition-all duration-300 ease-out " +
        (className || "")
      }
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-md -skew-x-12"
        style={{
          animation: "unlock-shimmer 1.8s ease-in-out 0.4s infinite",
        }}
      />
      <span className="relative z-10">{children ?? label}</span>
      <style>
        {`
@keyframes unlock-shimmer {
  0% { transform: translateX(-60%); opacity: 0.0; }
  15% { opacity: 0.9; }
  50% { transform: translateX(260%); opacity: 0.6; }
  85% { opacity: 0.0; }
  100% { transform: translateX(260%); opacity: 0.0; }
}
        `}
      </style>
    </span>
  );
}


