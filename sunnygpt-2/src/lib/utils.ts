// Utility functions
// Built by Shamiur Rashid Sunny (shamiur.com)

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Merges Tailwind classes smartly - handles conflicts and conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
