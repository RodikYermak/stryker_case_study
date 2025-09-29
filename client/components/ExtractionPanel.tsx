import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

/* ---------- Types that mirror Flask to_dict() ---------- */
type LineItem = {
    description: string;
    quantity: number | string;
    unit_price: number | string;
    total: number | string;
};

export type Invoice = {
    id: number | null;
    vendor_name: string;
    invoice_number: string;
    invoice_date: string | null;
    due_date: string | null;
    line_items: LineItem[];
    subtotal: string | null;
    tax: string | null;
    total: string | null;
};

const EMPTY_INVOICE: Invoice = {
    id: null,
    vendor_name: '',
    invoice_number: '',
    invoice_date: null,
    due_date: null,
    line_items: [
        { description: '', quantity: '', unit_price: '', total: '' },
        { description: '', quantity: '', unit_price: '', total: '' },
    ],
    subtotal: '',
    tax: '',
    total: '',
};

type Props = {
    file: File | null;
    visible: boolean;
    apiBase?: string; // default http://localhost:4000
    /** Seed from extractor result */
    initialInvoice?: Invoice;
};

function normalizeInvoice(inv: Partial<Invoice> | null | undefined): Invoice {
    const safe = inv ?? {};
    const items = Array.isArray(safe.line_items) ? safe.line_items : [];
    return {
        id: safe.id ?? null,
        vendor_name: safe.vendor_name ?? '',
        invoice_number: safe.invoice_number ?? '',
        invoice_date: safe.invoice_date ?? null,
        due_date: safe.due_date ?? null,
        line_items: items.map((it: any) => ({
            description: String(it?.description ?? ''),
            quantity: it?.quantity ?? '',
            unit_price: it?.unit_price ?? '',
            total: it?.total ?? '',
        })),
        subtotal: safe.subtotal ?? '',
        tax: safe.tax ?? '',
        total: safe.total ?? '',
    };
}

