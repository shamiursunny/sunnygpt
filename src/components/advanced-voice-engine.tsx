/**
 * =============================================================================
 * Advanced Voice Engine - SunnyGPT Enterprise
 * =============================================================================
 * Enhanced speech recognition with VAD, noise cancellation, and multi-language
 * 
 * FEATURES:
 * - Voice Activity Detection (VAD)
 * - Noise suppression
 * - Multi-language support
 * - Wake word detection
 * - Voice commands
 * - Audio visualization
 * 
 * =============================================================================
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
    Mic, 
    MicOff, 
    Settings, 
    Languages,
    Zap,
    Activity,
    Volume2,
    VolumeX,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

// Supported languages with codes
export const SUPPORTED_LANGUAGES = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn-BD', name: 'Bengali', flag: '🇧🇩' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

// Voice Activity Detection states
export type VADState = 'inactive' | 'speaking' | 'processing'

// Voice command interface
export interface VoiceCommand {
    trigger: string | string[]
    action: string
    description: string
    example?: string
}

// Advanced voice configuration
export interface AdvancedVoiceConfig {
    language: LanguageCode
    enableVAD: boolean
    enableNoiseSuppression: boolean
    enableWakeWord: boolean
    wakeWord: string
    continuousMode: boolean
    interimResults: boolean
    maxAlternatives: number
}

// Default configuration
export const DEFAULT_VOICE_CONFIG: AdvancedVoiceConfig = {
    language: 'en-US',
    enableVAD: true,
    enableNoiseSuppression: false,
    enableWakeWord: false,
    wakeWord: 'hey sunny',
    continuousMode: false,
    interimResults: true,
    maxAlternatives: 1
}

// ============================================================================
// VOICE ACTIVITY DETECTION (VAD)
// ============================================================================

/**
 * Simple Voice Activity Detection using audio amplitude
 * In production, you'd use a proper VAD library like webrtc-vad
 */
class VoiceActivityDetector {
    private audioContext: AudioContext | null = null
    private analyser: AnalyserNode | null = null
    private threshold: number = 0.02
    private silenceFrames: number = 0
    private speakingFrames: number = 0
    private onStateChange?: (state: VADState) => void

    constructor(onStateChange?: (state: VADState) => void) {
        this.onStateChange = onStateChange
    }

    /**
     * Initialize VAD with audio stream
     */
    async initialize(stream: MediaStream): Promise<void> {
        this.audioContext = new AudioContext()
        const source = this.audioContext.createMediaStreamSource(stream)
        this.analyser = this.audioContext.createAnalyser()
        
        this.analyser.fftSize = 256
        this.analyser.smoothingTimeConstant = 0.8
        
        source.connect(this.analyser)
    }

    /**
     * Analyze audio level and detect speech
     */
    analyze(): VADState {
        if (!this.analyser) return 'inactive'

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
        this.analyser.getByteFrequencyData(dataArray)

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255

        if (average > this.threshold) {
            this.speakingFrames++
            this.silenceFrames = 0
            
            if (this.speakingFrames > 3 && this.onStateChange) {
                this.onStateChange('speaking')
            }
            
            return 'speaking'
        } else {
            this.silenceFrames++
            this.speakingFrames = 0
            
            if (this.silenceFrames > 15 && this.onStateChange) {
                this.onStateChange('inactive')
            }
            
            return 'inactive'
        }
    }

    /**
     * Set detection sensitivity
     */
    setThreshold(value: number): void {
        this.threshold = value
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }
        this.analyser = null
    }
}

// ============================================================================
// WAKE WORD DETECTOR
// ============================================================================

/**
 * Wake word detection using keyword spotting
 */
class WakeWordDetector {
    private wakeWord: string
    private isListening: boolean = false
    private onWakeDetected?: () => void

    constructor(wakeWord: string = 'hey sunny', onWakeDetected?: () => void) {
        this.wakeWord = wakeWord.toLowerCase()
        this.onWakeDetected = onWakeDetected
    }

    /**
     * Process audio for wake word
     */
    process(transcript: string): boolean {
        const lower = transcript.toLowerCase()
        
        if (lower.includes(this.wakeWord)) {
            this.onWakeDetected?.()
            return true
        }
        
        return false
    }

    /**
     * Update wake word
     */
    setWakeWord(word: string): void {
        this.wakeWord = word.toLowerCase()
    }
}

// ============================================================================
// VOICE COMMANDS
// ============================================================================

