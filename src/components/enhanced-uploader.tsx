// Enhanced File Uploader for SunnyGPT
// Drag & drop, multiple files, progress indicator
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
    Upload, 
    X, 
    File, 
    Image, 
    Video, 
    Music, 
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
    validateFile, 
    formatFileSize, 
    getFileIcon, 
    getFileCategory,
    ALLOWED_FILE_TYPES 
} from '@/lib/file-manager'

interface EnhancedUploaderProps {
    onFileUpload?: (files: UploadedFile[]) => void
    maxFiles?: number
    showPreview?: boolean
    className?: string
}

interface UploadedFile {
    file: File
    url: string
    name: string
    size: number
    type: string
}

interface FileStatus {
    [key: string]: 'pending' | 'uploading' | 'success' | 'error'
}

export function EnhancedUploader({ 
    onFileUpload,
    maxFiles = 5,
    showPreview = true,
    className 
}: EnhancedUploaderProps) {
    const [files, setFiles] = useState<File[]>([])
    const [uploadStatus, setUploadStatus] = useState<FileStatus>({})
    const [previews, setPreviews] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Generate preview URL for files
    const createPreview = useCallback((file: File): string => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        }
        return ''
    }, [])

    // Handle drop events
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null)
        
        // Validate each file
        const validFiles: File[] = []
        for (const file of acceptedFiles) {
            const validation = validateFile(file)
            if (validation.valid) {
                validFiles.push(file)
            } else {
                setError(validation.error || 'Invalid file')
            }
        }
        
        // Check max files
        if (validFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`)
            return
        }
        
        // Add files and create previews
        setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles))
        
        const newPreviews: Record<string, string> = {}
        validFiles.forEach(file => {
            const preview = createPreview(file)
            if (preview) {
                newPreviews[file.name] = preview
            }
        })
        setPreviews(prev => ({ ...prev, ...newPreviews }))
        
        // Set initial status
        const newStatus: FileStatus = {}
        validFiles.forEach(file => {
            newStatus[file.name] = 'pending'
        })
        setUploadStatus(prev => ({ ...prev, ...newStatus }))
    }, [maxFiles, createPreview])

    // Configure dropzone
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        maxFiles: maxFiles - files.length,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.webm'],
            'audio/*': ['.mp3', '.wav', '.ogg'],
            'application/pdf': ['.pdf'],
            'text/*': ['.txt', '.csv'],
        },
        disabled: uploading || files.length >= maxFiles,
    })

    // Upload files to server
    const uploadFiles = async () => {
        if (files.length === 0) return
        
        setUploading(true)
        setError(null)
        
        const uploadedFiles: UploadedFile[] = []
        
        for (const file of files) {
            // Skip already successful uploads
            if (uploadStatus[file.name] === 'success') continue
            
            setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
            
            try {
                const formData = new FormData()
                formData.append('file', file)
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })
                
                const data = await response.json()
                
                if (data.error) {
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
                    setError(data.error)
                } else {
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
                    uploadedFiles.push({
                        file,
                        url: data.url,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    })
                }
            } catch (err) {
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
                setError('Upload failed')
            }
        }
        
        setUploading(false)
        
        if (uploadedFiles.length > 0) {
            onFileUpload?.(uploadedFiles)
        }
    }

    // Remove file
    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName))
        setPreviews(prev => {
            const { [fileName]: _, ...rest } = prev
            return rest
        })
        setUploadStatus(prev => {
            const { [fileName]: _, ...rest } = prev
            return rest
        })
    }

    // Get file icon
    const getIcon = (type: string) => {
        const category = getFileCategory(type)
        
        switch (category) {
            case 'image': return <Image className="h-8 w-8" />
            case 'video': return <Video className="h-8 w-8" />
            case 'audio': return <Music className="h-8 w-8" />
            default: return <FileText className="h-8 w-8" />
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop zone */}
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive && "border-primary bg-primary/5",
                    isDragReject && "border-destructive bg-destructive/5",
                    (!isDragActive || isDragReject) && "border-muted-foreground/25",
                    (uploading || files.length >= maxFiles) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} ref={fileInputRef} />
                
                <div className="flex flex-col items-center gap-2">
                    <Upload className={cn(
                        "h-10 w-10",
                        isDragActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    
                    <div>
                        {isDragActive ? (
                            <p className="text-primary font-medium">
                                Drop files here...
                            </p>
                        ) : (
                            <>
                                <p className="text-sm">
                                    Drag & drop files here, or{' '}
                                    <span className="text-primary font-medium">click to browse</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Images, videos, audio, and documents supported
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                            {/* Preview or Icon */}
                            {showPreview && previews[file.name] ? (
                                <img
                                    src={previews[file.name]}
                                    alt={file.name}
                                    className="h-12 w-12 object-cover rounded"
                                />
                            ) : (
                                <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                                    {getIcon(file.type)}
                                </div>
                            )}
                            
                            {/* File info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)} • {getFileIcon(file.type)} {file.type}
                                </p>
                            </div>
                            
                            {/* Status */}
                            <div className="flex items-center gap-2">
                                {uploadStatus[file.name] === 'uploading' && (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                )}
                                {uploadStatus[file.name] === 'success' && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {uploadStatus[file.name] === 'error' && (
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                )}
                                
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.name)}
                                    disabled={uploading}
                                    className="p-1 rounded hover:bg-muted transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {files.length > 0 && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={uploadFiles}
                        disabled={uploading || Object.values(uploadStatus).every(s => s === 'success')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md",
                            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                <span>Upload Files</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    )
}