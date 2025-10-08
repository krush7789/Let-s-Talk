import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[rgba(0,0,0,0.06)] px-2.5 py-0.5 text-xs font-semibold text-[#4a4a4a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8a9f1] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#f0e9ff] text-[#4a4a4a]",
        secondary: "border-transparent bg-[#e8d6c6] text-[#4a4a4a]",
        destructive: "border-transparent bg-[#f5d4d4] text-[#9d4c4c]",
        outline: "text-[#4a4a4a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants }
