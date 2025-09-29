import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import ModelPicker from '@/components/ModelPicker';
import Dropzone from '@/components/Dropzone';
import Preview from '@/components/Preview';
import ExtractionPanel from '@/components/ExtractionPanel';
import axios from 'axios';


type LineItem = {
    description: string;
    quantity: number | string;
    unit_price: number | string;
    total: number | string;
};

type Invoice = {
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

export default function Home() {
    const [model, setModel] = useState('ChatGPT 5');
    const [files, setFiles] = useState<File[]>([]);
    const [selected, setSelected] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'idle' | 'uploading' | 'ready' | 'extracted'>('idle');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // editing state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState<Partial<Invoice>>({});
    const [savingRow, setSavingRow] = useState<number | null>(null);
    const [deletingRow, setDeletingRow] = useState<number | null>(null);

    // demo upload simulator
    useEffect(() => {
        if (phase !== 'uploading') return;
        let p = 0;
        const t = setInterval(() => {
            p = Math.min(100, p + Math.random() * 18 + 6);
            setProgress(Math.round(p));
            if (p >= 100) {
                clearInterval(t);
                setPhase('ready');
            }
        }, 140);
        return () => clearInterval(t);
    }, [phase]);

    // Fetch invoices
    const loadInvoices = async () => {
        try {
            setLoadingInvoices(true);
            const res = await axios.get<Invoice[]>(`http://localhost:4000/api/flask/invoices`);
            const data = Array.isArray(res.data) ? res.data : [];
            setInvoices(data);
        } catch (e) {
            console.error('Error fetching invoices:', e);
        } finally {
            setLoadingInvoices(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const onFiles = (fl: FileList | File[]) => {
        const arr = Array.from(fl);
        setFiles(arr);
        setSelected(arr[0] || null);
        setProgress(0);
        setPhase('uploading');
    };

    const showPreview = useMemo(() => phase === 'uploading' || phase === 'ready', [phase]);

    const fmtDate = (d?: string | null) => (d ? d : '');
    const fmtMoney = (n?: string | null) => (n ?? '') || '';

    // ---- inline edit helpers ----
    const startEdit = (inv: Invoice) => {
        setEditingId(inv.id);
        setEditDraft({
            vendor_name: inv.vendor_name,
            invoice_number: inv.invoice_number,
            invoice_date: inv.invoice_date,
            due_date: inv.due_date,
            subtotal: inv.subtotal,
            tax: inv.tax,
            total: inv.total,
            // keeping line_items out of inline edit to keep table compact
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDraft({});
    };

    const onDraftChange = (key: keyof Invoice, value: string) => {
        setEditDraft((d) => ({ ...d, [key]: value }));
    };

    const saveEdit = async (id: number) => {
        try {
            setSavingRow(id);
            // send only provided fields (PATCH). Server already parses dates & decimals.
            const body: any = {};

            // Only include keys that exist in editDraft (avoid sending undefined)
            (
                [
                    'vendor_name',
                    'invoice_number',
                    'invoice_date',
                    'due_date',
                    'subtotal',
                    'tax',
                    'total',
                ] as (keyof Invoice)[]
            ).forEach((k) => {
                if (editDraft[k] !== undefined) body[k] = editDraft[k];
            });

            await axios.patch(`http://localhost:4000/api/flask/invoices/${id}`, body);
            await loadInvoices();
            cancelEdit();
        } catch (e) {
            console.error('Save failed:', e);
            alert('Failed to save invoice. Check server logs.');
        } finally {
            setSavingRow(null);
        }
    };

    const deleteInvoice = async (id: number) => {
        if (!confirm(`Delete invoice #${id}? This cannot be undone.`)) return;
        try {
            setDeletingRow(id);
            await axios.delete(`http://localhost:4000/api/flask/invoices/${id}`);
            setInvoices((rows) => rows.filter((r) => r.id !== id));
        } catch (e) {
            console.error('Delete failed:', e);
            alert('Failed to delete invoice. Check server logs.');
        } finally {
            setDeletingRow(null);
        }
    };

    return (
        <>
            <Head>
                <title>Stryker</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Header />

            <main className="container main-wrap">
                <ModelPicker value={model} onChange={setModel} />
                <div>
                    <Dropzone onFiles={onFiles} />
                    <Preview
                        file={selected}
                        progress={progress}
                        onExtract={() => setPhase('extracted')}
                        visible={showPreview}
                    />
                    <ExtractionPanel file={selected} visible={phase === 'extracted'} />
                    {/* Invoices table (editable) */}
                    <section style={{ marginTop: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h3 style={{ margin: 0 }}>Invoices</h3>
                            <button
                                className="btn"
                                onClick={loadInvoices}
                                disabled={loadingInvoices}>
                                {loadingInvoices ? 'Refreshing…' : 'Refresh'}
                            </button>
                        </div>

                        {invoices.length === 0 ? (
                            <div style={{ marginTop: 8, opacity: 0.8 }}>
                                {loadingInvoices ? 'Loading invoices…' : 'No invoices yet.'}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', marginTop: 12 }}>
                                <table
                                    className="table"
                                    style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={th}>ID</th>
                                            <th style={th}>Vendor</th>
                                            <th style={th}>Invoice #</th>
                                            <th style={th}>Invoice Date</th>
                                            <th style={th}>Due Date</th>
                                            <th style={th}>Items</th>
                                            <th style={th}>Subtotal</th>
                                            <th style={th}>Tax</th>
                                            <th style={th}>Total</th>
                                            <th style={th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((inv) => {
                                            const isEditing = editingId === inv.id;
                                            return (
                                                <tr key={inv.id}>
                                                    <td style={td}>{inv.id}</td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                value={String(
                                                                    editDraft.vendor_name ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'vendor_name',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            inv.vendor_name
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                value={String(
                                                                    editDraft.invoice_number ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'invoice_number',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            inv.invoice_number
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={String(
                                                                    editDraft.invoice_date ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'invoice_date',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            fmtDate(inv.invoice_date)
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={String(
                                                                    editDraft.due_date ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'due_date',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            fmtDate(inv.due_date)
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {inv.line_items?.length || 0}{' '}
                                                        {inv.line_items?.[0]?.description
                                                            ? `— ${String(
                                                                  inv.line_items[0].description
                                                              )}`
                                                            : ''}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                value={String(
                                                                    editDraft.subtotal ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'subtotal',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            fmtMoney(inv.subtotal)
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                value={String(editDraft.tax ?? '')}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'tax',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            fmtMoney(inv.tax)
                                                        )}
                                                    </td>

                                                    <td style={td}>
                                                        {isEditing ? (
                                                            <input
                                                                value={String(
                                                                    editDraft.total ?? ''
                                                                )}
                                                                onChange={(e) =>
                                                                    onDraftChange(
                                                                        'total',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            fmtMoney(inv.total)
                                                        )}
                                                    </td>

                                                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    className="btn btn-brand"
                                                                    onClick={() => saveEdit(inv.id)}
                                                                    disabled={savingRow === inv.id}>
                                                                    {savingRow === inv.id
                                                                        ? 'Saving…'
                                                                        : 'Save'}
                                                                </button>
                                                                <button
                                                                    className="btn"
                                                                    onClick={cancelEdit}
                                                                    style={{ marginLeft: 8 }}>
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => startEdit(inv)}>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() =>
                                                                        deleteInvoice(inv.id)
                                                                    }
                                                                    disabled={
                                                                        deletingRow === inv.id
                                                                    }
                                                                    style={{ marginLeft: 8 }}>
                                                                    {deletingRow === inv.id
                                                                        ? 'Deleting…'
                                                                        : 'Delete'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

/* simple inline table styles */
const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '8px 10px',
    borderBottom: '1px solid #e2e2e2',
    whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
    padding: '8px 10px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top',
};
