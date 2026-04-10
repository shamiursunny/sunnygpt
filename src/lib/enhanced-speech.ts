// Enhanced voice functions for SunnyGPT
// Built by Shamiur Rashid Sunny (shamiur.com)
// Uses Web Speech API for voice input/output - works 100% offline

// Check if browser supports speech recognition
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

// Check if browser supports speech synthesis
export function isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
}

// Get available voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!isSpeechSynthesisSupported()) return []
    return window.speechSynthesis.getVoices()
}

// Voice recognition configuration
export interface VoiceConfig {
    lang?: string
    continuous?: boolean
    interimResults?: boolean
}

// Voice state
export type VoiceState = 'idle' | 'listening' | 'processing'

// Voice recognition callback types
export type VoiceCallback = (transcript: string, isFinal: boolean) => void
export type VoiceErrorCallback = (error: string) => void

/**
 * Create enhanced voice recognition instance
 */
export function createVoiceRecognition(
    onResult: VoiceCallback,
    onError?: VoiceErrorCallback,
    config?: VoiceConfig
): VoiceRecognitionInstance | null {
    if (!isSpeechRecognitionSupported()) {
        console.warn('Speech recognition not supported')
        return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // Configure
    recognition.lang = config?.lang || 'en-US'
    recognition.continuous = config?.continuous ?? false
    recognition.interimResults = config?.interimResults ?? true
    recognition.maxAlternatives = 1

    // Set callbacks
    recognition.onresult = (event: any) => {
        const result = event.results[event.resultIndex]
        const transcript = result[0].transcript
        const isFinal = result.isFinal
        onResult(transcript, isFinal)
    }

    recognition.onerror = (event: any) => {
        const errorMsg = event.error || 'Unknown error'
        console.warn('Speech recognition error:', errorMsg)
        onError?.(errorMsg)
    }

    recognition.onend = () => {
        // Auto-restart if continuous mode
    }

    return {
        recognition,
        start: () => recognition.start(),
        stop: () => recognition.stop(),
        abort: () => recognition.abort(),
        setLanguage: (lang: string) => { recognition.lang = lang }
    }
}

export interface VoiceRecognitionInstance {
    recognition: any
    start: () => void
    stop: () => void
    abort: () => void
    setLanguage: (lang: string) => void
}

/**
 * Create voice output (TTS)
 */
export function createVoiceSpeaker(): VoiceSpeakerInstance | null {
    if (!isSpeechSynthesisSupported()) {
        console.warn('Speech synthesis not supported')
        return null
    }

    const synth = window.speechSynthesis

    return {
        synth,
        speak: (text: string, options?: SpeechOptions) => {
            // Cancel current speech
            synth.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            
            // Set options
            utterance.rate = options?.rate ?? 1
            utterance.pitch = options?.pitch ?? 1
            utterance.volume = options?.volume ?? 1

            // Find voice
            if (options?.voice) {
                utterance.voice = options.voice
            } else {
                // Try to find a good English voice
                const voices = synth.getVoices()
                const englishVoice = voices.find(v => 
                    v.lang.startsWith('en') && v.name.includes('Google')
                ) || voices.find(v => v.lang.startsWith('en'))
                if (englishVoice) utterance.voice = englishVoice
            }

            // Callbacks
            if (options?.onStart) utterance.onstart = options.onStart
            if (options?.onEnd) utterance.onend = options.onEnd
            if (options?.onError) utterance.onerror = options.onError

            synth.speak(utterance)
        },
        stop: () => synth.cancel(),
        pause: () => synth.pause(),
        resume: () => synth.resume(),
        isSpeaking: () => synth.speaking,
        isPaused: () => synth.paused,
        getVoices: () => synth.getVoices()
    }
}

export interface SpeechOptions {
    rate?: number
    pitch?: number
    volume?: number
    voice?: SpeechSynthesisVoice
    onStart?: () => void
    onEnd?: () => void
    onError?: (event: any) => void
}

export interface VoiceSpeakerInstance {
    synth: SpeechSynthesis
    speak: (text: string, options?: SpeechOptions) => void
    stop: () => void
    pause: () => void
    resume: () => void
    isSpeaking: () => boolean
    isPaused: () => boolean
    getVoices: () => SpeechSynthesisVoice[]
}

/**
 * Get human-like voice settings
 */
export function getHumanLikeVoiceSettings(): SpeechOptions {
    return {
        rate: 0.9,  // Slightly slower for clarity
        pitch: 1.0, // Normal pitch
        volume: 1.0
    }
}