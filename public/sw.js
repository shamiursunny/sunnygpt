/**
 * =============================================================================
 * Service Worker - SunnyGPT Enterprise
 * =============================================================================
 * Provides offline functionality, push notification handling, and caching
 * 
 * FEATURES:
 * - Offline page support
 * - Push notification handling
 * - Background sync
 * - Cache management
 * 
 * INSTALLATION:
 * Place this file in public/sw.js
 * Register in your app with: navigator.serviceWorker.register('/sw.js')
 * 
 * =============================================================================
 */

// Cache name
const CACHE_NAME = 'sunnygpt-v1'

// Assets to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    '/icon.png',
    '/apple-icon.png'
]

/**
 * Install event - cache core assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('[Service Worker] Installing...')
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Precaching core assets')
            return cache.addAll(PRECACHE_ASSETS)
        }).then(() => {
            console.log('[Service Worker] Installed successfully')
            return self.skipWaiting()
        })
    )
})

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('[Service Worker] Activating...')
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[Service Worker] Deleting old cache:', name)
                        return caches.delete(name)
                    })
            )
        }).then(() => {
            console.log('[Service Worker] Activated successfully')
            return self.clients.claim()
        })
    )
})

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip API requests - always go to network
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request))
        return
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return
    }

    // For HTML pages - network first, fallback to cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request))
        return
    }

    // For everything else - cache first, fallback to network
    event.respondWith(cacheFirst(request))
})

/**
 * Cache first strategy
 * Check cache, if miss then fetch from network
 */
async function cacheFirst(request: Request): Promise<Response> {
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
        return cachedResponse
    }

    try {
        const networkResponse = await fetch(request)
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        
        return networkResponse
    } catch (error) {
        console.error('[Service Worker] Fetch error:', error)
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline')
        }
        
        return new Response('Offline', { status: 503 })
    }
}

/**
 * Network first strategy
 * Try network, fallback to cache
 */
async function networkFirst(request: Request): Promise<Response> {
    try {
        const networkResponse = await fetch(request)
        return networkResponse
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url)
        
        const cachedResponse = await caches.match(request)
        
        if (cachedResponse) {
            return cachedResponse
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline') || new Response('Offline', { status: 503 })
        }

        return new Response('Not available offline', { status: 503 })
    }
}

/**
 * Push notification event
 */
self.addEventListener('push', (event: PushEvent) => {
    console.log('[Service Worker] Push received')
    
    let data = { title: 'SunnyGPT', body: 'You have a new notification', icon: '/icon.png' }
    
    if (event.data) {
        try {
            data = event.data.json()
        } catch (e) {
            data.body = event.data.text()
        }
    }

    const options: NotificationOptions = {
        body: data.body,
        icon: data.icon,
        badge: '/icon.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ]
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[Service Worker] Notification clicked')
    
    event.notification.close()

    if (event.action === 'close') {
        return
    }

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus()
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

/**
 * Background sync event
 */
self.addEventListener('sync', (event: SyncEvent) => {
    console.log('[Service Worker] Background sync:', event.tag)
    
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages())
    }
})

/**
 * Sync messages in background
 */
async function syncMessages(): Promise<void> {
    // Get pending messages from IndexedDB and send to server
    console.log('[Service Worker] Syncing messages...')
    
    // This would integrate with your message queue
    // For now, just log
    console.log('[Service Worker] Message sync complete')
}

/**
 * Message from main app
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    console.log('[Service Worker] Message received:', event.data)
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

// TypeScript declarations for service worker
declare const self: ServiceWorkerGlobalScope

interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<any>): void
}

interface FetchEvent extends ExtendableEvent {
    request: Request
    respondWith(response: Promise<Response> | Response): void
}

interface PushEvent extends ExtendableEvent {
    data: PushMessageData | null
}

interface PushMessageData {
    json(): any
    text(): string
}

interface NotificationEvent extends ExtendableEvent {
    notification: Notification
    action: string
}

interface SyncEvent extends ExtendableEvent {
    tag: string
}

interface ServiceWorkerGlobalScope {
    skipWaiting(): Promise<void>
    clients: Clients
    registration: ServiceWorkerRegistration
}

export {}