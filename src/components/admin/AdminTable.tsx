'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Admin Table with Bulk Actions and Inline Edit
 */

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  editRender?: (
    value: unknown,
    onChange: (value: unknown) => void
  ) => React.ReactNode;
  width?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  variant?: 'default' | 'danger';
  action: (selectedIds: string[]) => void | Promise<void>;
}

interface AdminTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  bulkActions?: BulkAction[];
  onInlineEdit?: (
    id: string,
    key: string,
    value: unknown
  ) => void | Promise<void>;
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string }>({
  data,
  columns,
  bulkActions = [],
  onInlineEdit,
  loading = false,
  emptyMessage = 'Tidak ada data',
}: AdminTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<unknown>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Select all
  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Inline edit
  const startEdit = (id: string, key: string, value: unknown) => {
    setEditingCell({ id, key });
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (editingCell && onInlineEdit) {
      await onInlineEdit(editingCell.id, editingCell.key, editValue);
    }
    setEditingCell(null);
    setEditValue(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue(null);
  };

  // Sorting
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = (a as Record<string, unknown>)[sortConfig.key];
    const bVal = (b as Record<string, unknown>)[sortConfig.key];
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * direction;
    }
    return ((aVal as number) - (bVal as number)) * direction;
  });

  // Get cell value
  const getCellValue = (item: T, key: string) => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  return (
    <div className="relative">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-20 bg-primary-500 text-white px-4 py-3 rounded-t-xl flex items-center gap-4 shadow-lg">
          <span className="font-medium">{selectedIds.size} item terpilih</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.action(Array.from(selectedIds))}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors',
                  action.variant === 'danger'
                    ? 'bg-white/20 hover:bg-red-600'
                    : 'bg-white/20 hover:bg-white/30'
                )}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 hover:bg-white/20 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          'overflow-x-auto bg-white rounded-xl border border-surface-200',
          selectedIds.size > 0 && 'rounded-t-none'
        )}
      >
        <table className="w-full">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              {/* Checkbox header */}
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-surface-700',
                    col.sortable && 'cursor-pointer hover:bg-surface-100'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-surface-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'hover:bg-surface-50 transition-colors',
                    selectedIds.has(item.id) && 'bg-primary-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  {columns.map((col) => {
                    const value = getCellValue(item, String(col.key));
                    const isEditing =
                      editingCell?.id === item.id &&
                      editingCell?.key === col.key;

                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-surface-700',
                          col.editable && 'cursor-pointer hover:bg-primary-50'
                        )}
                        onDoubleClick={() =>
                          col.editable &&
                          startEdit(item.id, String(col.key), value)
                        }
                      >
                        {isEditing ? (
                          <InlineEdit
                            value={editValue}
                            onChange={setEditValue}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            render={col.editRender}
                          />
                        ) : col.render ? (
                          col.render(value, item)
                        ) : (
                          String(value ?? '-')
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Inline Edit Component
 */
interface InlineEditProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  render?: (
    value: unknown,
    onChange: (value: unknown) => void
  ) => React.ReactNode;
}

function InlineEdit({
  value,
  onChange,
  onSave,
  onCancel,
  render,
}: InlineEditProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (render) {
    return <>{render(value, onChange)}</>;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onSave}
        className="px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}

/**
 * Default Bulk Actions
 */
export const defaultBulkActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Hapus',
    icon: '🗑️',
    variant: 'danger',
    action: async (ids) => {
      if (confirm(`Hapus ${ids.length} item?`)) {
        console.log('Delete:', ids);
      }
    },
  },
  {
    id: 'activate',
    label: 'Aktifkan',
    icon: '✅',
    action: async (ids) => console.log('Activate:', ids),
  },
  {
    id: 'deactivate',
    label: 'Nonaktifkan',
    icon: '⏸️',
    action: async (ids) => console.log('Deactivate:', ids),
  },
  {
    id: 'export',
    label: 'Export',
    icon: '📊',
    action: async (ids) => console.log('Export:', ids),
  },
];

/**
 * Export to Excel helper
 */
export function exportToExcel<T>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  const headers = columns.map((c) => c.label).join(',');
  const rows = data.map((item) =>
    columns
      .map((c) => {
        const val = item[c.key];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      })
      .join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export default AdminTable;
