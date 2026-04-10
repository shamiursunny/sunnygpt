// Live Data Fetcher for SunnyGPT
// Fetch live data from URLs for AI analysis
// Built by Shamiur Rashid Sunny (shamiur.com)

interface FetchOptions {
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string | FormData
    timeout?: number
}

interface FetchResponse {
    data?: string
    error?: string
    status?: number
}

/**
 * Fetch content from a URL
 */
export async function fetchLiveData(
    url: string,
    options: FetchOptions = {}
): Promise<FetchResponse> {
    const { 
        method = 'GET', 
        headers = {},
        body,
        timeout = 30000 
    } = options

    try {
        // Validate URL
        if (!url || !url.startsWith('http')) {
            return { error: 'Invalid URL' }
        }

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
            method,
            headers: {
                'User-Agent': 'SunnyGPT/1.0',
                ...headers,
            },
            body,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Check response status
        if (!response.ok) {
            return { 
                error: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status
            }
        }

        // Get content type
        const contentType = response.headers.get('content-type') || ''

        // Parse response based on content type
        let data: string

        if (contentType.includes('application/json')) {
            const json = await response.json()
            data = JSON.stringify(json, null, 2)
        } else if (contentType.includes('text/html')) {
            const html = await response.text()
            // Extract text content from HTML
            data = extractTextFromHTML(html)
        } else if (contentType.includes('text/') || contentType.includes('xml')) {
            data = await response.text()
        } else {
            // Binary content - return info
            data = `Content-Type: ${contentType}\nContent-Length: ${response.headers.get('content-length') || 'unknown'}`
        }

        return { data, status: response.status }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return { error: 'Request timeout' }
            }
            return { error: error.message }
        }
        return { error: 'Unknown error' }
    }
}

/**
 * Extract readable text from HTML
 */
function extractTextFromHTML(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // Replace common HTML elements with newlines
    text = text.replace(/<\/p>/gi, '\n')
    text = text.replace(/<br\s*\/?>/gi, '\n')
    text = text.replace(/<\/div>/gi, '\n')
    text = text.replace(/<\/li>/gi, '\n')
    text = text.replace(/<\/h[1-6]>/gi, '\n\n')
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '')
    
    // Decode HTML entities
    text = decodeHTMLEntities(text)
    
    // Clean up whitespace
    text = text.replace(/\n{3,}/g, '\n\n')
    text = text.trim()
    
    // Limit length
    const maxLength = 5000
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '\n...(truncated)'
    }
    
    return text
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' ',
    }
    
    let decoded = text
    for (const [entity, char] of Object.entries(entities)) {
        decoded = decoded.replace(new RegExp(entity, 'g'), char)
    }
    
    return decoded
}

/**
 * Fetch and parse a JSON API
 */
export async function fetchJSON(url: string): Promise<FetchResponse> {
    return fetchLiveData(url, {
        headers: {
            'Accept': 'application/json',
        }
    })
}

/**
 * Fetch news or RSS feed
 */
export async function fetchNews(url: string): Promise<FetchResponse> {
    const response = await fetchLiveData(url)
    
    if (response.error) {
        return response
    }
    
    // Try to parse as RSS/Atom
    if (response.data && response.data.includes('<rss')) {
        // Extract items from RSS
        const items = response.data.match(/<item[^>]*>[\s\S]*?<\/item>/gi)
        if (items) {
            const parsed = items.slice(0, 5).map(item => {
                const title = item.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] || 'No title'
                const link = item.match(/<link[^>]*>([^<]+)<\/link>/)?.[1] || ''
                return { title: title.trim(), link: link.trim() }
            })
            return { 
                data: JSON.stringify(parsed, null, 2),
                status: response.status
            }
        }
    }
    
    return response
}

/**
 * Fetch stock/crypto data
 */
export async function fetchStockData(symbol: string): Promise<FetchResponse> {
    // This is a placeholder - in real app, use a stock API
    // For demo, we'll try to fetch from a public API
    const demoApis = [
        `https://api.coincap.io/v2/assets/${symbol.toLowerCase()}`,
    ]
    
    for (const url of demoApis) {
        const response = await fetchJSON(url)
        if (!response.error) {
            return response
        }
    }
    
    return { 
        error: 'Failed to fetch stock data. Symbol not found or API unavailable.',
    }
}

/**
 * Fetch weather data
 */
export async function fetchWeather(city: string): Promise<FetchResponse> {
    // This is a placeholder - in real app, use a weather API
    // For demo purposes only
    return {
        data: JSON.stringify({
            city,
            temperature: '22°C',
            condition: 'Partly Cloudy',
            humidity: '65%',
            wind: '15 km/h'
        }, null, 2)
    }
}

/**
 * Fetch URL metadata (for link previews)
 */
export async function fetchMetadata(url: string): Promise<{
    title?: string
    description?: string
    image?: string
    error?: string
}> {
    const response = await fetchLiveData(url)
    
    if (response.error) {
        return { error: response.error }
    }
    
    const html = response.data || ''
    
    // Extract metadata
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
        || html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)?.[1]
    
    const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)?.[1]
        || html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)?.[1]
    
    const image = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)?.[1]
    
    return {
        title: title?.trim(),
        description: description?.trim(),
        image: image?.trim(),
    }
}

/**
 * AI context builder - creates context from fetched data
 */
export function buildAIContext(data: string, source: string): string {
    return `=== Information from ${source} ===
${data}

This information was fetched in real-time and can be used to answer questions about the content.

`
}