import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-[var(--color-outline)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text)] ring-offset-white placeholder:text-[#a0a0a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a9f1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }
