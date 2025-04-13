"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sparkles,
  Send,
  Menu,
  History,
  User,
  Settings,
  ArrowLeft,
  Facebook,
  ChromeIcon as Google,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  Star,
  PlusCircle,
  ImageIcon,
  Mic,
  X,
  Pause,
  Play,
  StopCircle,
} from "lucide-react"
import ChatMessage from "@/components/chat-message"
import SuggestionButton from "@/components/suggestion-button"
import MobileNavbar from "@/components/mobile-navbar"
import { useMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { logout } from "@/app/auth/logout"

type MessageContent = string | { type: "image"; url: string } | { type: "audio"; url: string; duration: number }

type Message = {
  id: string
  role: "user" | "assistant"
  content: MessageContent
  timestamp: Date
}

type ConsultantStyle = "Direto" | "Detalhado" | "Estratégico" | "Criativo" | null

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Olá! Sou seu consultor Copilot Ads. Como posso ajudar a otimizar suas campanhas de tráfego pago hoje?",
      timestamp: new Date(Date.now()),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Dialogs state
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [benchmarksOpen, setBenchmarksOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Consultant style state
  const [consultantStyle, setConsultantStyle] = useState<ConsultantStyle>(null)

  // Load consultant style from localStorage on mount
  useEffect(() => {
    const savedStyle = localStorage.getItem("consultantStyle") as ConsultantStyle
    if (savedStyle) {
      setConsultantStyle(savedStyle)
    }
  }, [])

  // Save consultant style to localStorage when changed
  useEffect(() => {
    if (consultantStyle) {
      localStorage.setItem("consultantStyle", consultantStyle)
    }
  }, [consultantStyle])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Cancel image upload
  const cancelImageUpload = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      setRecordingTimer(timer)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador.")
    }
  }

  // Pause/resume recording
  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume timer
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
      setRecordingTimer(timer)
    } else {
      // Pause recording
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      // Pause timer
      if (recordingTimer) {
        clearInterval(recordingTimer)
        setRecordingTimer(null)
      }
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setIsRecording(false)
    setIsPaused(false)

    // Stop timer
    if (recordingTimer) {
      clearInterval(recordingTimer)
      setRecordingTimer(null)
    }
  }

  // Cancel audio recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    setIsRecording(false)
    setIsPaused(false)
    setAudioURL(null)
    setRecordingDuration(0)

    // Stop timer
    if (recordingTimer) {
      clearInterval(recordingTimer)
      setRecordingTimer(null)
    }
  }

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Send audio message
  const sendAudioMessage = () => {
    if (!audioURL) return

    // Add user message with audio
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: {
        type: "audio",
        url: audioURL,
        duration: recordingDuration,
      },
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Reset audio state
    setAudioURL(null)
    setRecordingDuration(0)

    // Simulate AI response after a delay
    setTimeout(() => {
      const now = new Date()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Recebi seu áudio! Estou analisando o conteúdo para fornecer a melhor orientação para suas campanhas de tráfego pago.",
        timestamp: now,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSendMessage = () => {
    // If there's an image selected, send it
    if (selectedImage && imagePreview) {
      // Add user message with image
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: {
          type: "image",
          url: imagePreview,
        },
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      // Reset image state
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Simulate AI response after a delay
      setTimeout(() => {
        const now = new Date()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Recebi sua imagem! Analisando o conteúdo visual para fornecer insights sobre sua campanha de anúncios.",
          timestamp: now,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1500)

      return
    }

    // Regular text message
    if (!input.trim()) return

    // Add user message
    const now = new Date()
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: now,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "Com base nos objetivos da sua campanha no Facebook, recomendo focar nestas métricas principais: CTR, CPC e Taxa de Conversão. Gostaria que eu explicasse como otimizar cada uma delas?",
        "Para Google Ads no seu setor, o CPC médio está entre R$1,20-R$3,50. Seu desempenho atual está acima da média! Aqui estão 3 estratégias para melhorar ainda mais seu ROAS.",
        "Analisei sua estrutura de campanha. O principal problema parece ser a sobreposição de público causando competição de lances. Deixe-me mostrar como reestruturar seus conjuntos de anúncios para um melhor desempenho.",
        "Sua abordagem criativa parece sólida! Para elevá-la ao próximo nível, considere implementar estes 3 gatilhos psicológicos em seu texto publicitário que demonstraram aumentar o CTR em 27% em nichos semelhantes.",
      ]

      // Customize response based on consultant style
      let responsePrefix = ""
      if (consultantStyle === "Direto") {
        responsePrefix = "Direto ao ponto: "
      } else if (consultantStyle === "Detalhado") {
        responsePrefix = "Analisando em detalhes: "
      } else if (consultantStyle === "Estratégico") {
        responsePrefix = "Pensando estrategicamente: "
      } else if (consultantStyle === "Criativo") {
        responsePrefix = "Com uma abordagem criativa: "
      }

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const styledResponse = responsePrefix ? responsePrefix + randomResponse : randomResponse

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: styledResponse,
        timestamp: now,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const navigateToPlatform = (platform: string) => {
    // In a real app, this would navigate to a platform-specific page
    // For now, we'll just add a message about the platform
    const platformMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Quero saber mais sobre ${platform}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, platformMessage])
    setIsTyping(true)

    setTimeout(() => {
      const platformResponses: Record<string, string> = {
        "Facebook Ads":
          "O Facebook Ads é uma plataforma poderosa para alcançar públicos específicos. Vamos analisar suas campanhas atuais e identificar oportunidades de otimização. Você gostaria de focar em alcance, engajamento ou conversões?",
        "Google Ads":
          "O Google Ads oferece excelente intenção de compra através da pesquisa. Vamos revisar sua estrutura de campanha, palavras-chave e qualidade dos anúncios. Qual é seu principal objetivo: aumentar o tráfego, leads ou vendas diretas?",
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: platformResponses[platform] || `Vamos falar sobre ${platform}. Como posso ajudar?`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleStyleSelect = (style: ConsultantStyle) => {
    setConsultantStyle(style)

    // Add a message about the style change
    if (style) {
      const styleMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Estilo de consultoria alterado para **${style}**. Vou adaptar minhas respostas para serem mais ${style === "Direto" ? "objetivas e diretas" : style === "Detalhado" ? "detalhadas e analíticas" : style === "Estratégico" ? "estratégicas e focadas em resultados de longo prazo" : "criativas e inovadoras"}.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, styleMessage])
    }
  }

  const suggestions = [
    "Analisar o desempenho da minha campanha no Facebook",
    "Como reduzir meu CPC no Google Ads?",
    "Melhores formatos de anúncios para minha loja online",
    "Criar uma estratégia de teste para meus criativos",
  ]

  // Mock data for dialogs
  const mockCampaigns = [
    {
      id: 1,
      name: "Campanha de Verão",
      platform: "Facebook",
      status: "Ativo",
      budget: "R$ 1.500,00",
      results: "32 conversões",
    },
    {
      id: 2,
      name: "Promoção de Produtos",
      platform: "Google",
      status: "Ativo",
      budget: "R$ 2.000,00",
      results: "45 conversões",
    },
    {
      id: 3,
      name: "Remarketing",
      platform: "Facebook",
      status: "Pausado",
      budget: "R$ 800,00",
      results: "18 conversões",
    },
  ]

  const mockChats = [
    { id: 1, date: "10/04/2023", topic: "Otimização de campanhas", messages: 12 },
    { id: 2, date: "15/03/2023", topic: "Estratégia de lançamento", messages: 8 },
    { id: 3, date: "02/02/2023", topic: "Análise de concorrentes", messages: 15 },
  ]

  // Helper function to get theme-specific classes
  const getThemeClass = (lightClass: string, darkClass: string) => {
    return theme === "light" ? lightClass : darkClass
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full ${getThemeClass("bg-purple-600/5", "bg-purple-600/10")} blur-[120px] animate-pulse`} />
        <div className={`absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full ${getThemeClass("bg-blue-600/5", "bg-blue-600/10")} blur-[120px] animate-pulse`} />
      </div>

      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />

      {/* Sidebar - Desktop only */}
      {!isMobile && (
        <div
          className={`w-72 border-r flex flex-col ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("bg-white", "bg-black/40")} backdrop-blur-xl transition-all duration-300 z-20 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          <div className={`p-6 border-b ${getThemeClass("border-gray-200", "border-white/10")} flex items-center space-x-3`}>
            <div className={`w-10 h-10 rounded-full ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} flex items-center justify-center ${getThemeClass("light-glow", "dark-glow")}`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`font-semibold text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Copilot Ads
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <Button
              onClick={() => {
                // Reset messages to just the welcome message
                setMessages([
                  {
                    id: "welcome-new",
                    role: "assistant",
                    content:
                      "👋 Olá! Sou seu consultor Copilot Ads. Como posso ajudar a otimizar suas campanhas de tráfego pago hoje?",
                    timestamp: new Date(),
                  },
                ])
              }}
              className={`w-full mb-4 ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600 text-white ${getThemeClass("light-glow", "dark-glow")}`}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Chat
            </Button>

            <div className="mb-6">
              <h3 className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}>Plataformas</h3>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => navigateToPlatform("Facebook Ads")}
              >
                <Facebook className="mr-3 h-4 w-4 text-blue-400" />
                Facebook Ads
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => navigateToPlatform("Google Ads")}
              >
                <Google className="mr-3 h-4 w-4 text-red-400" />
                Google Ads
              </Button>
            </div>

            <div className="mb-6">
              <h3 className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}>Ferramentas</h3>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => setAnalyticsOpen(true)}
              >
                <BarChart3 className="mr-3 h-4 w-4 text-purple-400" />
                Analytics
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => setBenchmarksOpen(true)}
              >
                <Target className="mr-3 h-4 w-4 text-green-400" />
                Benchmarks
              </Button>
            </div>

            <div className="mb-6">
              <h3 className={`text-xs uppercase ${getThemeClass("text-gray-500", "text-gray-400")} font-medium mb-3 px-2`}>Conta</h3>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => setHistoryOpen(true)}
              >
                <History className="mr-3 h-4 w-4" />
                Histórico
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => setProfileOpen(true)}
              >
                <User className="mr-3 h-4 w-4" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white hover:bg-white/5")}`}
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Configurações
              </Button>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
              <div className={`${getThemeClass("bg-gradient-to-r from-purple-100 to-blue-100", "bg-gradient-to-r from-purple-900/30 to-blue-900/30")} rounded-xl p-4`}>
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
                      onClick={() => handleStyleSelect(style.name)}
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
        </div>
      )}

      {/* Mobile navbar */}
      {isMobile && (
        <MobileNavbar
          onNewChat={() => {
            setMessages([
              {
                id: "welcome-new",
                role: "assistant",
                content:
                  "👋 Olá! Sou seu consultor Copilot Ads. Como posso ajudar a otimizar suas campanhas de tráfego pago hoje?",
                timestamp: new Date(),
              },
            ])
          }}
          onPlatformSelect={navigateToPlatform}
          onAnalyticsOpen={() => setAnalyticsOpen(true)}
          onBenchmarksOpen={() => setBenchmarksOpen(true)}
          onHistoryOpen={() => setHistoryOpen(true)}
          onProfileOpen={() => setProfileOpen(true)}
          onSettingsOpen={() => setSettingsOpen(true)}
          consultantStyle={consultantStyle}
          onStyleSelect={handleStyleSelect}
        />
      )}

      {/* Main chat area */}
      <div className={`flex-1 flex flex-col h-full relative z-10 ${getThemeClass("bg-white/50", "bg-black/20")} backdrop-blur-sm`}>
        {/* Chat header */}
        <div className={`p-4 border-b ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("light-bg-blur", "dark-bg-blur")} flex items-center justify-between`}>
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className={getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden ${getThemeClass("text-gray-700 hover:bg-gray-100", "text-gray-300 hover:text-white")}`}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className={`text-lg font-medium ${getThemeClass("light-gradient-text", "dark-gradient-text")} flex items-center`}>
            Consultor de Tráfego Pago
            {consultantStyle && (
              <span className={`ml-2 text-xs ${getThemeClass("bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800", "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white")} px-2 py-1 rounded-full`}>
                {consultantStyle}
              </span>
            )}
          </h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className={`w-9 h-9 rounded-full ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} flex items-center justify-center ${getThemeClass("light-glow", "dark-glow")}`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Messages container */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent ${getThemeClass("bg-gradient-to-b from-transparent to-white/30", "bg-gradient-to-b from-transparent to-black/30")}`}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center space-x-3 ${getThemeClass("text-gray-600", "text-gray-400")}`}
            >
              <div className={`w-9 h-9 rounded-full ${getThemeClass("bg-gradient-to-r from-purple-500/30 to-blue-500/30", "bg-gradient-to-r from-purple-500/30 to-blue-500/30")} flex items-center justify-center`}>
                <Sparkles className={`w-4 h-4 ${getThemeClass("text-purple-700", "text-white/70")} animate-pulse`} />
              </div>
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${getThemeClass("bg-purple-500", "bg-purple-500")} animate-bounce`}
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${getThemeClass("bg-violet-500", "bg-violet-500")} animate-bounce`}
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${getThemeClass("bg-blue-500", "bg-blue-500")} animate-bounce`}
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span>Copilot está pensando...</span>
            </motion.div>
          )}

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6"
            >
              {suggestions.map((suggestion, index) => (
                <SuggestionButton key={index} text={suggestion} onClick={() => handleSuggestionClick(suggestion)} />
              ))}
            </motion.div>
          )}

          {messages.length > 1 && messages[messages.length - 1].role === "assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              <SuggestionButton
                text="Gerar ideias criativas"
                onClick={() => handleSuggestionClick("Gerar ideias criativas para meus anúncios")}
                icon={<Lightbulb className="w-4 h-4 mr-2" />}
              />
              <SuggestionButton
                text="Criar plano de testes"
                onClick={() => handleSuggestionClick("Criar um plano de testes para minha campanha")}
                icon={<Target className="w-4 h-4 mr-2" />}
              />
              <SuggestionButton
                text="Benchmark do meu nicho"
                onClick={() => handleSuggestionClick("Quais são os benchmarks para meu setor?")}
                icon={<BarChart3 className="w-4 h-4 mr-2" />}
              />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className={`p-4 border-t ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("light-bg-blur", "dark-bg-blur")}`}>
          {/* Image preview */}
          {imagePreview && (
            <div className="mb-3 relative">
              <div className={`relative rounded-lg overflow-hidden ${getThemeClass("border-gray-200", "border-white/10")} border w-24 h-24`}>
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-1 right-1 h-6 w-6 ${getThemeClass("bg-black/40 hover:bg-black/60", "bg-black/60 hover:bg-black/80")} rounded-full`}
                  onClick={cancelImageUpload}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Audio recording UI */}
          {(isRecording || audioURL) && (
            <div className="mb-3">
              <div className={`flex items-center p-3 rounded-lg ${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} border`}>
                {isRecording ? (
                  <>
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <span className={`text-sm ${getThemeClass("text-gray-700", "text-gray-300")}`}>
                        {isPaused ? "Gravação pausada" : "Gravando áudio"} - {formatTime(recordingDuration)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/50 hover:bg-black/70")}`}
                        onClick={togglePauseRecording}
                      >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/50 hover:bg-black/70")}`}
                        onClick={stopRecording}
                      >
                        <StopCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/50 hover:bg-black/70")}`}
                        onClick={cancelRecording}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 flex-1">
                      <audio src={audioURL || ""} controls className="h-8 w-full" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/50 hover:bg-black/70")}`}
                        onClick={cancelRecording}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600 text-white rounded-lg px-3 py-1 text-sm ${getThemeClass("light-glow", "dark-glow")}`}
                        onClick={sendAudioMessage}
                      >
                        Enviar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre suas campanhas de tráfego pago..."
                className={`${getThemeClass("light-input", "dark-input")} focus-visible:ring-purple-500 focus-visible:border-purple-500 rounded-xl pl-4 pr-28 py-6 ${getThemeClass("text-gray-800", "text-white")} placeholder:${getThemeClass("text-gray-500", "text-gray-400")}`}
                disabled={isRecording || !!audioURL}
              />

              {/* Media buttons and send button */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/30 hover:bg-black/50")}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRecording || !!audioURL}
                      >
                        <ImageIcon className={`h-4 w-4 ${getThemeClass("text-gray-600", "text-gray-400")}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Enviar imagem</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${getThemeClass("bg-gray-100 hover:bg-gray-200", "bg-black/30 hover:bg-black/50")}`}
                        onClick={startRecording}
                        disabled={isRecording || !!audioURL || !!imagePreview}
                      >
                        <Mic className={`h-4 w-4 ${getThemeClass("text-gray-600", "text-gray-400")}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Gravar áudio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !imagePreview) || isTyping || isRecording || !!audioURL}
                  className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600 text-white rounded-lg h-9 w-9 p-0 ${getThemeClass("light-glow", "dark-glow")}`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className={`${getThemeClass("bg-white", "bg-black/90")} ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("text-gray-900", "text-white")} max-w-3xl`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Analytics
            </DialogTitle>
            <DialogDescription className={getThemeClass("text-gray-600", "text-gray-400")}>
              Visualize o desempenho das suas campanhas de tráfego pago
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className={`${getThemeClass("bg-gray-100", "bg-black/50")} ${getThemeClass("border-gray-200", "border-white/10")} border`}>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={getThemeClass("light-card", "dark-card")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Investimento Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">R$ 4.300,00</p>
                    <p className="text-xs text-green-400 mt-1">+12% vs. mês anterior</p>
                  </CardContent>
                </Card>

                <Card className={getThemeClass("light-card", "dark-card")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Conversões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">95</p>
                    <p className="text-xs text-green-400 mt-1">+8% vs. mês anterior</p>
                  </CardContent>
                </Card>

                <Card className={getThemeClass("light-card", "dark-card")}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>ROAS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">2.4x</p>
                    <p className="text-xs text-red-400 mt-1">-3% vs. mês anterior</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Campanhas Ativas</h3>
                <div className={`${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} rounded-lg overflow-hidden border`}>
                  <table className="w-full">
                    <thead className={getThemeClass("bg-gray-50", "bg-black/50")}>
                      <tr>
                        <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Nome</th>
                        <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Plataforma</th>
                        <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Status</th>
                        <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Orçamento</th>
                        <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Resultados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCampaigns.map((campaign) => (
                        <tr key={campaign.id} className={`border-t ${getThemeClass("border-gray-100", "border-white/5")}`}>
                          <td className="p-3">{campaign.name}</td>
                          <td className="p-3">{campaign.platform}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${campaign.status === "Ativo" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className="p-3">{campaign.budget}</td>
                          <td className="p-3">{campaign.results}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="facebook" className="mt-4">
              <div className={`${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} rounded-lg p-4 border`}>
                <h3 className="text-lg font-medium mb-3">Métricas do Facebook Ads</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>CTR</p>
                    <p className="text-xl font-bold">2.8%</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>CPC</p>
                    <p className="text-xl font-bold">R$ 0.87</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Frequência</p>
                    <p className="text-xl font-bold">2.3</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>CPM</p>
                    <p className="text-xl font-bold">R$ 24.50</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="google" className="mt-4">
              <div className={`${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} rounded-lg p-4 border`}>
                <h3 className="text-lg font-medium mb-3">Métricas do Google Ads</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>CTR</p>
                    <p className="text-xl font-bold">3.5%</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>CPC</p>
                    <p className="text-xl font-bold">R$ 1.24</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Posição Média</p>
                    <p className="text-xl font-bold">2.1</p>
                  </div>
                  <div className={`p-3 ${getThemeClass("bg-gray-50", "bg-black/20")} rounded-lg`}>
                    <p className={`text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Quality Score</p>
                    <p className="text-xl font-bold">7.2</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              onClick={() => setAnalyticsOpen(false)}
              className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600`}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Benchmarks Dialog */}
      <Dialog open={benchmarksOpen} onOpenChange={setBenchmarksOpen}>
        <DialogContent className={`${getThemeClass("bg-white", "bg-black/90")} ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("text-gray-900", "text-white")}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Benchmarks
            </DialogTitle>
            <DialogDescription className={getThemeClass("text-gray-600", "text-gray-400")}>
              Compare o desempenho das suas campanhas com o mercado
            </DialogDescription>
          </DialogHeader>
          {/* Benchmarks content */}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className={`${getThemeClass("bg-white", "bg-black/90")} ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("text-gray-900", "text-white")}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Histórico de Conversas
            </DialogTitle>
            <DialogDescription className={getThemeClass("text-gray-600", "text-gray-400")}>
              Veja suas conversas anteriores com o Copilot Ads
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className={`${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} rounded-lg overflow-hidden border`}>
              <table className="w-full">
                <thead className={getThemeClass("bg-gray-50", "bg-black/50")}>
                  <tr>
                    <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Data</th>
                    <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Tópico</th>
                    <th className={`text-left p-3 text-sm ${getThemeClass("text-gray-600", "text-gray-400")}`}>Mensagens</th>
                  </tr>
                </thead>
                <tbody>
                  {mockChats.map((chat) => (
                    <tr key={chat.id} className={`border-t ${getThemeClass("border-gray-100", "border-white/5")}`}>
                      <td className="p-3">{chat.date}</td>
                      <td className="p-3">{chat.topic}</td>
                      <td className="p-3">{chat.messages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setHistoryOpen(false)}
              className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600`}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className={`${getThemeClass("bg-white", "bg-black/90")} ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("text-gray-900", "text-white")}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Perfil
            </DialogTitle>
            <DialogDescription className={getThemeClass("text-gray-600", "text-gray-400")}>
              Gerencie suas informações e preferências
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className={`p-4 ${getThemeClass("bg-gray-50", "bg-black/30")} rounded-lg`}>
              <h3 className="font-medium mb-2">Informações Pessoais</h3>
              <div className="space-y-2">
                <Input placeholder="Nome" className={getThemeClass("light-input", "dark-input")} />
                <Input placeholder="Email" type="email" className={getThemeClass("light-input", "dark-input")} />
              </div>
            </div>

            <div className={`p-4 ${getThemeClass("bg-gray-50", "bg-black/30")} rounded-lg`}>
              <h3 className="font-medium mb-2">Preferências de Notificação</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Notificações por email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Notificações push</span>
                </label>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="destructive"
              className="w-full"
            >
              Sair
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setProfileOpen(false)}
              className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600`}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className={`${getThemeClass("bg-white", "bg-black/90")} ${getThemeClass("border-gray-200", "border-white/10")} ${getThemeClass("text-gray-900", "text-white")}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl ${getThemeClass("light-gradient-text", "dark-gradient-text")}`}>
              Configurações
            </DialogTitle>
            <DialogDescription className={getThemeClass("text-gray-600", "text-gray-400")}>
              Personalize sua experiência no Copilot Ads
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className={`p-4 ${getThemeClass("bg-gray-50", "bg-black/30")} rounded-lg`}>
              <h3 className="font-medium mb-2">Aparência</h3>
              <div className="flex items-center justify-between">
                <span>Tema</span>
                <ThemeToggle />
              </div>
            </div>

            <div className={`p-4 ${getThemeClass("bg-gray-50", "bg-black/30")} rounded-lg`}>
              <h3 className="font-medium mb-2">Idioma</h3>
              <select className={`w-full p-2 rounded ${getThemeClass("bg-white border-gray-200", "bg-black/30 border-white/10")} border`}>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className={`p-4 ${getThemeClass("bg-gray-50", "bg-black/30")} rounded-lg`}>
              <h3 className="font-medium mb-2">Privacidade</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Salvar histórico de conversas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Permitir coleta de dados de uso</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setSettingsOpen(false)}
              className={`${getThemeClass("light-gradient-bg", "dark-gradient-bg")} hover:from-purple-600 hover:to-blue-600`}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
