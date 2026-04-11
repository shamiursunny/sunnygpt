/**
 * =============================================================================
 * Push Notification Service - SunnyGPT Enterprise
 * =============================================================================
 * Browser push notifications with VAPID key authentication
 * 
 * FEATURES:
 * - Subscribe to push notifications
 * - Unsubscribe from push notifications
 * - Send test notifications
 * - Store subscription in database
 * - Handle notification click events
 * 
 * USAGE:
 * import { pushNotificationService } from '@/lib/push-notifications'
 * 
 * // Subscribe
 * await pushNotificationService.subscribe()
 * 
 * // Unsubscribe
 * await pushNotificationService.unsubscribe()
 * 
 * // Send test
 * await pushNotificationService.sendTest()
 * 
 * =============================================================================
 */

// VAPID keys - generate your own at https://vapidkeys.com/
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

/**
 * Push Notification Service
 * Handles all push notification operations
 */
class PushNotificationService {
    private subscription: PushSubscription | null = null
    private isSupported: boolean

    constructor() {
        this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
    }

    /**
     * Check if push notifications are supported
     */
    isPushSupported(): boolean {
        return this.isSupported
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe(): Promise<PushSubscription | null> {
        if (!this.isSupported) {
            console.warn('Push notifications not supported')
            return null
        }

        try {
            // Register service worker if not already
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered:', registration)

            // Subscribe to push
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource
            })

            console.log('Push subscription:', this.subscription)

            // Send subscription to server
            await this.saveSubscription(this.subscription)

            return this.subscription
        } catch (error) {
            console.error('Push subscription error:', error)
            return null
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(): Promise<boolean> {
        if (!this.subscription) {
            try {
                const registration = await navigator.serviceWorker.ready
                const sub = await registration.pushManager.getSubscription()
                if (sub) {
                    await sub.unsubscribe()
                    await this.removeSubscription(sub)
                    this.subscription = null
                    return true
                }
            } catch (error) {
                console.error('Push unsubscribe error:', error)
            }
            return false
        }

        try {
            await this.subscription.unsubscribe()
            await this.removeSubscription(this.subscription)
            this.subscription = null
            return true
        } catch (error) {
            console.error('Push unsubscribe error:', error)
            return false
        }
    }

    /**
     * Check if currently subscribed
     */
    async isSubscribed(): Promise<boolean> {
        if (!this.isSupported) return false

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            return subscription !== null
        } catch (error) {
            console.error('Check subscription error:', error)
            return false
        }
    }

    /**
     * Send a test notification
     */
    async sendTest(title: string = 'Test Notification', body: string = 'This is a test notification from SunnyGPT!'): Promise<boolean> {
        if (!this.subscription) {
            console.warn('Not subscribed to push notifications')
            return false
        }

        try {
            // In production, send via your server
            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: this.subscription,
                    title,
                    body
                })
            })
            return response.ok
        } catch (error) {
            console.error('Send test notification error:', error)
            return false
        }
    }

    /**
     * Show browser notification directly (without server)
     */
    async showDirectNotification(title: string, options?: NotificationOptions): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Browser notifications not supported')
            return false
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            console.warn('Notification permission not granted')
            return false
        }

        new Notification(title, {
            icon: '/icon.png',
            badge: '/icon.png',
            ...options
        })

        return true
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            return 'denied'
        }
        return await Notification.requestPermission()
    }

    /**
     * Get current permission status
     */
    getPermissionStatus(): NotificationPermission | null {
        if (!('Notification' in window)) {
            return null
        }
        return Notification.permission
    }

    /**
     * Save subscription to server
     */
    private async saveSubscription(subscription: PushSubscription): Promise<void> {
        // In production, save to your database via API
        console.log('Saving subscription to server:', subscription)
        
        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.toJSON().keys?.p256dh,
                        auth: subscription.toJSON().keys?.auth
                    }
                })
            })
        } catch (error) {
            console.error('Save subscription error:', error)
        }
    }

    /**
     * Remove subscription from server
     */
    private async removeSubscription(subscription: PushSubscription): Promise<void> {
        try {
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            })
        } catch (error) {
            console.error('Remove subscription error:', error)
        }
    }

    /**
     * Convert VAPID key from base64 to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()

// Default export
export default pushNotificationService