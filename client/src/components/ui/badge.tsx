import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        outline: "border [border-color:var(--badge-outline)] shadow-xs",
        // Colorful tag variants
        tagBlue: "border-transparent bg-[hsl(180,60%,45%)] text-white shadow-sm hover:bg-[hsl(180,60%,50%)] hover:shadow-md hover:scale-105",
        tagTeal: "border-transparent bg-[hsl(180,50%,50%)] text-white shadow-sm hover:bg-[hsl(180,50%,55%)] hover:shadow-md hover:scale-105",
        tagOrange: "border-transparent bg-[hsl(25,90%,50%)] text-white shadow-sm hover:bg-[hsl(25,90%,55%)] hover:shadow-md hover:scale-105",
        tagGreen: "border-transparent bg-[hsl(142,70%,45%)] text-white shadow-sm hover:bg-[hsl(142,70%,50%)] hover:shadow-md hover:scale-105",
        tagPurple: "border-transparent bg-[hsl(270,60%,55%)] text-white shadow-sm hover:bg-[hsl(270,60%,60%)] hover:shadow-md hover:scale-105",
        tagPink: "border-transparent bg-[hsl(330,70%,60%)] text-white shadow-sm hover:bg-[hsl(330,70%,65%)] hover:shadow-md hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  animated?: boolean;
  delay?: number;
}

// Helper function to assign a color variant based on tag text
export function getTagVariant(tag: string): "tagBlue" | "tagTeal" | "tagOrange" | "tagGreen" | "tagPurple" | "tagPink" {
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variants: Array<"tagBlue" | "tagTeal" | "tagOrange" | "tagGreen" | "tagPurple" | "tagPink"> = [
    "tagBlue",
    "tagTeal",
    "tagOrange",
    "tagGreen",
    "tagPurple",
    "tagPink",
  ];
  return variants[Math.abs(hash) % variants.length];
}

function Badge({ className, variant, animated = false, delay = 0, ...props }: BadgeProps) {
  const badgeClasses = cn(badgeVariants({ variant }), className);

  if (animated) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        className={badgeClasses}
        {...props}
      />
    );
  }

  return <span className={badgeClasses} {...props} />;
}

export { Badge, badgeVariants }
