import Image from 'next/image';
import { useEffect, useState } from 'react';

/** Keep in sync with your ExtractionPanel Invoice type (minimal fields here) */
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

type Props = {
    file: File | null;
    progress: number; // 0..100
    visible: boolean;
    /** Called after we hit the extractor endpoint */
    onExtract: (data: Invoice | null, error?: string) => void;
    /** Optional: override API base (defaults to http://localhost:4000) */
    apiBase?: string;
};

export default function Preview({ file, progress, visible, onExtract, apiBase }: Props) {
    const base = apiBase ?? 'http://localhost:4000';

    const [imageUrl, setImageUrl] = useState<string>('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [extractMsg, setExtractMsg] = useState<string | null>(null);

    useEffect(() => {
        setExtractMsg(null);
        if (!file) {
            setImageUrl('');
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
            return;
        }

        if (file.type.startsWith('image/')) {
            const r = new FileReader();
            r.onload = (e) => setImageUrl(String(e.target?.result || ''));
            r.readAsDataURL(file);
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        } else if (file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setImageUrl('');
            return () => URL.revokeObjectURL(url);
        } else {
            setImageUrl('');
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    if (!visible) return null;

    const isImage = !!file && file.type.startsWith('image/');
    const isPdf = !!file && file.type === 'application/pdf';

    const handleExtract = async () => {
        if (!file) return;
        setExtracting(true);
        setExtractMsg(null);
        try {
            const form = new FormData();
            form.append('file', file);

            const res = await fetch(`${base}/api/flask/invoices/extract`, {
                method: 'POST',
                body: form,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({} as any));
                const msg = err?.message || `Extractor HTTP ${res.status}`;
                setExtractMsg(msg);
                onExtract(null, msg);
                return;
            }

            const data = (await res.json()) as Invoice;
            setExtractMsg('Extracted ✅ — review and save.');
            onExtract(data, undefined);
        } catch (e: any) {
            const msg = e?.message || 'Extraction failed';
            setExtractMsg(msg);
            onExtract(null, msg);
        } finally {
            setExtracting(false);
        }
    };

    return (
        <section className="preview">
            <div className="preview-inner">
                {isImage ? (
                    <Image id="previewImg" src={imageUrl} alt="" width={220} height={300} />
                ) : isPdf ? (
                    <iframe
                        src={(pdfUrl ?? '') + '#toolbar=0&navpanes=0&scrollbar=0'}
                        width={220}
                        height={300}
                        style={{ border: '1px solid #ddd', borderRadius: 4 }}
                        title="PDF preview"
                    />
                ) : (
                    <div className="pdf-fallback">{file?.type || 'FILE'}</div>
                )}

                {progress < 100 && (
                    <div className="progress-wrap">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {progress >= 100 && (
                    <button
                        className="btn btn-brand"
                        type="button"
                        onClick={handleExtract}
                        disabled={!file || extracting}>
                        {extracting ? 'Extracting…' : 'Extract Information'}
                    </button>
                )}

                {extractMsg && (
                    <div role="status" style={{ marginTop: 8, opacity: 0.85 }}>
                        {extractMsg}
                    </div>
                )}
            </div>
        </section>
    );
}
