// components/InvoicesSection.tsx
import React from 'react';

export type LineItem = {
    description: string;
    quantity: number | string;
    unit_price: number | string;
    total: number | string;
};

export type InvoiceRow = {
    id: number;
    vendor_name: string;
    invoice_number: string;
    invoice_date: string | null;
    due_date: string | null;
    line_items: LineItem[];
    subtotal: string | null;
    tax: string | null;
    total: string | null;
};

type Props = {
    title?: string;
    invoices: InvoiceRow[];
    loading: boolean;
    onRefresh: () => void | Promise<void>;

    // edit row controls
    editingId: number | null;
    editDraft: Partial<InvoiceRow>;
    onDraftChange: (key: keyof InvoiceRow, value: string) => void;
    startEdit: (inv: InvoiceRow) => void;
    cancelEdit: () => void;
    saveEdit: (id: number) => void | Promise<void>;
    deleteInvoice: (id: number) => void | Promise<void>;
    savingRow: number | null;
    deletingRow: number | null;

    // formatters
    fmtDate: (d?: string | null) => string;
    fmtMoney: (n?: string | null) => string;

    // display options
    showAllItems?: boolean; // false = compact preview; true = list all items
};

const InvoicesSection: React.FC<Props> = ({
    title = 'Invoices',
    invoices,
    loading,
    onRefresh,
    editingId,
    editDraft,
    onDraftChange,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteInvoice,
    savingRow,
    deletingRow,
    fmtDate,
    fmtMoney,
    showAllItems = false,
}) => {
    return (
        <section style={{ marginTop: 32 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0 }}>{title}</h3>
                <button
                    className="btn"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh"
                    aria-busy={loading}
                    aria-label="Refresh">
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* Empty state */}
            {!invoices || invoices.length === 0 ? (
                <div style={{ marginTop: 8, opacity: 0.8 }}>
                    {loading ? 'Loading invoices…' : 'No invoices yet.'}
                </div>
            ) : (
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                    <table className="invoices-table">
                        <colgroup>
                            <col style={{ width: 80 }} /> {/* ID */}
                            <col style={{ width: '18%' }} /> {/* Vendor */}
                            <col style={{ width: '12%' }} /> {/* Invoice # */}
                            <col style={{ width: '10%' }} /> {/* Invoice Date */}
                            <col style={{ width: '10%' }} /> {/* Due Date */}
                            <col style={{ width: '10%' }} /> {/* Items (flex) */}
                            <col style={{ width: '10%' }} /> {/* Subtotal */}
                            <col style={{ width: '8%' }} /> {/* Tax */}
                            <col style={{ width: '10%' }} /> {/* Total */}
                            <col style={{ width: 200 }} /> {/* Actions */}
                        </colgroup>

                        <thead>
                            <tr>
                                <Th>ID</Th>
                                <Th>Vendor</Th>
                                <Th>Invoice #</Th>
                                <Th>Invoice Date</Th>
                                <Th>Due Date</Th>
                                <Th>Items</Th>
                                <Th className="num">Subtotal</Th>
                                <Th className="num">Tax</Th>
                                <Th className="num">Total</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoices.map((inv) => {
                                const isEditing = editingId === inv.id;
                                return (
                                    <tr key={inv.id}>
                                        <Td>{inv.id}</Td>

                                        <Td>
                                            {isEditing ? (
                                                <input
                                                    className="cell-input"
                                                    value={String(editDraft?.vendor_name ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange('vendor_name', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">{inv.vendor_name}</span>
                                            )}
                                        </Td>

                                        <Td>
                                            {isEditing ? (
                                                <input
                                                    className="cell-input"
                                                    value={String(editDraft?.invoice_number ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange(
                                                            'invoice_number',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {inv.invoice_number}
                                                </span>
                                            )}
                                        </Td>

                                        <Td>
                                            {isEditing ? (
                                                <input
                                                    className="cell-input"
                                                    type="date"
                                                    value={String(editDraft?.invoice_date ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange(
                                                            'invoice_date',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {fmtDate(inv.invoice_date)}
                                                </span>
                                            )}
                                        </Td>

                                        <Td>
                                            {isEditing ? (
                                                <input
                                                    className="cell-input"
                                                    type="date"
                                                    value={String(editDraft?.due_date ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange('due_date', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {fmtDate(inv.due_date)}
                                                </span>
                                            )}
                                        </Td>

                                        {/* ITEMS */}
                                        <Td className={showAllItems ? 'items-td' : undefined}>
                                            {showAllItems ? (
                                                <div className="items-cell">
                                                    {inv.line_items && inv.line_items.length > 0 ? (
                                                        inv.line_items.map((item, idx) => (
                                                            <div key={idx} className="item-row">
                                                                {item.quantity !== undefined &&
                                                                item.quantity !== ''
                                                                    ? `${item.quantity} × `
                                                                    : ''}
                                                                {String(item.description ?? '')}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="cell-text">—</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="cell-text">
                                                    {(inv.line_items && inv.line_items.length) || 0}
                                                    {inv.line_items?.[0]?.description
                                                        ? ` — ${String(
                                                              inv.line_items[0].description
                                                          )}`
                                                        : ''}
                                                </span>
                                            )}
                                        </Td>

                                        <Td className="num">
                                            {isEditing ? (
                                                <input
                                                    className="cell-input num"
                                                    value={String(editDraft?.subtotal ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange('subtotal', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {fmtMoney(inv.subtotal)}
                                                </span>
                                            )}
                                        </Td>

                                        <Td className="num">
                                            {isEditing ? (
                                                <input
                                                    className="cell-input num"
                                                    value={String(editDraft?.tax ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange('tax', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {fmtMoney(inv.tax)}
                                                </span>
                                            )}
                                        </Td>

                                        <Td className="num">
                                            {isEditing ? (
                                                <input
                                                    className="cell-input num"
                                                    value={String(editDraft?.total ?? '')}
                                                    onChange={(e) =>
                                                        onDraftChange('total', e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="cell-text">
                                                    {fmtMoney(inv.total)}
                                                </span>
                                            )}
                                        </Td>

                                        <Td style={{ whiteSpace: 'nowrap' }}>
                                            {isEditing ? (
                                                <div className="actions">
                                                    <button
                                                        className="btn btn-brand fixed-btn"
                                                        onClick={() => saveEdit(inv.id)}
                                                        disabled={savingRow === inv.id}>
                                                        {savingRow === inv.id ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button
                                                        className="btn fixed-btn"
                                                        onClick={cancelEdit}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="actions">
                                                    <button
                                                        className="btn fixed-btn"
                                                        onClick={() => startEdit(inv)}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger fixed-btn"
                                                        onClick={() => deleteInvoice(inv.id)}
                                                        disabled={deletingRow === inv.id}>
                                                        {deletingRow === inv.id
                                                            ? 'Deleting…'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Scoped styles to keep things stable & readable */}
            <style jsx>{`
                .invoices-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed; /* 🔒 prevents column shifting */
                }
                .invoices-table th,
                .invoices-table td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .invoices-table th.num,
                .invoices-table td.num {
                    text-align: right;
                }

                /* Inputs fill cell without changing width */
                .cell-input {
                    width: 100%;
                    box-sizing: border-box;
                    font: inherit;
                    padding: 6px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: #fff;
                }
                .cell-text {
                    display: inline-block;
                    width: 100%;
                }

                /* Items cell variants */
                .items-td {
                    white-space: normal;
                } /* allow wrapping here when listing all items */
                .items-cell {
                    line-height: 1.4;
                }
                .item-row {
                    display: block;
                }

                /* Stable action buttons */
                .actions {
                    display: flex;
                    gap: 8px;
                }
                .fixed-btn {
                    min-width: 84px;
                }
            `}</style>
        </section>
    );
};

export default InvoicesSection;

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={className} style={{ textAlign: 'left', borderBottom: '1px solid #e2e2e2' }}>
            {children}
        </th>
    );
}

function Td({
    children,
    className,
    style,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <td className={className} style={style}>
            {children}
        </td>
    );
}
