import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { data, error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) {
            console.error('Supabase upload error:', error)
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            )
        }

        const { data: urlData } = supabase.storage
            .from('chat-files')
            .getPublicUrl(filePath)

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
