import React from "react";
import { Lock } from "@phosphor-icons/react";
import { PAYWALL_ENTRIES } from "./entries";
import type { UnlockType } from "@/context/PremiumAccessContext";

interface PaywallEntryCardProps {
  unlockType: UnlockType;
  onClick: () => void;
  className?: string;
  titleOverride?: string;
  bodyOverride?: string;
  ctaOverride?: string;
  size?: "default" | "compact";
  variant?: "overlay" | "card"; // overlay = glass blur on content, card = standalone card
}

/**
 * PaywallEntryCard - Entry point component matching Figma designs
 * 
 * Variants:
 * - overlay: Glass blur overlay on blurred content (matches Figma designs)
 * - card: Standalone card with gradient background
 */
export default function PaywallEntryCard({
  unlockType,
  onClick,
  className,
  titleOverride,
  bodyOverride,
  ctaOverride,
  size = "default",
  variant = "overlay",
}: PaywallEntryCardProps) {
  const meta = PAYWALL_ENTRIES[unlockType];
  const title = titleOverride ?? meta.title;
  const body = bodyOverride ?? meta.body;
  const ctaLabel = ctaOverride ?? meta.ctaLabel;

  // Size-based dimensions from Figma
  const iconSize = size === "compact" ? 18 : 24;
  const titleSize = size === "compact" ? "text-[13.39px]" : "text-[18px]";
  const bodySize = size === "compact" ? "text-[10.42px]" : "text-[14px]";
  const buttonHeight = size === "compact" ? "h-[37.2px]" : "h-[50px]";
  const buttonTextSize = size === "compact" ? "text-[11.9px]" : "text-[16px]";
  const gap = size === "compact" ? "gap-[7.44px]" : "gap-[10px]";
  const padding = size === "compact" ? "p-[7.44px]" : "p-[10px]";

  if (variant === "overlay") {
    // Glass blur overlay variant (matches Figma designs exactly)
    return (
      <div
        className={`relative flex flex-col items-center ${gap} ${className || ""}`}
      >
        {/* Lock Icon */}
        <div className="flex items-center">
          <Lock 
            size={iconSize} 
            weight="duotone"
            className="text-foreground"
          />
        </div>

        {/* Title and Body */}
        <div className="flex flex-col items-center text-center w-full gap-[3px]">
          <p className={`font-bold ${titleSize} text-foreground w-full`}>
            {title}
          </p>
          <p className={`font-normal ${bodySize} text-foreground w-full`}>
            {body}
          </p>
        </div>

        {/* Black Unlock Button */}
        <button
          onClick={onClick}
          className={`bg-black flex items-center justify-center ${buttonHeight} ${padding} rounded-[15px] w-full transition-opacity hover:opacity-90`}
        >
          <p className={`font-medium ${buttonTextSize} text-white whitespace-nowrap`}>
            {ctaLabel}
          </p>
        </button>
      </div>
    );
  }

  // Card variant (gradient background)
  const baseClasses =
    "rounded-xl border border-white/40 text-left bg-[linear-gradient(135deg,#E6F2FF_0%,#FFFFFF_50%,#E6F2FF_100%)] " +
    "backdrop-blur-xl shadow-[0_10px_40px_rgba(56,189,248,0.15)] hover:shadow-[0_20px_60px_rgba(56,189,248,0.25)] " +
    "transition-all duration-300 ease-out";
  const cardPadding = size === "compact" ? "p-4" : "p-6";
  const titleClass = size === "compact" ? "text-sm text-foreground/80 mb-1" : "text-sm text-foreground/80 mb-1";
  const bodyClass = size === "compact" ? "text-sm font-medium text-foreground" : "text-base font-medium text-foreground";
  const pillWrapperClass = size === "compact" ? "mt-2" : "mt-3";
  const pillSizeClass = size === "compact" ? "text-xs px-4 py-1.5" : "";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${cardPadding} ${className || ""}`}
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          size === "compact"
            ? "translateY(-2px) perspective(1000px) rotateX(1.5deg) rotateY(-1.5deg)"
            : "translateY(-4px) perspective(1000px) rotateX(2deg) rotateY(-2deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg)";
      }}
    >
      <div className={titleClass}>{title}</div>
      <div className={bodyClass}>{body}</div>
      <div className={pillWrapperClass}>
        {/* Black button styling - outer button handles click */}
        <div
          className={`bg-black flex items-center justify-center ${buttonHeight} ${padding} rounded-[15px] w-full transition-opacity hover:opacity-90`}
        >
          <p className={`font-medium ${buttonTextSize} text-white whitespace-nowrap`}>
            {ctaLabel}
          </p>
        </div>
      </div>
    </button>
  );
}
