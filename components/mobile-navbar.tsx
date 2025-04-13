"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  History,
  User,
  Settings,
  Menu,
  Sparkles,
  Facebook,
  ChromeIcon as Google,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  Star,
  PlusCircle,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"

type ConsultantStyle = "Direto" | "Detalhado" | "Estratégico" | "Criativo" | null

interface MobileNavbarProps {
  onNewChat: () => void
  onPlatformSelect: (platform: string) => void
  onAnalyticsOpen: () => void
  onBenchmarksOpen: () => void
  onHistoryOpen: () => void
  onProfileOpen: () => void
  onSettingsOpen: () => void
  consultantStyle: ConsultantStyle
  onStyleSelect: (style: ConsultantStyle) => void
}

export default function MobileNavbar({
  onNewChat,
  onPlatformSelect,
  onAnalyticsOpen,
  onBenchmarksOpen,
  onHistoryOpen,
  onProfileOpen,
  onSettingsOpen,
  consultantStyle,
  onStyleSelect,
}: MobileNavbarProps) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  const handleAction = (action: () => void) => {
    action()
    setOpen(false)
  }

  // Helper function to get theme-specific classes
  const getThemeClass = (lightClass: string, darkClass: string) => {
    return theme === "light" ? lightClass : darkClass
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 left-4 z-50 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white")}`}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className={`w-72 ${getThemeClass("bg-white", "bg-black/95")} backdrop-blur-xl ${getThemeClass("border-gray-200", "border-white/10")} p-0`}
      >
        <div
          className={`p-6 border-b ${getThemeClass("border-gray-200", "border-white/10")} flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} flex items-center justify-center ${getThemeClass("light-glow", "dark-glow")}`}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`font-semibold text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Copilot Ads
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="p-4">
          <Button
            onClick={() => handleAction(onNewChat)}
            className={`w-full mb-4 ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600 text-white ${getThemeClass("light-glow", "dark-glow")}`}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Chat
          </Button>

          <div className="mb-6">
            <h3
              className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}
            >
              Plataformas
            </h3>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(() => onPlatformSelect("Facebook Ads"))}
            >
              <Facebook className="mr-3 h-4 w-4 text-blue-400" />
              Facebook Ads
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(() => onPlatformSelect("Google Ads"))}
            >
              <Google className="mr-3 h-4 w-4 text-red-400" />
              Google Ads
            </Button>
          </div>

          <div className="mb-6">
            <h3
              className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}
            >
              Ferramentas
            </h3>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(onAnalyticsOpen)}
            >
              <BarChart3 className="mr-3 h-4 w-4 text-purple-400" />
              Analytics
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(onBenchmarksOpen)}
            >
              <Target className="mr-3 h-4 w-4 text-green-400" />
              Benchmarks
            </Button>
          </div>

          <div className="mb-6">
            <h3
              className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}
            >
              Conta
            </h3>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(onHistoryOpen)}
            >
              <History className="mr-3 h-4 w-4" />
              Histórico
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(onProfileOpen)}
            >
              <User className="mr-3 h-4 w-4" />
              Perfil
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
              onClick={() => handleAction(onSettingsOpen)}
            >
              <Settings className="mr-3 h-4 w-4" />
              Configurações
            </Button>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div
              className={`${getThemeClass("bg-gradient-to-r from-purple-100 to-blue-100", "bg-gradient-to-r from-purple-900/30 to-blue-900/30")} rounded-xl p-4`}
            >
              <h4 className="font-medium text-sm mb-2">Estilo de Consultor</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Direto" as const, icon: <Zap className="w-3 h-3" /> },
                  { name: "Detalhado" as const, icon: <BarChart3 className="w-3 h-3" /> },
                  { name: "Estratégico" as const, icon: <Star className="w-3 h-3" /> },
                  { name: "Criativo" as const, icon: <Lightbulb className="w-3 h-3" /> },
                ].map((style) => (
                  <Button
                    key={style.name}
                    size="sm"
                    variant={consultantStyle === style.name ? "default" : "outline"}
                    onClick={() => {
                      onStyleSelect(style.name)
                      setOpen(false)
                    }}
                    className={`h-8 ${
                      consultantStyle === style.name
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none"
                        : `${getThemeClass("border-gray-200 bg-white/70 hover:bg-white/90", "border-white/10 bg-black/30 hover:bg-black/50")}`
                    } flex items-center justify-center`}
                  >
                    {style.icon}
                    <span className="ml-1 text-xs">{style.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
