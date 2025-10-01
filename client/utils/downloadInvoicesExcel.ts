// utils/downloadInvoicesExcel.ts
import * as XLSX from 'xlsx';
import type { InvoiceRow } from '@/components/InvoicesSection';

export function downloadInvoicesExcel(invoices: InvoiceRow[], filename = 'invoices.xlsx') {
    // Sheet 1: Invoices (one row per invoice)
    const invoicesSheetData = invoices.map((inv) => ({
        ID: inv.id,
        Vendor: inv.vendor_name,
        'Invoice #': inv.invoice_number,
        'Invoice Date': inv.invoice_date ?? '',
        'Due Date': inv.due_date ?? '',
        Items: inv.line_items.length, // count only
        Subtotal: inv.subtotal ?? '',
        Tax: inv.tax ?? '',
        Total: inv.total ?? '',
    }));
    const wsInvoices = XLSX.utils.json_to_sheet(invoicesSheetData);

    // Sheet 2: Line Items (one row per line item, flattened)
    const itemsSheetData = invoices.flatMap((inv) =>
        inv.line_items.map((li, idx) => ({
            'Invoice ID': inv.id,
            Vendor: inv.vendor_name,
            'Invoice #': inv.invoice_number,
            '#': idx + 1,
            Description: String(li.description ?? ''),
            Quantity: li.quantity ?? '',
            'Unit Price': li.unit_price ?? '',
            Total: li.total ?? '',
            'Invoice Date': inv.invoice_date ?? '',
            'Due Date': inv.due_date ?? '',
        }))
    );
    const wsItems = XLSX.utils.json_to_sheet(itemsSheetData);

    // Build workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsInvoices, 'Invoices');
    XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');

    // (optional) column widths for readability
    wsInvoices['!cols'] = [
        { wch: 6 },
        { wch: 24 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 8 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
    ];
    wsItems['!cols'] = [
        { wch: 10 },
        { wch: 24 },
        { wch: 14 },
        { wch: 4 },
        { wch: 40 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
    ];

    // Trigger browser download
    XLSX.writeFile(wb, filename);
}