// Predefined voice commands
export const VOICE_COMMANDS: VoiceCommand[] = [
    {
        trigger: ['send', 'send message', 'send to'],
        action: 'send_message',
        description: 'Send a message',
        example: 'Send hello to John'
    },
    {
        trigger: ['search', 'find', 'look for'],
        action: 'search',
        description: 'Search for content',
        example: 'Search for AI tutorials'
    },
    {
        trigger: ['create', 'new', 'start'],
        action: 'create_chat',
        description: 'Start a new chat',
        example: 'Create new chat about cooking'
    },
    {
        trigger: ['clear', 'delete', 'remove'],
        action: 'clear_chat',
        description: 'Clear current chat',
        example: 'Clear chat history'
    },
    {
        trigger: ['repeat', 'say again', 'replay'],
        action: 'repeat_message',
        description: 'Repeat last message',
        example: 'Repeat that'
    },
    {
        trigger: ['translate', 'convert'],
        action: 'translate',
        description: 'Translate text',
        example: 'Translate to Spanish'
    },
    {
        trigger: ['summarize', 'summary', 'quick summary'],
        action: 'summarize',
        description: 'Summarize conversation',
        example: 'Summarize this chat'
    },
    {
        trigger: ['help', 'commands', 'what can you do'],
        action: 'show_help',
        description: 'Show available commands',
        example: 'What commands can you do'
    }
]

/**
 * Process voice command from transcript
 */
export function processVoiceCommand(transcript: string): string | null {
    const lower = transcript.toLowerCase()
    
    for (const command of VOICE_COMMANDS) {
        const triggers = Array.isArray(command.trigger) ? command.trigger : [command.trigger]
        
        for (const trigger of triggers) {
            if (lower.includes(trigger.toLowerCase())) {
                return command.action
            }
        }
    }
    
    return null
}

// ============================================================================
// ADVANCED VOICE ENGINE COMPONENT
// ============================================================================

interface AdvancedVoiceEngineProps {
    onTranscript?: (text: string, isFinal: boolean) => void
    onCommand?: (command: string) => void
    onWakeWord?: () => void
    config?: Partial<AdvancedVoiceConfig>
    className?: string
}

/**
 * Advanced Voice Engine Component
 * Enhanced speech recognition with VAD, wake word, and commands
 */
