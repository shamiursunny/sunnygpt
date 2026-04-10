// Image Editor for SunnyGPT
// Basic image editing: brightness, contrast, rotation
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState, useRef, useCallback } from 'react'
import { 
    RotateCw, 
    RotateCcw, 
    Sun, 
    Contrast, 
    Download, 
    X,
    Undo,
    Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/file-manager'

interface ImageEditorProps {
    src: string
    filename?: string
    onSave?: (editedFile: File) => void
    onClose?: () => void
    className?: string
}

interface EditorSettings {
    brightness: number
    contrast: number
    rotation: number
}

export function ImageEditor({ 
    src, 
    filename = 'image',
    onSave,
    onClose,
    className 
}: ImageEditorProps) {
    const [settings, setSettings] = useState<EditorSettings>({
        brightness: 100,
        contrast: 100,
        rotation: 0,
    })
    const [saving, setSaving] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Handle brightness change
    const handleBrightness = (value: number) => {
        setSettings(prev => ({ ...prev, brightness: value }))
    }

    // Handle contrast change  
    const handleContrast = (value: number) => {
        setSettings(prev => ({ ...prev, contrast: value }))
    }

    // Handle rotation
    const handleRotate = (degrees: number) => {
        setSettings(prev => ({ ...prev, rotation: (prev.rotation + degrees) % 360 }))
    }

    // Reset settings
    const handleReset = () => {
        setSettings({
            brightness: 100,
            contrast: 100,
            rotation: 0,
        })
    }

    // Handle download
    const handleDownload = () => {
        const img = imgRef.current
        if (!img) return

        // Apply effects and download
        const canvas = document.createElement('canvas')
        const angle = (settings.rotation * Math.PI) / 180
        
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(angle)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
        ctx.filter = `brightness(${settings.brightness / 100}) contrast(${settings.contrast / 100})`
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2)

        const link = document.createElement('a')
        link.download = `edited-${filename}`
        link.href = canvas.toDataURL('image/jpeg')
        link.click()
    }

    // Save edited image
    const handleSave = useCallback(async () => {
        const img = imgRef.current
        if (!img) return

        setSaving(true)

        try {
            const canvas = document.createElement('canvas')
            const angle = (settings.rotation * Math.PI) / 180
            
            canvas.width = img.width
            canvas.height = img.height
            
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(angle)
            ctx.translate(-canvas.width / 2, -canvas.height / 2)
            ctx.filter = `brightness(${settings.brightness / 100}) contrast(${settings.contrast / 100})`
            ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2)

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            const response = await fetch(dataUrl)
            const blob = await response.blob()
            const file = new File([blob], filename, { type: 'image/jpeg' })

            onSave?.(file)
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setSaving(false)
        }
    }, [src, filename, onSave, settings])

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Hidden image for processing */}
            <img
                ref={imgRef}
                src={src}
                alt={filename}
                className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Edit Image</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 rounded hover:bg-muted"
                        title="Reset"
                    >
                        <Undo className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Image preview */}
            <div className="flex-1 overflow-auto p-4 bg-muted/50 flex items-center justify-center">
                <img
                    src={src}
                    alt={filename}
                    className="max-w-full max-h-[300px] object-contain"
                    style={{
                        filter: `brightness(${settings.brightness / 100}) contrast(${settings.contrast / 100})`,
                        transform: `rotate(${settings.rotation}deg)`,
                    }}
                />
            </div>

            {/* Controls */}
            <div className="p-4 border-t space-y-4">
                {/* Brightness */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                            <Sun className="h-4 w-4" />
                            Brightness
                        </label>
                        <span className="text-xs text-muted-foreground">
                            {settings.brightness}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min={50}
                        max={150}
                        value={settings.brightness}
                        onChange={(e) => handleBrightness(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                            <Contrast className="h-4 w-4" />
                            Contrast
                        </label>
                        <span className="text-xs text-muted-foreground">
                            {settings.contrast}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min={50}
                        max={150}
                        value={settings.contrast}
                        onChange={(e) => handleContrast(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Rotation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleRotate(-90)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">-90°</span>
                    </button>
                    <button
                        onClick={() => handleRotate(90)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80"
                    >
                        <RotateCw className="h-4 w-4" />
                        <span className="text-sm">+90°</span>
                    </button>
                </div>

                {/* Save/Download buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted rounded-md hover:bg-muted/80"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}