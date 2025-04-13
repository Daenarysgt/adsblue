"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight, Star, Zap, BarChart3, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"

export default function WelcomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const handleGetStarted = () => {
    setLoading(true)
    setTimeout(() => {
      router.push("/chat")
    }, 800)
  }

  const consultantStyles = [
    { name: "Direct", icon: <Zap className="w-4 h-4" />, description: "Clear, concise guidance" },
    { name: "Detailed", icon: <BarChart3 className="w-4 h-4" />, description: "In-depth analysis" },
    { name: "Strategic", icon: <Star className="w-4 h-4" />, description: "Long-term planning" },
    { name: "Creative", icon: <Lightbulb className="w-4 h-4" />, description: "Innovative approaches" },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0e] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[120px]"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-8 z-10 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-28 h-28 mb-4"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl opacity-70 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
            Copilot Ads
          </h1>

          <p className="text-xl text-gray-300 mt-2">Seu consultor pessoal de tráfego pago</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-sm p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-purple-500/50 via-transparent to-blue-500/50 blur-[1px]"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-medium mb-6 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Escolha seu estilo de consultor
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {consultantStyles.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyle(style.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                    selectedStyle === style.name
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20"
                      : "bg-black/30 border border-white/5 hover:border-white/10 hover:bg-black/40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      selectedStyle === style.name
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : "bg-gray-800 group-hover:bg-gray-700"
                    }`}
                  >
                    {style.icon}
                  </div>
                  <span className="font-medium">{style.name}</span>
                  <span className="text-xs text-gray-400 mt-1">{style.description}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleGetStarted}
              disabled={loading || !selectedStyle}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl flex items-center justify-center group relative overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/0 via-white/10 to-blue-600/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              <span className="relative flex items-center">
                {loading ? "Preparando sua experiência..." : "Iniciar consultoria personalizada"}
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm text-gray-400"
        >
          Otimize suas estratégias de Facebook, Google e mídia paga com orientação especializada
        </motion.p>
      </div>
    </div>
  )
}