function toApiPayload(invoice: Invoice) {
    const normDate = (s: string | null) => (s && s.trim() !== '' ? s : null);
    const num = (v: any) => {
        if (v === '' || v === null || v === undefined) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    return {
        vendor_name: invoice.vendor_name?.trim() || '',
        invoice_number: invoice.invoice_number?.trim() || '',
        invoice_date: normDate(invoice.invoice_date ?? null),
        due_date: normDate(invoice.due_date ?? null),
        line_items: (invoice.line_items || []).map((it) => ({
            description: (it.description ?? '').toString(),
            quantity: num(it.quantity),
            unit_price: num(it.unit_price),
            total: num(it.total),
        })),
        subtotal: num(invoice.subtotal),
        tax: num(invoice.tax),
        total: num(invoice.total),
    };
}

/** Small controlled input helper */
function Field(props: {
    label: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: 'text' | 'date' | 'number';
}) {
    const { label, id, value, onChange, placeholder, type = 'text' } = props;
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default function ExtractionPanel({ file, visible, apiBase, initialInvoice }: Props) {
    const base = apiBase ?? 'http://localhost:4000';
    const [thumb, setThumb] = useState<string>('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [invoice, setInvoice] = useState<Invoice>(initialInvoice ?? EMPTY_INVOICE);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // seed from extractor when it changes
    useEffect(() => {
        if (initialInvoice) setInvoice(initialInvoice);
    }, [initialInvoice]);

    // handle preview (image OR pdf)
    useEffect(() => {
        if (!file) {
            setThumb('');
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
            return;
        }
        if (file.type.startsWith('image/')) {
            const r = new FileReader();
            r.onload = (e) => setThumb(String(e.target?.result || ''));
            r.readAsDataURL(file);
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        } else if (file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setThumb('');
            return () => URL.revokeObjectURL(url);
        } else {
            setThumb('');
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    const isPdf = !!file && file.type === 'application/pdf';

    // Controlled input helpers
    const updateField = (key: keyof Invoice, value: any) =>
        setInvoice((inv) => ({ ...inv, [key]: value }));

    const updateLineItem = (idx: number, key: keyof LineItem, value: any) =>
        setInvoice((inv) => {
            const items = inv.line_items.slice();
            if (!items[idx]) return inv;
            items[idx] = { ...items[idx], [key]: value };
            return { ...inv, line_items: items };
        });

    const addLineItem = () =>
        setInvoice((inv) => ({
            ...inv,
            line_items: [
                ...inv.line_items,
                { description: '', quantity: '', unit_price: '', total: '' },
            ],
        }));

    const removeLineItem = (idx: number) =>
        setInvoice((inv) => ({
            ...inv,
            line_items: inv.line_items.filter((_, i) => i !== idx),
        }));

    const totalsHint = useMemo(
        () =>
            `Subtotal: ${invoice.subtotal ?? ''}  |  Tax: ${invoice.tax ?? ''}  |  Total: ${
                invoice.total ?? ''
            }`,
        [invoice.subtotal, invoice.tax, invoice.total]
    );

    /** Save: ALWAYS POST (create new invoice) */
    const saveInvoice = async () => {
        setSaving(true);
        setSaveMsg(null);
        try {
            const payload = toApiPayload(invoice);

            if (!payload.vendor_name || !payload.invoice_number) {
                setSaveMsg('vendor_name and invoice_number are required.');
                setSaving(false);
                return;
            }

            const res = await fetch(`${base}/api/flask/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({} as any));
                throw new Error(err?.error || err?.message || `HTTP ${res.status}`);
            }

            const saved = await res.json();
            setInvoice((prev) => normalizeInvoice({ ...prev, ...saved }));
            setSaveMsg('Invoice saved ✅');
        } catch (e: any) {
            console.error('Save failed:', e);
            setSaveMsg(`Save failed: ${e.message || e.toString()}`);
        } finally {
            setSaving(false);
        }
    };

    if (!visible) return null;

    return (
        <section className="extraction">
            <div className="extraction-grid">
                <aside className="extract-thumb">
                    {isPdf ? (
                        <iframe
                            src={(pdfUrl ?? '') + '#toolbar=0&navpanes=0&scrollbar=0'}
                            width={300}
                            height={360}
                            style={{ border: '1px solid #ddd', borderRadius: 4 }}
                            title="PDF preview"
                        />
                    ) : (
                        <Image
                            src={thumb || '/images/placeholder.png'}
                            alt="Uploaded invoice preview"
                            width={300}
                            height={360}
                        />
                    )}

                    <button
                        className="btn btn-brand"
                        type="button"
                        disabled={saving}
                        onClick={saveInvoice}
                        title="Save invoice to DB">
                        {saving ? 'Saving…' : 'Save to DB'}
                    </button>
                    {saveMsg && (
                        <div role="status" style={{ marginTop: 8, opacity: 0.8 }}>
                            {saveMsg}
                        </div>
                    )}
                </aside>

                <form
                    className="extract-form"
                    autoComplete="off"
                    onSubmit={(e) => e.preventDefault()}>
                    {/* Top-level invoice fields */}
                    <Field
                        label="VENDOR NAME"
                        id="vendor_name"
                        value={invoice.vendor_name}
                        onChange={(v) => updateField('vendor_name', v)}
                        placeholder="Acme Corp"
                    />
                    <Field
                        label="INVOICE NUMBER"
                        id="invoice_number"
                        value={invoice.invoice_number}
                        onChange={(v) => updateField('invoice_number', v)}
                        placeholder="INV-1001"
                    />
                    <Field
                        label="INVOICE DATE"
                        id="invoice_date"
                        type="date"
                        value={invoice.invoice_date ?? ''}
                        onChange={(v) => updateField('invoice_date', v)}
                        placeholder="YYYY-MM-DD"
                    />
                    <Field
                        label="DUE DATE"
                        id="due_date"
                        type="date"
                        value={invoice.due_date ?? ''}
                        onChange={(v) => updateField('due_date', v)}
                        placeholder="YYYY-MM-DD"
                    />

                    {/* Line Items */}
                    <h4 style={{ marginTop: 16 }}>Line Items</h4>
                    {invoice.line_items.map((it, idx) => (
                        <div className="row-4" key={idx} style={{ gap: 8, alignItems: 'end' }}>
                            <Field
                                label="DESCRIPTION"
                                id={`li_desc_${idx}`}
                                value={String(it.description ?? '')}
                                onChange={(v) => updateLineItem(idx, 'description', v)}
                                placeholder="Widget A"
                            />
                            <Field
                                label="QTY"
                                id={`li_qty_${idx}`}
                                value={String(it.quantity ?? '')}
                                onChange={(v) => updateLineItem(idx, 'quantity', v)}
                                placeholder="1"
                            />
                            <Field
                                label="UNIT PRICE"
                                id={`li_unit_${idx}`}
                                value={String(it.unit_price ?? '')}
                                onChange={(v) => updateLineItem(idx, 'unit_price', v)}
                                placeholder="19.99"
                            />
                            <Field
                                label="TOTAL"
                                id={`li_total_${idx}`}
                                value={String(it.total ?? '')}
                                onChange={(v) => updateLineItem(idx, 'total', v)}
                                placeholder="19.99"
                            />
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeLineItem(idx)}
                                aria-label={`Remove line item ${idx + 1}`}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn"
                        onClick={addLineItem}
                        style={{ marginTop: 8 }}>
                        + Add Line Item
                    </button>

                    {/* Totals */}
                    <div className="row-3" style={{ marginTop: 16, gap: 8 }}>
                        <Field
                            label="SUBTOTAL"
                            id="subtotal"
                            value={invoice.subtotal ?? ''}
                            onChange={(v) => updateField('subtotal', v)}
                            placeholder="49.98"
                        />
                        <Field
                            label="TAX"
                            id="tax"
                            value={invoice.tax ?? ''}
                            onChange={(v) => updateField('tax', v)}
                            placeholder="4.00"
                        />
                        <Field
                            label="TOTAL"
                            id="total"
                            value={invoice.total ?? ''}
                            onChange={(v) => updateField('total', v)}
                            placeholder="53.98"
                        />
                    </div>

                    <small style={{ opacity: 0.75, display: 'block', marginTop: 8 }}>
                        {totalsHint}
                    </small>
                </form>
            </div>
        </section>
    );
}
