import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm text-[#333333] ring-offset-white placeholder:text-[#b8b8b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a9f1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }
