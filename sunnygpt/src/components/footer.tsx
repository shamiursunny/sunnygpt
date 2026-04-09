// Simple footer with attribution
// Built by Shamiur Rashid Sunny (shamiur.com)

'use client'

export function Footer() {
    return (
        <footer className="border-t bg-muted/40 py-4 px-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Created by</span>
                <a
                    href="https://shamiur.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline transition-colors"
                >
                    Shamiur Rashid Sunny
                </a>
                <span>•</span>
                <a
                    href="https://shamiur.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                >
                    shamiur.com
                </a>
            </div>
        </footer>
    )
}
