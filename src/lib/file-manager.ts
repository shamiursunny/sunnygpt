// File manager utilities for SunnyGPT
// Handles upload, download, and file operations with Supabase Storage
// Built by Shamiur Rashid Sunny (shamiur.com)

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types
export interface FileMetadata {
    name: string
    type: string
    size: number
    lastModified: number
}

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

export interface FileItem {
    id: string
    name: string
    url: string
    type: string
    size: number
    createdAt: string
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    document: ['application/pdf', 'text/plain', 'text/csv', 'application/json'],
    spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    documentWord: ['application/vnd.ms-word', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

// Max file sizes (in bytes)
export const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024,      // 10MB
    video: 100 * 1024 * 1024,     // 100MB
    audio: 20 * 1024 * 1024,      // 20MB
    document: 10 * 1024 * 1024,    // 10MB
    default: 10 * 1024 * 1024,    // 10MB
}

/**
 * Get Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
    if (typeof window === 'undefined') return null
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured')
        return null
    }
    
    return createClient(supabaseUrl, supabaseKey)
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
    file: File,
    bucket: string = 'chat-files',
    onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; path: string; error?: string }> {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
        return { url: '', path: '', error: 'Supabase not configured' }
    }
    
    // Validate file type
    const validation = validateFile(file)
    if (validation.error) {
        return { url: '', path: '', error: validation.error }
    }
    
    try {
        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${bucket}/${fileName}`
        
        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            })
        
        if (error) {
            console.error('Upload error:', error)
            return { url: '', path: '', error: error.message }
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)
        
        return {
            url: urlData.publicUrl,
            path: filePath,
            error: undefined
        }
    } catch (error) {
        console.error('Upload exception:', error)
        return { 
            url: '', 
            path: '', 
            error: error instanceof Error ? error.message : 'Upload failed' 
        }
    }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
    path: string,
    bucket: string = 'chat-files'
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' }
    }
    
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])
        
        if (error) {
            return { success: false, error: error.message }
        }
        
        return { success: true }
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Delete failed' 
        }
    }
}

/**
 * Get file metadata
 */
export function getFileMetadata(file: File): FileMetadata {
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string; type?: string } {
    // Check size
    const fileType = getFileCategory(file.type)
    const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES] || MAX_FILE_SIZES.default
    
    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        return { 
            valid: false, 
            error: `File too large. Maximum size is ${maxSizeMB}MB` 
        }
    }
    
    // Check type
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES).flat()
    if (!allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: 'File type not supported' 
        }
    }
    
    return { valid: true, type: fileType }
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): string {
    for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
        if (types.includes(mimeType)) {
            return category
        }
    }
    return 'document'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file icon based on type
 */
export function getFileIcon(mimeType: string): string {
    const category = getFileCategory(mimeType)
    
    const icons: Record<string, string> = {
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        document: '📄',
        spreadsheet: '📊',
        documentWord: '📝',
    }
    
    return icons[category] || '📁'
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
    return getFileCategory(mimeType) === 'image'
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType: string): boolean {
    return getFileCategory(mimeType) === 'video'
}

/**
 * Check if file is audio
 */
export function isAudio(mimeType: string): boolean {
    return getFileCategory(mimeType) === 'audio'
}

/**
 * Check if file is a document
 */
export function isDocument(mimeType: string): boolean {
    const category = getFileCategory(mimeType)
    return ['document', 'spreadsheet', 'documentWord'].includes(category)
}

/**
 * Generate shareable URL with expiration
 */
export async function generateShareableUrl(
    path: string,
    bucket: string = 'chat-files',
    expiresIn: number = 86400 // 24 hours in seconds
): Promise<string> {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
        // Return public URL as fallback
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        return `${supabaseUrl}/storage/v1/object/public/${path}`
    }
    
    // Generate signed URL using promise
    try {
        const result = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn)
        
        if (result.error) {
            console.error('Signed URL error:', result.error)
            // Return public URL as fallback
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            return `${supabaseUrl}/storage/v1/object/public/${path}`
        }
        
        return result.data.signedUrl
    } catch (err) {
        console.error('Signed URL exception:', err)
        // Return public URL as fallback
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        return `${supabaseUrl}/storage/v1/object/public/${path}`
    }
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename?: string): void {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || url.split('/').pop() || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}