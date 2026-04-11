/**
 * =============================================================================
 * Table Component - SunnyGPT Enterprise
 * =============================================================================
 * Professional data table with sorting, pagination, and selection
 * =============================================================================
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Check,
  MoreHorizontal,
  Download,
  FileSpreadsheet
} from 'lucide-react'

export interface TableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  keyExtractor: (item: T) => string
  loading?: boolean
  selectable?: boolean
  selectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  emptyText?: string
  onRowClick?: (item: T) => void
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortKey,
  sortOrder,
  onSort,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  emptyText = 'No data found',
  onRowClick,
}: TableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => 
    selectedKeys.includes(keyExtractor(item))
  )
  const someSelected = data.some((item) => 
    selectedKeys.includes(keyExtractor(item))
  )

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([])
    } else {
      const allKeys = data.map(keyExtractor)
      onSelectionChange?.(allKeys)
    }
  }

  const handleSelectRow = (key: string) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter((k) => k !== key))
    } else {
      onSelectionChange?.([...selectedKeys, key])
    }
  }

  const totalPages = total ? Math.ceil(total / pageSize) : 1

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={handleSelectAll}
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                      allSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : someSelected
                        ? 'bg-indigo-100 border-indigo-300'
                        : 'border-gray-300 hover:border-indigo-400'
                    )}
                  >
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                    {someSelected && !allSelected && (
                      <Check className="w-3 h-3 text-indigo-600" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className={cn(
                    'flex items-center gap-1',
                    column.align === 'right' && 'justify-end',
                    column.align === 'center' && 'justify-center'
                  )}>
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                    {column.sortable && sortKey !== column.key && (
                      <ChevronsUpDown className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {selectable && <td className="px-4 py-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>}
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const key = keyExtractor(item)
                const isSelected = selectedKeys.includes(key)
                return (
                  <tr
                    key={key}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-indigo-50/50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectRow(key)}
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300 hover:border-indigo-400'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-4 text-sm text-gray-700',
                          column.align === 'right' && 'text-right',
                          column.align === 'center' && 'text-center'
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg',
                    page === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export Button Component for Tables
function TableExportButton({
  onExport,
  onExportCSV,
}: {
  onExport?: () => void
  onExportCSV?: () => void
}) {
  const [showMenu, setShowMenu] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => { onExport?.(); setShowMenu(false) }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => { onExportCSV?.(); setShowMenu(false) }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      )}
    </div>
  )
}
export { Table, TableExportButton };
export default Table;
