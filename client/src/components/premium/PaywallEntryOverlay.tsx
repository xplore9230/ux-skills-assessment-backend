import React from "react";
import PaywallEntryCard from "./PaywallEntryCard";
import type { UnlockType } from "@/context/PremiumAccessContext";

interface PaywallEntryOverlayProps {
  unlockType: UnlockType;
  onClick: () => void;
  children?: React.ReactNode; // Content to blur behind overlay
  className?: string;
  overlayWidth?: string;
  overlayHeight?: string;
  size?: "default" | "compact";
  titleOverride?: string;
  bodyOverride?: string;
  ctaOverride?: string;
}

/**
 * PaywallEntryOverlay - Glass blur overlay matching Figma designs
 * 
 * Shows blurred content behind a glass overlay with the entry card centered.
 * Matches the Figma design pattern where content is blurred and an overlay appears on top.
 */
export default function PaywallEntryOverlay({
  unlockType,
  onClick,
  children,
  className,
  overlayWidth = "w-[1099px]",
  overlayHeight = "h-[191px]",
  size = "default",
  titleOverride,
  bodyOverride,
  ctaOverride,
}: PaywallEntryOverlayProps) {
  // Adjust overlay size for compact variant
  // If overlayWidth/Height are provided, use them; otherwise use defaults
  const widthClass = overlayWidth || (size === "compact" ? "w-[529px]" : "w-[1099px]");
  const heightClass = overlayHeight || (size === "compact" ? "h-[134px]" : "h-[191px]");
  
  // Check if using full width/height (for proper layout)
  const isFullSize = overlayWidth === "w-full" || overlayHeight === "h-full";
  const overlayStyle = isFullSize 
    ? {} // No transform centering for full-size overlays
    : {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <div className={`relative ${className || ""}`}>
      {/* Blurred content behind (if provided) */}
      {children && (
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
      )}

      {/* Glass blur overlay backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-[7px] bg-[rgba(255,255,255,0.7)] ${widthClass} ${heightClass} flex items-center justify-center`}
        style={overlayStyle}
      >
        {/* Centered entry card */}
        <div className="w-[250px]">
          <PaywallEntryCard
            unlockType={unlockType}
            onClick={onClick}
            variant="overlay"
            size={size}
            titleOverride={titleOverride}
            bodyOverride={bodyOverride}
            ctaOverride={ctaOverride}
          />
        </div>
      </div>
    </div>
  );
}

