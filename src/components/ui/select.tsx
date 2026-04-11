/**
 * =============================================================================
 * Select Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional select dropdown with search and multi-select support
 * =============================================================================
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, Search, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  fullWidth?: boolean
  searchable?: boolean
}

function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  fullWidth = false,
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const ref = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full h-10 px-3 flex items-center justify-between rounded-lg border border-gray-300 bg-white',
            'text-left transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500'
          )}
        >
          <span className={cn(!selectedOption && 'text-gray-400')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-8 pl-9 pr-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="p-1 max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2',
                      'hover:bg-gray-100',
                      option.value === value && 'bg-indigo-50 text-indigo-700',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {option.icon}
                    <span className="flex-1">{option.label}</span>
                    {option.value === value && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Multi-select variant
export interface MultiSelectProps {
  options: SelectOption[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  label?: string
  error?: string
  fullWidth?: boolean
}

function MultiSelect({
  options,
  values,
  onChange,
  placeholder = 'Select options',
  label,
  error,
  fullWidth = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter((opt) => values.includes(opt.value))

  const handleRemove = (value: string) => {
    onChange(values.filter((v) => v !== value))
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full min-h-10 px-3 py-1.5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white',
            'text-left transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'flex-wrap'
          )}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-sm rounded"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(option.value)
                  }}
                  className="hover:bg-indigo-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 ml-auto transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-1 max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const newValues = values.includes(option.value)
                      ? values.filter((v) => v !== option.value)
                      : [...values, option.value]
                    onChange(newValues)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2',
                    'hover:bg-gray-100',
                    values.includes(option.value) && 'bg-indigo-50 text-indigo-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      values.includes(option.value)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    )}
                  >
                    {values.includes(option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

Select.displayName = 'Select'

export { Select, MultiSelect }
export default Select
