import React from 'react';

/**
 * Data table component with header, hover rows, and shadow-card wrapper.
 * Matches design.md §6.4.
 */
export default function DataTable({ columns, rows }) {
  return (
    <div className="w-full overflow-hidden rounded-xl shadow-card">
      <table className="w-full text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-bg-raised border-b border-white/5">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[10px] font-mono font-medium
                           uppercase tracking-[0.1em] text-text-muted whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        {/* Body */}
        <tbody className="bg-bg-surface divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-bg-raised transition-colors duration-100">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-text-secondary">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
