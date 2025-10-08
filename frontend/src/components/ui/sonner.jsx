import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#333333] group-[.toaster]:border-[rgba(0,0,0,0.08)] group-[.toaster]:shadow-[0_24px_60px_-48px_rgba(51,51,51,0.35)] dark:group-[.toaster]:bg-slate-950 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800",
          description: "group-[.toast]:text-[#6f6f6f] dark:group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-gradient-to-r from-[#c8a9f1] to-[#f8c8a3] group-[.toast]:text-[#333333] dark:group-[.toast]:bg-slate-50 dark:group-[.toast]:text-slate-900",
          cancelButton:
            "group-[.toast]:bg-[#f0e9ff] group-[.toast]:text-[#4a4a4a] dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
