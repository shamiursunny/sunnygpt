/**
 * =============================================================================
 * Real-time Collaboration Service - SunnyGPT Enterprise
 * =============================================================================
 * WebSocket-based real-time features for collaboration
 * 
 * FEATURES:
 * - Real-time messaging
 * - Presence indicators (online/offline/typing)
 * - Live cursor tracking
 * - Collaborative editing
 * - Connection status management
 * 
 * USAGE:
 * const realtime = new RealtimeService('wss://your-server.com')
 * realtime.connect()
 * realtime.on('message', (msg) => console.log(msg))
 * 
 * =============================================================================
 */

// Reconnection configuration
const RECONNECT_CONFIG = {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000
}

// Message types
export type RealtimeMessageType = 
    | 'join' 
    | 'leave' 
    | 'message' 
    | 'typing' 
    | 'cursor' 
    | 'presence' 
    | 'sync'
    | 'connect'
    | 'disconnect'
    | 'reconnect-failed'

// Base message interface
export interface RealtimeMessage {
    type: RealtimeMessageType
    payload: any
    timestamp: number
    userId: string
}

// Presence state
export interface UserPresence {
    userId: string
    status: 'online' | 'away' | 'busy' | 'offline'
    lastSeen: number
    metadata?: Record<string, any>
}

// Cursor position
export interface CursorPosition {
    userId: string
    x: number
    y: number
    element?: string
}

/**
 * Realtime Service Class
 * Handles WebSocket connections for real-time features
 */
class RealtimeService {
    private ws: WebSocket | null = null
    private url: string
    private reconnectAttempts = 0
    private reconnectTimer: NodeJS.Timeout | null = null
    private messageQueue: RealtimeMessage[] = []
    private handlers: Map<RealtimeMessageType, Function[]> = new Map()
    private presence: Map<string, UserPresence> = new Map()
    private isConnected = false
    private isConnecting = false

    constructor(url: string) {
        this.url = url
    }

    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected || this.isConnecting) {
                resolve()
                return
            }

            this.isConnecting = true

            try {
                this.ws = new WebSocket(this.url)

                this.ws.onopen = () => {
                    console.log('[Realtime] Connected to WebSocket')
                    this.isConnected = true
                    this.isConnecting = false
                    this.reconnectAttempts = 0

                    // Send queued messages
                    this.flushMessageQueue()

                    // Notify handlers
                    this.emit('connect', { timestamp: Date.now() })
                    resolve()
                }

                this.ws.onmessage = (event) => {
                    try {
                        const message: RealtimeMessage = JSON.parse(event.data)
                        this.handleMessage(message)
                    } catch (error) {
                        console.error('[Realtime] Failed to parse message:', error)
                    }
                }

                this.ws.onclose = (event) => {
                    console.log('[Realtime] WebSocket closed:', event.code, event.reason)
                    this.isConnected = false
                    this.emit('disconnect', { code: event.code, reason: event.reason })
                    this.attemptReconnect()
                }

                this.ws.onerror = (error) => {
                    console.error('[Realtime] WebSocket error:', error)
                    this.isConnecting = false
                    reject(error)
                }

            } catch (error) {
                this.isConnecting = false
                reject(error)
            }
        })
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect')
            this.ws = null
        }

        this.isConnected = false
        this.messageQueue = []
        this.presence.clear()
    }

    /**
     * Send message through WebSocket
     */
    send(type: RealtimeMessageType, payload: any): void {
        const message: RealtimeMessage = {
            type,
            payload,
            timestamp: Date.now(),
            userId: payload.userId || 'anonymous'
        }

        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } else {
            // Queue message for later
            this.messageQueue.push(message)
        }
    }

    /**
     * Subscribe to message type
     */
    on(type: RealtimeMessageType, handler: Function): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, [])
        }
        this.handlers.get(type)!.push(handler)
    }

    /**
     * Unsubscribe from message type
     */
    off(type: RealtimeMessageType, handler: Function): void {
        const handlers = this.handlers.get(type)
        if (handlers) {
            const index = handlers.indexOf(handler)
            if (index > -1) {
                handlers.splice(index, 1)
            }
        }
    }

    /**
     * Emit event to handlers
     */
    private emit(type: RealtimeMessageType, payload: any): void {
        const handlers = this.handlers.get(type)
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(payload)
                } catch (error) {
                    console.error('[Realtime] Handler error:', error)
                }
            })
        }
    }

    /**
     * Handle incoming message
     */
    private handleMessage(message: RealtimeMessage): void {
        // Handle presence updates
        if (message.type === 'presence') {
            const presence = message.payload as UserPresence
            this.presence.set(presence.userId, presence)
        }

        // Emit to handlers
        this.emit(message.type, message.payload)
    }

    /**
     * Attempt to reconnect
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
            console.log('[Realtime] Max reconnection attempts reached')
            this.emit('reconnect-failed', { attempts: this.reconnectAttempts })
            return
        }

        const delay = Math.min(
            RECONNECT_CONFIG.baseDelay * Math.pow(2, this.reconnectAttempts),
            RECONNECT_CONFIG.maxDelay
        )

        console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++
            this.connect().catch(() => {
                // Will try again automatically
            })
        }, delay)
    }

    /**
     * Flush queued messages
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift()
            if (message && this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(message))
            }
        }
    }

    /**
     * Get presence of all users
     */
    getPresence(): UserPresence[] {
        return Array.from(this.presence.values())
    }

    /**
     * Get specific user presence
     */
    getUserPresence(userId: string): UserPresence | undefined {
        return this.presence.get(userId)
    }

    /**
     * Update own presence
     */
    updatePresence(status: UserPresence['status'], metadata?: Record<string, any>): void {
        this.send('presence', {
            status,
            metadata
        })
    }

    /**
     * Send typing indicator
     */
    sendTyping(isTyping: boolean, chatId: string): void {
        this.send('typing', { isTyping, chatId })
    }

    /**
     * Send cursor position
     */
    sendCursor(x: number, y: number, element?: string): void {
        this.send('cursor', { x, y, element })
    }

    /**
     * Check if connected
     */
    getConnectionStatus(): boolean {
        return this.isConnected
    }
}

// Create singleton instances for different endpoints
let realtimeInstance: RealtimeService | null = null

/**
 * Get or create RealtimeService instance
 */
export function getRealtimeService(url?: string): RealtimeService {
    if (!realtimeInstance && url) {
        realtimeInstance = new RealtimeService(url)
    }
    return realtimeInstance!
}

/**
 * Initialize realtime service with URL
 */
export function initializeRealtime(serverUrl: string): RealtimeService {
    realtimeInstance = new RealtimeService(serverUrl)
    return realtimeInstance
}

// Export types
export type { RealtimeService }

// Default export
export default RealtimeService