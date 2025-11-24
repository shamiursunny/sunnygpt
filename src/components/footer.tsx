/**
 * Footer Component
 * 
 * Footer component displaying author attribution and website link.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

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
