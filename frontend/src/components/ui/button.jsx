import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a9f1] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#c8a9f1] to-[#f8c8a3] text-[#333333] shadow-[0_12px_30px_-18px_rgba(200,169,241,0.8)] hover:from-[#b897e9] hover:to-[#f6b98d]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-[rgba(0,0,0,0.08)] bg-white text-[#4a4a4a] hover:border-[rgba(0,0,0,0.15)] hover:bg-[#fdf9ff]",
        secondary: "bg-[#e8d6c6] text-[#4a4a4a] hover:bg-[#ddc4b0]",
        ghost: "hover:bg-[#f0e9ff] hover:text-[#4a4a4a]",
        link: "text-[#4a4a4a] underline-offset-4 hover:text-[#c8a9f1]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
