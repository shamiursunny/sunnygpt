/**
 * =============================================================================
 * Checkbox Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional checkbox with label support
 * =============================================================================
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId()

    return (
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer',
              'transition-all duration-200',
              'peer-checked:bg-indigo-600 peer-checked:border-indigo-600',
              'hover:border-indigo-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
          </label>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {typeof label === 'string' ? label : label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export default Checkbox