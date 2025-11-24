/**
 * Chat Interface Component
 * 
 * Main chat interface component that handles all user interactions including:
 * - Sending and receiving messages
 * - File uploads via Supabase
 * - Voice input (speech-to-text) using Web Speech API
 * - Voice output (text-to-speech) for AI responses
 * - Message deletion with optimistic updates
 * - Real-time message display with auto-scroll
 * 
 * This component manages the entire chat experience and integrates with multiple
 * backend APIs for chat operations, file storage, and AI responses.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import { Send, Paperclip, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVoiceRecognition, getVoiceSpeaker, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '@/lib/speech'

// Message interface defining the structure of chat messages
interface Message {
    id: string
    content: string
    role: string
    fileUrl?: string | null
}

// Component props interface
interface ChatInterfaceProps {
    chatId?: string // Optional chat ID for existing conversations
    onChatCreated?: (chatId: string) => void // Callback when a new chat is created
}

export function ChatInterface({ chatId, onChatCreated }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
    const [isListening, setIsListening] = useState(false)
    const [voiceModeEnabled, setVoiceModeEnabled] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [mounted, setMounted] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const voiceRecognitionRef = useRef<any>(null)
    const voiceSpeakerRef = useRef<any>(null)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (chatId) {
            loadMessages()
        } else {
            // Clear messages when starting a new chat
            setMessages([])
        }
    }, [chatId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Initialize voice services
    useEffect(() => {
        if (isSpeechRecognitionSupported()) {
            try {
                voiceRecognitionRef.current = getVoiceRecognition()

                voiceRecognitionRef.current.onResult((transcript: string, isFinal: boolean) => {
                    setInput(transcript)
                })

                voiceRecognitionRef.current.onError((error: string) => {
                    console.error('Speech recognition error:', error)
                    setIsListening(false)
                })

                voiceRecognitionRef.current.onEnd(() => {
                    setIsListening(false)
                })
            } catch (error) {
                console.error('Failed to initialize voice recognition:', error)
            }
        }

        if (isSpeechSynthesisSupported()) {
            try {
                voiceSpeakerRef.current = getVoiceSpeaker()
            } catch (error) {
                console.error('Failed to initialize voice speaker:', error)
            }
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadMessages = async () => {
        try {
            const response = await fetch(`/api/chats/${chatId}`)
            const data = await response.json()
            setMessages(data)
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        try {
            // Optimistic update
            setMessages(messages.filter((msg) => msg.id !== messageId))

            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                // Rollback on error
                loadMessages()
            }
        } catch (error) {
            console.error('Failed to delete message:', error)
            // Rollback on error
            loadMessages()
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            setUploadedFileUrl(data.url)
        } catch (error) {
            console.error('Failed to upload file:', error)
        }
    }

    const speakText = (text: string) => {
        if (voiceSpeakerRef.current && voiceModeEnabled) {
            setIsSpeaking(true)
            voiceSpeakerRef.current.speak(text, {
                onEnd: () => setIsSpeaking(false)
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() && !uploadedFileUrl) return

        const userMessage = input.trim()
        setInput('')
        setIsLoading(true)

        // Stop any ongoing speech
        if (voiceSpeakerRef.current) {
            voiceSpeakerRef.current.stop()
            setIsSpeaking(false)
        }

        // Optimistically add user message
        const tempUserMessage: Message = {
            id: Date.now().toString(),
            content: userMessage,
            role: 'user',
            fileUrl: uploadedFileUrl,
        }
        setMessages((prev) => [...prev, tempUserMessage])
        setUploadedFileUrl(null)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId,
                    message: userMessage,
                    fileUrl: uploadedFileUrl,
                }),
            })

            const data = await response.json()

            if (data.chatId && !chatId) {
                onChatCreated?.(data.chatId)
            }

            // Add AI response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message,
                role: 'model',
            }
            setMessages((prev) => [...prev, aiMessage])

            // Speak the AI response if voice mode is enabled
            speakText(data.message)
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleVoiceRecognition = () => {
        if (!voiceRecognitionRef.current) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
            return
        }

        if (isListening) {
            voiceRecognitionRef.current.stop()
            setIsListening(false)
        } else {
            voiceRecognitionRef.current.start()
            setIsListening(true)
        }
    }

    const toggleVoiceMode = () => {
        const newVoiceMode = !voiceModeEnabled
        setVoiceModeEnabled(newVoiceMode)

        if (!newVoiceMode && voiceSpeakerRef.current) {
            voiceSpeakerRef.current.stop()
            setIsSpeaking(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with voice mode toggle */}
            <div className="border-b px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isSpeaking && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                            <Volume2 className="h-4 w-4 animate-pulse" />
                            <span>Speaking...</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={toggleVoiceMode}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm",
                        voiceModeEnabled
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                    )}
                    title={voiceModeEnabled ? "Voice mode enabled" : "Voice mode disabled"}
                >
                    {voiceModeEnabled ? (
                        <>
                            <Volume2 className="h-4 w-4" />
                            <span>Voice On</span>
                        </>
                    ) : (
                        <>
                            <VolumeX className="h-4 w-4" />
                            <span>Voice Off</span>
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center space-y-2">
                            <p>Start a conversation with AI</p>
                            {mounted && isSpeechRecognitionSupported() && (
                                <p className="text-sm">Click the microphone to speak your message</p>
                            )}
                        </div>
                    </div>
                )}
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        fileUrl={message.fileUrl}
                        onDelete={handleDeleteMessage}
                    />
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
                {uploadedFileUrl && (
                    <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
                        <span className="text-sm">File attached</span>
                        <button
                            onClick={() => setUploadedFileUrl(null)}
                            className="text-sm text-destructive"
                        >
                            Remove
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-md border hover:bg-muted transition-colors"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>

                    {/* Microphone button */}
                    {mounted && isSpeechRecognitionSupported() && (
                        <button
                            type="button"
                            onClick={toggleVoiceRecognition}
                            className={cn(
                                "p-2 rounded-md border transition-colors",
                                isListening
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "hover:bg-muted"
                            )}
                            title={isListening ? "Stop listening" : "Start voice input"}
                        >
                            {isListening ? (
                                <MicOff className="h-5 w-5" />
                            ) : (
                                <Mic className="h-5 w-5" />
                            )}
                        </button>
                    )}

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your message..."}
                        className="flex-1 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !uploadedFileUrl)}
                        className={cn(
                            "p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
