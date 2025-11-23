// Speech Recognition and Text-to-Speech utilities using Web Speech API

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
}

declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}

// Check if browser supports Speech Recognition
export const isSpeechRecognitionSupported = (): boolean => {
    if (typeof window === 'undefined') return false
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

// Check if browser supports Speech Synthesis
export const isSpeechSynthesisSupported = (): boolean => {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
}

// Speech Recognition class
export class VoiceRecognition {
    private recognition: any
    private onResultCallback?: (transcript: string, isFinal: boolean) => void
    private onErrorCallback?: (error: string) => void
    private onEndCallback?: () => void

    constructor() {
        if (!isSpeechRecognitionSupported()) {
            throw new Error('Speech Recognition is not supported in this browser')
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()

        // Configuration
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
        this.recognition.maxAlternatives = 1

        // Event handlers
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.resultIndex]
            const transcript = result[0].transcript
            const isFinal = result.isFinal

            if (this.onResultCallback) {
                this.onResultCallback(transcript, isFinal)
            }
        }

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error)
            }
        }

        this.recognition.onend = () => {
            if (this.onEndCallback) {
                this.onEndCallback()
            }
        }
    }

    start() {
        try {
            this.recognition.start()
        } catch (error) {
            console.error('Error starting speech recognition:', error)
        }
    }

    stop() {
        try {
            this.recognition.stop()
        } catch (error) {
            console.error('Error stopping speech recognition:', error)
        }
    }

    onResult(callback: (transcript: string, isFinal: boolean) => void) {
        this.onResultCallback = callback
    }

    onError(callback: (error: string) => void) {
        this.onErrorCallback = callback
    }

    onEnd(callback: () => void) {
        this.onEndCallback = callback
    }

    setLanguage(lang: string) {
        this.recognition.lang = lang
    }
}

// Text-to-Speech class
export class VoiceSpeaker {
    private synth: SpeechSynthesis
    private currentUtterance: SpeechSynthesisUtterance | null = null

    constructor() {
        if (!isSpeechSynthesisSupported()) {
            throw new Error('Speech Synthesis is not supported in this browser')
        }
        this.synth = window.speechSynthesis
    }

    speak(text: string, options?: {
        rate?: number
        pitch?: number
        volume?: number
        voice?: SpeechSynthesisVoice
        onEnd?: () => void
    }) {
        // Cancel any ongoing speech
        this.stop()

        const utterance = new SpeechSynthesisUtterance(text)

        // Set options
        utterance.rate = options?.rate || 1
        utterance.pitch = options?.pitch || 1
        utterance.volume = options?.volume || 1

        if (options?.voice) {
            utterance.voice = options.voice
        }

        if (options?.onEnd) {
            utterance.onend = options.onEnd
        }

        this.currentUtterance = utterance
        this.synth.speak(utterance)
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel()
        }
        this.currentUtterance = null
    }

    pause() {
        if (this.synth.speaking) {
            this.synth.pause()
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume()
        }
    }

    isSpeaking(): boolean {
        return this.synth.speaking
    }

    isPaused(): boolean {
        return this.synth.paused
    }

    getVoices(): SpeechSynthesisVoice[] {
        return this.synth.getVoices()
    }

    // Get English voices
    getEnglishVoices(): SpeechSynthesisVoice[] {
        return this.getVoices().filter(voice => voice.lang.startsWith('en'))
    }
}

// Singleton instances
let voiceRecognition: VoiceRecognition | null = null
let voiceSpeaker: VoiceSpeaker | null = null

export const getVoiceRecognition = (): VoiceRecognition => {
    if (!voiceRecognition && isSpeechRecognitionSupported()) {
        voiceRecognition = new VoiceRecognition()
    }
    if (!voiceRecognition) {
        throw new Error('Speech Recognition is not supported')
    }
    return voiceRecognition
}

export const getVoiceSpeaker = (): VoiceSpeaker => {
    if (!voiceSpeaker && isSpeechSynthesisSupported()) {
        voiceSpeaker = new VoiceSpeaker()
    }
    if (!voiceSpeaker) {
        throw new Error('Speech Synthesis is not supported')
    }
    return voiceSpeaker
}
