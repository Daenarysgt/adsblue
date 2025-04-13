"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useTheme } from "next-themes"

interface SuggestionButtonProps {
  text: string
  onClick: () => void
  className?: string
  icon?: ReactNode
}

export default function SuggestionButton({ text, onClick, className, icon }: SuggestionButtonProps) {
  const { theme } = useTheme()

  // Helper function to get theme-specific classes
  const getThemeClass = (lightClass: string, darkClass: string) => {
    return theme === "light" ? lightClass : darkClass
  }

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button
        variant="outline"
        onClick={onClick}
        className={cn(
          getThemeClass(
            "border-gray-200 bg-gradient-to-r from-purple-100/50 to-blue-100/50 hover:from-purple-100/80 hover:to-blue-100/80 text-gray-800",
            "border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 transition-all text-left justify-start h-auto py-3 px-4 rounded-xl",
          ),
          className,
        )}
      >
        {icon && <span>{icon}</span>}
        {text}
      </Button>
    </motion.div>
  )
}
