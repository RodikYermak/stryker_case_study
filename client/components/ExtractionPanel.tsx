import Image from 'next/image';
import { useEffect, useState } from 'react';

type FormState = {
    number: string;
    date: string;
    vendor: string;
    address: string;
    item1: string;
    item1Qty: string;
    item1Price: string;
    item2: string;
    item2Qty: string;
    item2Price: string;
};

const DEFAULTS: FormState = {
    number: '12345',
    date: '06/16/2025',
    vendor: 'Samira Hadid',
    address: '123 Anywhere St., Any City, ST 12345',
    item1: 'Eggshell Camisole Top',
    item1Qty: '1',
    item1Price: '123',
    item2: 'Eggshell Camisole Top',
    item2Qty: '2',
    item2Price: '123',
};

type Props = {
    file: File | null;
    visible: boolean;
};

export default function ExtractionPanel({ file, visible }: Props) {
    const [thumb, setThumb] = useState<string>('');
    const [form, setForm] = useState<FormState>(DEFAULTS);

    useEffect(() => {
        if (!file) return setThumb('');
        if (file.type.startsWith('image/')) {
            const r = new FileReader();
            r.onload = (e) => setThumb(String(e.target?.result || ''));
            r.readAsDataURL(file);
        } else {
            setThumb('');
        }
        setForm(DEFAULTS);
    }, [file]);

    if (!visible) return null;

    const isPdf = !!file && file.type === 'application/pdf';

    return (
        <section className="extraction">
            <div className="extraction-grid">
                <aside className="extract-thumb">
                    {isPdf ? (
                        <div className="pdf-fallback" id="extractThumbPdf">
                            PDF
                        </div>
                    ) : (
                        <Image
                            src={thumb || '/images/placeholder.png'}
                            alt="Uploaded invoice preview"
                            width={260}
                            height={360}
                        />
                    )}
                    <button
                        className="btn btn-brand"
                        type="button"
                        onClick={() => alert('Pretend we saved to Excel ✅')}>
                        Save to Excel
                    </button>
                </aside>

                <form
                    className="extract-form"
                    autoComplete="off"
                    onSubmit={(e) => e.preventDefault()}>
                    {[
                        ['NUMBER', 'number', '12345'],
                        ['DATE', 'date', '06/16/2025'],
                        ['VENDOR', 'vendor', 'Samira Hadid'],
                        ['ADDRESS', 'address', '123 Anywhere St., Any City, ST 12345'],
                    ].map(([label, name, ph]) => (
                        <div className="field" key={name}>
                            <label htmlFor={name}>{label}</label>
                            <input
                                id={name}
                                name={name}
                                type="text"
                                placeholder={String(ph)}
                                // value={(form as any)[name]}
                                value={form.number}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        [name as keyof FormState]: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    ))}

                    {/* Item 1 */}
                    <div className="field">
                        <label htmlFor="item1">ITEM 1</label>
                        <input
                            id="item1"
                            name="item1"
                            type="text"
                            placeholder="Item name"
                            value={form.item1}
                            onChange={(e) => setForm((f) => ({ ...f, item1: e.target.value }))}
                        />
                    </div>
                    <div className="row-2">
                        <div className="field">
                            <label htmlFor="item1Qty">ITEM 1 QUANTITY</label>
                            <input
                                id="item1Qty"
                                name="item1Qty"
                                type="text"
                                placeholder="1"
                                value={form.item1Qty}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, item1Qty: e.target.value }))
                                }
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="item1Price">ITEM 1 PRICE</label>
                            <input
                                id="item1Price"
                                name="item1Price"
                                type="text"
                                placeholder="123"
                                value={form.item1Price}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, item1Price: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="field">
                        <label htmlFor="item2">ITEM 2</label>
                        <input
                            id="item2"
                            name="item2"
                            type="text"
                            placeholder="Item name"
                            value={form.item2}
                            onChange={(e) => setForm((f) => ({ ...f, item2: e.target.value }))}
                        />
                    </div>
                    <div className="row-2">
                        <div className="field">
                            <label htmlFor="item2Qty">ITEM 2 QUANTITY</label>
                            <input
                                id="item2Qty"
                                name="item2Qty"
                                type="text"
                                placeholder="2"
                                value={form.item2Qty}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, item2Qty: e.target.value }))
                                }
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="item2Price">ITEM 2 PRICE</label>
                            <input
                                id="item2Price"
                                name="item2Price"
                                type="text"
                                placeholder="123"
                                value={form.item2Price}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, item2Price: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
