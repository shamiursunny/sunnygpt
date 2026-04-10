// Voice Control Panel for SunnyGPT
// Built by Shamiur Rashid Sunny (shamiur.com)
// Provides voice input/output controls with visual feedback

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
    Mic, 
    MicOff, 
    Volume2, 
    VolumeX, 
    Loader2,
    Settings,
    Waves
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
    isSpeechRecognitionSupported, 
    isSpeechSynthesisSupported,
    createVoiceRecognition,
    createVoiceSpeaker,
    getHumanLikeVoiceSettings,
    VoiceState,
    VoiceSpeakerInstance,
    VoiceRecognitionInstance
} from '@/lib/enhanced-speech'

interface VoicePanelProps {
    onTranscript?: (text: string) => void
    className?: string
}

export function VoicePanel({ onTranscript, className }: VoicePanelProps) {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [voiceState, setVoiceState] = useState<VoiceState>('idle')
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    
    const recognitionRef = useRef<VoiceRecognitionInstance | null>(null)
    const speakerRef = useRef<VoiceSpeakerInstance | null>(null)

    // Initialize on mount
    useEffect(() => {
        // Check support
        if (!isSpeechRecognitionSupported()) {
            setError('Speech recognition not supported in this browser')
        }
        if (!isSpeechSynthesisSupported()) {
            setError(prev => prev ? `${prev}. Speech synthesis not supported.` : 'Speech synthesis not supported.')
        }

        // Get available voices (may need delay)
        setTimeout(() => {
            if (isSpeechSynthesisSupported()) {
                setVoices(window.speechSynthesis.getVoices())
            }
        }, 100)

        // Initialize speaker
        speakerRef.current = createVoiceSpeaker()

        return () => {
            recognitionRef.current?.stop()
            speakerRef.current?.stop()
        }
    }, [])

    // Handle voice input
    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.start()
            setVoiceState('listening')
            setIsListening(true)
            setError(null)
        } else {
            // Create new recognition instance
            recognitionRef.current = createVoiceRecognition(
                (text, isFinal) => {
                    setTranscript(text)
                    if (isFinal) {
                        setVoiceState('idle')
                        setIsListening(false)
                        onTranscript?.(text)
                        setTranscript('')
                    }
                },
                (err) => {
                    setError(err)
                    setVoiceState('idle')
                    setIsListening(false)
                }
            )
            
            if (recognitionRef.current) {
                recognitionRef.current.start()
                setVoiceState('listening')
                setIsListening(true)
            }
        }
    }, [onTranscript])

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop()
        setVoiceState('idle')
        setIsListening(false)
    }, [])

    // Handle voice output
    const speak = useCallback((text: string) => {
        if (!speakerRef.current) return
        
        setIsSpeaking(true)
        setVoiceState('processing')
        
        speakerRef.current.speak(text, {
            ...getHumanLikeVoiceSettings(),
            onEnd: () => {
                setIsSpeaking(false)
                setVoiceState('idle')
            },
            onError: (e) => {
                console.error('Speech error:', e)
                setIsSpeaking(false)
                setVoiceState('idle')
            }
        })
    }, [])

    const stopSpeaking = useCallback(() => {
        speakerRef.current?.stop()
        setIsSpeaking(false)
        setVoiceState('idle')
    }, [])

    // Toggle voice mode
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }, [isListening, startListening, stopListening])

    // Render
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Microphone Button */}
            <button
                onClick={toggleListening}
                disabled={!isSpeechRecognitionSupported()}
                className={cn(
                    "relative p-3 rounded-full transition-all duration-200",
                    isListening 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-primary hover:bg-primary/90",
                    !isSpeechRecognitionSupported() && "opacity-50 cursor-not-allowed"
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
            >
                {isListening ? (
                    <Waves className="h-5 w-5 text-white" />
                ) : (
                    <Mic className="h-5 w-5 text-white" />
                )}
                
                {/* Listening indicator ring */}
                {isListening && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                )}
            </button>

            {/* Voice Status */}
            <div className="flex items-center gap-2 text-sm">
                {voiceState === 'idle' && (
                    <span className="text-muted-foreground">Tap to speak</span>
                )}
                {voiceState === 'listening' && (
                    <span className="text-red-500 flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Listening...
                    </span>
                )}
                {voiceState === 'processing' && (
                    <span className="text-blue-500 flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </span>
                )}
            </div>

            {/* Transcript preview */}
            {transcript && (
                <div className="absolute bottom-full mb-2 left-0 right-0 p-2 bg-muted rounded text-sm">
                    "{transcript}"
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="text-xs text-destructive">
                    {error}
                </div>
            )}

            {/* Test Voice Button */}
            <button
                onClick={() => speak("Hello! I am your voice assistant. How can I help you today?")}
                disabled={!isSpeechSynthesisSupported() || isSpeaking}
                className={cn(
                    "p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors",
                    (!isSpeechSynthesisSupported() || isSpeaking) && "opacity-50"
                )}
                title="Test voice"
            >
                {isSpeaking ? (
                    <VolumeX className="h-4 w-4" />
                ) : (
                    <Volume2 className="h-4 w-4" />
                )}
            </button>
        </div>
    )
}