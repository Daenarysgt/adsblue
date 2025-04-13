"use client"

import { useState, useRef } from "react"
import { Sparkles, User, Copy, Check, ThumbsUp, ThumbsDown, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

type MessageContent = string | { type: "image"; url: string } | { type: "audio"; url: string; duration: number }

type Message = {
  id: string
  role: "user" | "assistant"
  content: MessageContent
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()

  const copyToClipboard = () => {
    if (typeof message.content === "string") {
      navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isAssistant = message.role === "assistant"

  // Format message content with markdown-like styling
  const formatContent = (content: string) => {
    // Replace numbered lists
    let formattedContent = content.replace(
      /(\d+\.\s)([^\n]+)/g,
      '<div class="flex mb-1"><span class="mr-2 text-purple-400">$1</span><span>$2</span></div>',
    )

    // Replace bullet points
    formattedContent = formattedContent.replace(
      /•\s([^\n]+)/g,
      '<div class="flex mb-1"><span class="mr-2 text-purple-400">•</span><span>$1</span></div>',
    )

    // Bold text
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')

    // Highlight text
    formattedContent = formattedContent.replace(
      /`([^`]+)`/g,
      '<span class="bg-purple-500/20 text-purple-200 px-1 rounded">$1</span>',
    )

    return formattedContent
  }

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false)
  }

  // Format audio duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Helper function to get theme-specific classes
  const getThemeClass = (lightClass: string, darkClass: string) => {
    return theme === "light" ? lightClass : darkClass
  }

  return (
    <div className={cn("flex group", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[75%] rounded-2xl p-5 relative group",
          isAssistant
            ? getThemeClass(
                "bg-white border-gray-200 shadow-md",
                "bg-black/50 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]",
              )
            : getThemeClass(
                "bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-md",
                "bg-gradient-to-r from-purple-500/90 to-blue-500/90 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
              ),
        )}
      >
        <div className="flex-shrink-0 mr-4">
          {isAssistant ? (
            <div
              className={`w-10 h-10 rounded-full ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} flex items-center justify-center ${getThemeClass("light-glow", "dark-glow")}`}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium mb-2">
            {isAssistant ? (
              <span className={getThemeClass("light-gradient-text", "dark-gradient-text")}>Copilot Ads</span>
            ) : (
              "Você"
            )}
            <span className={`text-xs ${getThemeClass("text-gray-500", "text-gray-400")} ml-2`}>
              {formatTime(new Date(message.timestamp).getHours() * 60 + new Date(message.timestamp).getMinutes())}
            </span>
          </div>

          {/* Render different content types */}
          {typeof message.content === "string" ? (
            <div
              className={`whitespace-pre-wrap ${getThemeClass("text-gray-800", "text-gray-100")}`}
              dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            />
          ) : message.content.type === "image" ? (
            <div className="mb-2">
              <img
                src={message.content.url || "/placeholder.svg"}
                alt="Imagem enviada"
                className="rounded-lg max-h-60 object-contain"
              />
            </div>
          ) : message.content.type === "audio" ? (
            <div className="mb-2">
              <div className={`${getThemeClass("bg-gray-100", "bg-black/30")} rounded-lg p-3 flex items-center`}>
                <button
                  onClick={toggleAudioPlayback}
                  className={`w-8 h-8 rounded-full ${getThemeClass("light-gradient-bg", "dark-gradient-bg")} flex items-center justify-center mr-3`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: isPlaying ? "50%" : "0%", transition: "width 0.1s linear" }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${getThemeClass("text-gray-600", "text-gray-400")}`}>
                      {isPlaying ? "Reproduzindo" : "Áudio"}
                    </span>
                    <span className={`text-xs ${getThemeClass("text-gray-600", "text-gray-400")}`}>
                      {formatTime(message.content.duration)}
                    </span>
                  </div>
                </div>
                <audio ref={audioRef} src={message.content.url} onEnded={handleAudioEnd} className="hidden" />
              </div>
            </div>
          ) : null}

          {isAssistant && (
            <div
              className={`mt-3 pt-3 border-t ${getThemeClass("border-gray-200", "border-white/10")} flex items-center justify-between`}
            >
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedback("like")}
                  className={`p-1 rounded-full ${feedback === "like" ? "bg-green-500/20 text-green-400" : `${getThemeClass("text-gray-500 hover:text-gray-700", "text-gray-400 hover:text-gray-300")}`}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedback("dislike")}
                  className={`p-1 rounded-full ${feedback === "dislike" ? "bg-red-500/20 text-red-400" : `${getThemeClass("text-gray-500 hover:text-gray-700", "text-gray-400 hover:text-gray-300")}`}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className={`p-1 rounded-full ${getThemeClass("text-gray-500 hover:text-gray-700", "text-gray-400 hover:text-gray-300")}`}
                disabled={typeof message.content !== "string"}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
