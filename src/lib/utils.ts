/**
 * Utility Functions
 * 
 * Helper functions for common operations throughout the application.
 * Currently includes className merging utility for Tailwind CSS.
 * 
 * @author Shamiur Rashid Sunny
 * @website https://shamiur.com
 * @copyright © 2025 Shamiur Rashid Sunny - All Rights Reserved
 * @license Proprietary - Usage requires explicit permission from the author
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS class names intelligently
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 * 
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
