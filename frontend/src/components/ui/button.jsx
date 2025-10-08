import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold tracking-wide ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a9f1] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-solid)] text-[#333333] shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:bg-[#c0a4eb]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-[var(--color-outline)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
        secondary: "bg-[var(--color-accent-soft)] text-[var(--color-text)] hover:bg-[#d9c4ad]",
        ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]",
        link: "text-[var(--color-text)] underline-offset-4 hover:text-[var(--color-primary-start)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-md px-10",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
