// File Manager Panel for SunnyGPT
// Browse, view, and manage uploaded files
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

import { useState, useEffect } from 'react'
import { 
    Folder, 
    File, 
    Image, 
    Video, 
    Music, 
    FileText,
    Download,
    Trash2,
    Share2,
    Edit,
    Search,
    Filter,
    Grid,
    List,
    Plus,
    X,
    ChevronRight,
    ChevronLeft,
    ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient, isImage, isVideo, isAudio, formatFileSize, downloadFile, getFileCategory } from '@/lib/file-manager'
import { MediaViewer } from './media-viewer'
import { ShareDialog } from './share-dialog'
import { ImageEditor } from './image-editor'

interface FileItem {
    id: string
    name: string
    url: string
    type: string
    size: number
    createdAt: string
    path: string
}

interface FileManagerProps {
    className?: string
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'video' | 'audio' | 'document'
type SortBy = 'name' | 'date' | 'size'

export function FileManager({ className }: FileManagerProps) {
    const [files, setFiles] = useState<FileItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterType>('all')
    const [sortBy, setSortBy] = useState<SortBy>('date')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
    const [showViewer, setShowViewer] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [showEditor, setShowEditor] = useState(false)

    // Load files from Supabase
    useEffect(() => {
        loadFiles()
    }, [])

    const loadFiles = async () => {
        setLoading(true)
        setError(null)

        const supabase = getSupabaseClient()
        if (!supabase) {
            setError('Storage not configured')
            setLoading(false)
            return
        }

        try {
            const { data, error: storageError } = await supabase.storage
                .from('chat-files')
                .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } })

            if (storageError) {
                setError(storageError.message)
                return
            }

            // Get public URL for each file
            const filesWithUrls: FileItem[] = await Promise.all(
                (data || []).map(async (file) => {
                    const { data: urlData } = supabase.storage
                        .from('chat-files')
                        .getPublicUrl(file.name)

                    return {
                        id: file.id,
                        name: file.name,
                        url: urlData.publicUrl,
                        type: getMimeType(file.name),
                        size: file.metadata?.size || 0,
                        createdAt: file.created_at || new Date().toISOString(),
                        path: file.name,
                    }
                })
            )

            setFiles(filesWithUrls)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files')
        } finally {
            setLoading(false)
        }
    }

    // Get MIME type from filename
    const getMimeType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            mp4: 'video/mp4',
            webm: 'video/webm',
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            pdf: 'application/pdf',
            txt: 'text/plain',
            json: 'application/json',
        }
        return mimeTypes[ext || ''] || 'application/octet-stream'
    }

    // Filter files
    const filteredFiles = files.filter(file => {
        // Search filter
        if (search && !file.name.toLowerCase().includes(search.toLowerCase())) {
            return false
        }
        
        // Type filter
        if (filter !== 'all') {
            const category = getFileCategory(file.type)
            if (category !== filter) {
                return false
            }
        }
        
        return true
    })

    // Sort files
    const sortedFiles = [...filteredFiles].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name)
            case 'date':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            case 'size':
                return b.size - a.size
            default:
                return 0
        }
    })

    // Get file icon
    const getFileIcon = (type: string) => {
        const category = getFileCategory(type)
        
        switch (category) {
            case 'image': return <Image className="h-5 w-5" />
            case 'video': return <Video className="h-5 w-5" />
            case 'audio': return <Music className="h-5 w-5" />
            default: return <FileText className="h-5 w-5" />
        }
    }

    // Handle file click
    const handleFileClick = (file: FileItem) => {
        setSelectedFile(file)
        
        if (isImage(file.type)) {
            // Check if it's for editing
            setShowViewer(true)
        } else {
            setShowViewer(true)
        }
    }

    // Handle delete
    const handleDelete = async (file: FileItem) => {
        if (!confirm(`Delete ${file.name}?`)) return

        const supabase = getSupabaseClient()
        if (!supabase) return

        const { error } = await supabase.storage
            .from('chat-files')
            .remove([file.path])

        if (error) {
            alert(error.message)
            return
        }

        loadFiles()
    }

    // Render
    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header toolbar */}
            <div className="flex items-center gap-2 p-2 border-b">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-muted text-sm"
                    />
                </div>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="px-3 py-2 rounded-md bg-muted text-sm"
                >
                    <option value="all">All files</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                </select>

                {/* View mode */}
                <div className="flex rounded-md overflow-hidden">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2",
                            viewMode === 'grid' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2",
                            viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* File list */}
            <div className="flex-1 overflow-auto p-4">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{error}</p>
                        <button
                            onClick={loadFiles}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && sortedFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No files found</p>
                    </div>
                )}

                {!loading && !error && sortedFiles.length > 0 && (
                    <div className={cn(
                        viewMode === 'grid' 
                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                            : "space-y-2"
                    )}>
                        {sortedFiles.map((file) => (
                            <div
                                key={file.id}
                                onClick={() => handleFileClick(file)}
                                className={cn(
                                    "group relative rounded-lg border bg-card hover:bg-muted cursor-pointer transition-colors",
                                    viewMode === 'list' && "flex items-center gap-3 p-3"
                                )}
                            >
                                {/* Grid view */}
                                {viewMode === 'grid' && (
                                    <div className="aspect-square flex flex-col items-center justify-center p-4">
                                        {isImage(file.type) ? (
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                {getFileIcon(file.type)}
                                                <span className="text-xs text-center mt-2 truncate w-full">
                                                    {file.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* List view */}
                                {viewMode === 'list' && (
                                    <>
                                        <div className="flex-shrink-0">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Hover actions */}
                                <div className={cn(
                                    "absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg",
                                    viewMode === 'list' && "relative opacity-100 bg-transparent"
                                )}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            downloadFile(file.url, file.name)
                                        }}
                                        className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedFile(file)
                                            setShowShare(true)
                                        }}
                                        className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                                        title="Share"
                                    >
                                        <Share2 className="h-4 w-4 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(file)
                                        }}
                                        className="p-2 bg-red-500/50 rounded-full hover:bg-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Media Viewer Modal */}
            {showViewer && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                    <MediaViewer
                        url={selectedFile.url}
                        type={selectedFile.type}
                        filename={selectedFile.name}
                        onClose={() => {
                            setShowViewer(false)
                            setSelectedFile(null)
                        }}
                        className="w-full h-full max-w-4xl max-h-screen"
                    />
                </div>
            )}

            {/* Share Dialog Modal */}
            {showShare && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <ShareDialog
                        fileUrl={selectedFile.url}
                        filePath={selectedFile.path}
                        filename={selectedFile.name}
                        onClose={() => {
                            setShowShare(false)
                            setSelectedFile(null)
                        }}
                        className="w-full max-w-md"
                    />
                </div>
            )}

            {/* File count */}
            <div className="p-2 border-t text-xs text-muted-foreground text-center">
                {sortedFiles.length} of {files.length} files
            </div>
        </div>
    )
}