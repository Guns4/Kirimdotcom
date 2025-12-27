/**
 * Copies data to clipboard in a format consistent with Excel/Google Sheets.
 * Uses HTML Table format for rich pasting (preserves columns/rows)
 * and plain text (TSV) as fallback.
 * 
 * @param data Array of objects to copy
 * @param columns Array of column definitions { key, label }
 */
export const copyToClipboardAsTable = async (data: any[], columns: { key: string, label: string }[]) => {
    // 1. Construct HTML Table string
    const headers = columns.map(c => `<th style="border:1px solid #ccc; background:#f0f0f0;">${c.label}</th>`).join('')
    const rows = data.map(row => {
        const cells = columns.map(c => `
            <td style="border:1px solid #ccc; mso-number-format:'\@';">
                ${row[c.key] !== null && row[c.key] !== undefined ? row[c.key] : '-'}
            </td>
        `).join('')
        return `<tr>${cells}</tr>`
    }).join('')

    const html = `
        <meta charset="utf-8">
        <table border="1" style="border-collapse:collapse;">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `

    // 2. Construct Plain Text (TV - Tab Separated Values)
    const headerText = columns.map(c => c.label).join('\t')
    const bodyText = data.map(r =>
        columns.map(c => r[c.key] || '').join('\t')
    ).join('\n')
    const plainText = `${headerText}\n${bodyText}`

    // 3. Write via Clipboard API
    try {
        const blobHtml = new Blob([html], { type: 'text/html' })
        const blobText = new Blob([plainText], { type: 'text/plain' })

        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })
        ])
        return true
    } catch (err) {
        console.error('Clipboard write failed:', err)
        // Fallback or re-throw
        return false
    }
}

/**
 * Exports data to CSV with UTF-8 BOM for Excel compatibility.
 */
export const exportToCSV = (data: any[], columns: { key: string, label: string }[], filename: string) => {
    // 1. Header
    const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',')

    // 2. Rows
    const rows = data.map(row =>
        columns.map(c => {
            const val = row[c.key]
            if (val === null || val === undefined) return '""'
            return `"${String(val).replace(/"/g, '""')}"`
        }).join(',')
    ).join('\n')

    const csvContent = `${headers}\n${rows}`

    // 3. Blob with BOM
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
