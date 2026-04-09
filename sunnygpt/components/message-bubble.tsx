import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
    role: string
    content: string
    fileUrl?: string | null
}

export function MessageBubble({ role, content, fileUrl }: MessageBubbleProps) {
    const isUser = role === 'user'

    return (
        <div className={cn(
            "flex w-full items-start gap-4 p-4",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            <div className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
                isUser ? "bg-background" : "bg-primary text-primary-foreground"
            )}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn(
                "rounded-lg p-3 max-w-[80%] space-y-2",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                {fileUrl && (
                    <img src={fileUrl} alt="Uploaded content" className="max-w-full rounded-md" />
                )}
                <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}