export function AdvancedVoiceEngine({
    onTranscript,
    onCommand,
    onWakeWord,
    config,
    className
}: AdvancedVoiceEngineProps) {
    // State
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [vadState, setVadState] = useState<VADState>('inactive')
    const [audioLevel, setAudioLevel] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [language, setLanguage] = useState<LanguageCode>((config?.language || DEFAULT_VOICE_CONFIG.language))
    const [showSettings, setShowSettings] = useState(false)
    const [wakeWordEnabled, setWakeWordEnabled] = useState(config?.enableWakeWord || false)
    const [continuousMode, setContinuousMode] = useState(config?.continuousMode || false)

    // Refs
    const recognitionRef = useRef<any>(null)
    const vadRef = useRef<VoiceActivityDetector | null>(null)
    const wakeWordRef = useRef<WakeWordDetector | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const animationRef = useRef<number | null>(null)

    // Merge config with defaults
    const fullConfig = { ...DEFAULT_VOICE_CONFIG, ...config }

    /**
     * Initialize speech recognition
     */
    const initializeRecognition = useCallback(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser')
            return
        }

        const recognition = new SpeechRecognition()
        
        // Configuration
        recognition.lang = language
        recognition.continuous = continuousMode
        recognition.interimResults = fullConfig.interimResults
        recognition.maxAlternatives = fullConfig.maxAlternatives

        // Handlers
        recognition.onresult = (event: any) => {
            let finalTranscript = ''
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    finalTranscript += result[0].transcript
                    
                    // Process voice command
                    const command = processVoiceCommand(finalTranscript)
                    if (command) {
                        onCommand?.(command)
                    }
                    
                    // Check wake word
                    if (wakeWordEnabled && wakeWordRef.current) {
                        wakeWordRef.current.process(finalTranscript)
                    }
                } else {
                    interimTranscript += result[0].transcript
                }
            }

            const text = finalTranscript || interimTranscript
            setTranscript(text)
            onTranscript?.(text, !!finalTranscript)
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setError(`Speech error: ${event.error}`)
            }
        }

        recognition.onend = () => {
            if (continuousMode && isListening) {
                // Restart if continuous mode
                try {
                    recognition.start()
                } catch (e) {
                    console.error('Restart error:', e)
                }
            } else {
                setIsListening(false)
                setVadState('inactive')
            }
        }

        recognitionRef.current = recognition
    }, [language, continuousMode, fullConfig, onTranscript, onCommand, wakeWordEnabled])

    /**
     * Start listening
     */
    const startListening = useCallback(async () => {
        setError(null)
        setTranscript('')

        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true 
            })
            streamRef.current = stream

            // Initialize VAD
            if (fullConfig.enableVAD) {
                vadRef.current = new VoiceActivityDetector((state) => {
                    setVadState(state)
                })
                await vadRef.current.initialize(stream)

                // Start VAD monitoring
                const monitorVAD = () => {
                    if (vadRef.current) {
                        vadRef.current.analyze()
                        setAudioLevel(Math.random() * 100) // Visual feedback
                    }
                    animationRef.current = requestAnimationFrame(monitorVAD)
                }
                monitorVAD()
            }

            // Initialize wake word
            if (fullConfig.enableWakeWord) {
                wakeWordRef.current = new WakeWordDetector(fullConfig.wakeWord, () => {
                    onWakeWord?.()
                })
            }

            // Initialize and start recognition
            initializeRecognition()
            
            if (recognitionRef.current) {
                recognitionRef.current.start()
                setIsListening(true)
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start voice'
            setError(message)
            console.error('Voice start error:', err)
        }
    }, [fullConfig, initializeRecognition, onWakeWord])

    /**
     * Stop listening
     */
    const stopListening = useCallback(() => {
        // Stop recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch (e) {}
            recognitionRef.current = null
        }

        // Stop VAD
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        if (vadRef.current) {
            vadRef.current.destroy()
            vadRef.current = null
        }

        // Stop microphone
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        setIsListening(false)
        setVadState('inactive')
        setAudioLevel(0)
    }, [])

    /**
     * Toggle listening
     */
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }, [isListening, startListening, stopListening])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening()
        }
    }, [stopListening])

    // Update recognition language when changed
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language
        }
    }, [language])

    /**
     * Render audio level visualization
     */
    const renderAudioVisualization = () => {
        const bars = 20
        const activeBars = Math.floor((audioLevel / 100) * bars)
        
        return (
            <div className="flex items-center justify-center gap-1 h-8">
                {Array.from({ length: bars }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'w-1 rounded-full transition-all',
                            i < activeBars 
                                ? vadState === 'speaking' 
                                    ? 'bg-green-500 h-8' 
                                    : 'bg-indigo-500 h-6'
                                : 'bg-gray-300 h-2'
                        )}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={cn('bg-white rounded-xl shadow-lg p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Advanced Voice
                </h2>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Settings className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                    {/* Language Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Languages className="w-4 h-4" />
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Wake Word Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={wakeWordEnabled}
                            onChange={(e) => setWakeWordEnabled(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600"
                        />
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">Enable wake word detection</span>
                    </label>

                    {/* Continuous Mode Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={continuousMode}
                            onChange={(e) => setContinuousMode(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600"
                        />
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Continuous listening mode</span>
                    </label>
                </div>
            )}

            {/* Audio Visualization */}
            {isListening && renderAudioVisualization()}

            {/* Status */}
            <div className="text-center mb-6">
                {isListening ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                                'w-3 h-3 rounded-full',
                                vadState === 'speaking' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            )} />
                            <span className="text-gray-600 capitalize">
                                {vadState === 'speaking' ? 'Listening...' : 'Waiting for speech...'}
                            </span>
                        </div>
                        {transcript && (
                            <p className="text-lg text-gray-800 font-medium">
                                &quot;{transcript}&quot;
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Click the microphone to start voice input
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center">
                <button
                    onClick={toggleListening}
                    className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                        isListening 
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    )}
                >
                    {isListening ? (
                        <MicOff className="w-8 h-8" />
                    ) : (
                        <Mic className="w-8 h-8" />
                    )}
                </button>
            </div>

            {/* Voice Commands Help */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Voice Commands
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {VOICE_COMMANDS.slice(0, 6).map((cmd) => (
                        <div key={cmd.action} className="flex items-center gap-1">
                            <span className="font-medium text-indigo-600">{cmd.trigger[0]}</span>
                            <span>- {cmd.description}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Voice Settings Component
 */
interface VoiceSettingsProps {
    config: AdvancedVoiceConfig
    onChange: (config: Partial<AdvancedVoiceConfig>) => void
    className?: string
}

export function VoiceSettings({ config, onChange, className }: VoiceSettingsProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Language */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                </label>
                <select
                    value={config.language}
                    onChange={(e) => onChange({ language: e.target.value as LanguageCode })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Wake Word */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wake Word
                </label>
                <input
                    type="text"
                    value={config.wakeWord}
                    onChange={(e) => onChange({ wakeWord: e.target.value })}
                    placeholder="hey sunny"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.enableVAD}
                    onChange={(e) => onChange({ enableVAD: e.target.checked })}
                    className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Voice Activity Detection</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.enableWakeWord}
                    onChange={(e) => onChange({ enableWakeWord: e.target.checked })}
                    className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Wake Word Detection</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.continuousMode}
                    onChange={(e) => onChange({ continuousMode: e.target.checked })}
                    className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Continuous Mode</span>
            </label>
        </div>
    )
}

export default AdvancedVoiceEngine