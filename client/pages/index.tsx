import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import ModelPicker from '@/components/ModelPicker';
import Dropzone from '@/components/Dropzone';
import Preview, { type Invoice as ExtractedInvoice } from '@/components/Preview';
import ExtractionPanel, { type Invoice as PanelInvoice } from '@/components/ExtractionPanel';
import axios from 'axios';

import InvoicesSection, { type InvoiceRow as Invoice } from '@/components/InvoicesSection';
import { downloadInvoicesExcel } from '@/utils/downloadInvoicesExcel';

export default function Home() {
    const [model, setModel] = useState('ChatGPT 5');
    const [, setFiles] = useState<File[]>([]);
    const [selected, setSelected] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'idle' | 'uploading' | 'ready' | 'extracted'>('idle');

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // extracted invoice handed to the panel
    const [extracted, setExtracted] = useState<PanelInvoice | null>(null);

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
            setInvoices(Array.isArray(res.data) ? res.data : []);
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
        setExtracted(null);
    };

    const showPreview = useMemo(
        () => !!selected && (phase === 'uploading' || phase === 'ready'),
        [phase, selected]
    );

    const fmtDate = (d?: string | null) => (d ? d : '');
    const fmtMoney = (n?: string | null) => (n ?? '') || '';

    // edit helpers
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

            const keys: (keyof Invoice)[] = [
                'vendor_name',
                'invoice_number',
                'invoice_date',
                'due_date',
                'subtotal',
                'tax',
                'total',
            ];

            // filter editDraft to only include allowed keys
            const body = Object.fromEntries(
                keys.filter((k) => editDraft[k] !== undefined).map((k) => [k, editDraft[k]])
            ) as Partial<Invoice>;

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

    const handleDownloadExcel = () => {
        downloadInvoicesExcel(invoices, 'invoices.xlsx');
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
                        visible={showPreview}
                        apiBase="http://localhost:4000"
                        onExtract={(data: ExtractedInvoice | null) => {
                            if (data) setExtracted(data as PanelInvoice);
                            setPhase('extracted');
                        }}
                    />

                    <ExtractionPanel
                        file={selected}
                        visible={phase === 'extracted'}
                        apiBase="http://localhost:4000"
                        initialInvoice={extracted ?? undefined}
                        onSaved={async () => {
                            await loadInvoices();
                            setPhase('idle');
                            setSelected(null);
                            setExtracted(null);
                        }}
                    />

                    <InvoicesSection
                        invoices={invoices}
                        loading={loadingInvoices}
                        onRefresh={loadInvoices}
                        editingId={editingId}
                        editDraft={editDraft}
                        onDraftChange={onDraftChange}
                        startEdit={startEdit}
                        cancelEdit={cancelEdit}
                        saveEdit={saveEdit}
                        deleteInvoice={deleteInvoice}
                        savingRow={savingRow}
                        deletingRow={deletingRow}
                        fmtDate={fmtDate}
                        fmtMoney={fmtMoney}
                        onDownloadExcel={handleDownloadExcel}
                    />
                </div>
            </main>
        </>
    );
}
