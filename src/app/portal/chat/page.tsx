/**
 * =============================================================================
 * Portal Chat Page - SunnyGPT SaaS Edition
 * =============================================================================
 * PROJECT: SunnyGPT Prime Edition
 * AUTHOR: Shamiur Rashid Sunny (shamiur.com)
 * 
 * Main chat interface for authenticated users
 * 
 * =============================================================================
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Send, Plus, Trash2, MessageCircle, Loader2 } from "lucide-react"

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages?: { role: string; content: string }[]
}

interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

export default function PortalChatPage() {
  const { data: session, status } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chats on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadChats()
    }
  }, [status])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadChats = async () => {
    try {
      const res = await fetch("/api/chats")
      if (res.ok) {
        const data = await res.json()
        setChats(data)
        if (data.length > 0) {
          setActiveChat(data[0])
          loadMessages(data[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to load chats:", error)
    } finally {
      setIsLoadingChats(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const createNewChat = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      })
      if (res.ok) {
        const newChat = await res.json()
        setChats([newChat, ...chats])
        setActiveChat(newChat)
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || isLoading) return

    setIsLoading(true)
    const userMessage = input.trim()
    setInput("")

    // Optimistic update - add user message immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    }
    setMessages([...messages, tempUserMessage])

    // Add loading indicator
    const loadingMessage: Message = {
      id: "loading",
      role: "model",
      content: "",
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: userMessage,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        
        // Update messages - remove loading, add AI response
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "model",
          content: data.message,
          createdAt: new Date().toISOString(),
        }
        
        // Remove loading indicator and add AI message
        setMessages(prev => [
          ...prev.filter(m => m.id !== "loading"),
          aiMessage,
        ])

        // Reload chats to get updated titles
        loadChats()
      } else {
        const error = await res.json()
        // Remove loading and show error
        setMessages(prev => [
          ...prev.filter(m => m.id !== "loading"),
          {
            id: Date.now().toString(),
            role: "model",
            content: `Error: ${error.error}`,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages(prev => [
        ...prev.filter(m => m.id !== "loading"),
        {
          id: Date.now().toString(),
          role: "model",
          content: "Failed to send message. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/chats?chatId=${chatId}`, { method: "DELETE" })
      if (res.ok) {
        const newChats = chats.filter(c => c.id !== chatId)
        setChats(newChats)
        if (activeChat?.id === chatId) {
          setActiveChat(newChats[0] || null)
          if (newChats[0]) {
            loadMessages(newChats[0].id)
          } else {
            setMessages([])
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const selectChat = (chat: Chat) => {
    setActiveChat(chat)
    loadMessages(chat.id)
  }

  // Loading state
  if (status === "loading" || isLoadingChats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access the chat</p>
          <a href="/login" className="text-indigo-600 hover:underline">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Chat List Sidebar */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                activeChat?.id === chat.id
                  ? "bg-indigo-50 border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <MessageCircle size={16} className="text-gray-400 flex-shrink-0" />
              <span className="flex-1 truncate text-sm text-gray-700">
                {chat.title || "New Chat"}
              </span>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          {chats.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">
              No chats yet. Start a new conversation!
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Start a conversation</p>
                <p className="text-sm mt-2">Send a message to begin</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content || (msg.id === "loading" ? "..." : "")}</p>
                  {msg.id !== "loading" && (
                    <p className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-indigo-200" : "text-gray-400"
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              disabled={isLoading || !activeChat}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || !activeChat}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}