/**
 * File Upload API Route
 * 
 * This API endpoint handles file uploads to Supabase Storage.
 * Accepts files via multipart/form-data and stores them in the 'chat-files' bucket.
 * Returns the public URL for accessing the uploaded file.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/upload
 * 
 * Uploads a file to Supabase Storage and returns the public URL.
 * 
 * @param req - Request with FormData containing the file
 * @returns JSON response with file URL and path
 */
export async function POST(req: NextRequest) {
    try {
        // Parse the multipart form data from the request
        const formData = await req.formData()
        const file = formData.get('file') as File

        // Validate that a file was provided
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Generate a unique filename to prevent collisions
        // Format: timestamp-randomstring.extension
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        // Convert the file to a buffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload file to Supabase Storage in the 'chat-files' bucket
        const { data, error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false, // Don't overwrite existing files
            })

        // Handle upload errors
        if (error) {
            console.error('Supabase upload error:', error)
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            )
        }

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('chat-files')
            .getPublicUrl(filePath)

        // Return the file URL and path to the client
        return NextResponse.json({
            url: urlData.publicUrl,
            path: filePath,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}
