// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// type FormState = {
//     number: string;
//     date: string;
//     vendor: string;
//     address: string;
//     item1: string;
//     item1Qty: string;
//     item1Price: string;
//     item2: string;
//     item2Qty: string;
//     item2Price: string;
// };

// const DEFAULTS: FormState = {
//     number: '12345',
//     date: '06/16/2025',
//     vendor: 'Samira Hadid',
//     address: '123 Anywhere St., Any City, ST 12345',
//     item1: 'Eggshell Camisole Top',
//     item1Qty: '1',
//     item1Price: '123',
//     item2: 'Eggshell Camisole Top',
//     item2Qty: '2',
//     item2Price: '123',
// };

// type Props = {
//     file: File | null;
//     visible: boolean;
// };

// export default function ExtractionPanel({ file, visible }: Props) {
//     const [thumb, setThumb] = useState<string>('');
//     const [form, setForm] = useState<FormState>(DEFAULTS);

//     useEffect(() => {
//         if (!file) return setThumb('');
//         if (file.type.startsWith('image/')) {
//             const r = new FileReader();
//             r.onload = (e) => setThumb(String(e.target?.result || ''));
//             r.readAsDataURL(file);
//         } else {
//             setThumb('');
//         }
//         setForm(DEFAULTS);
//     }, [file]);

//     if (!visible) return null;

//     const isPdf = !!file && file.type === 'application/pdf';

//     return (
//         <section className="extraction">
//             <div className="extraction-grid">
//                 <aside className="extract-thumb">
//                     {isPdf ? (
//                         <div className="pdf-fallback" id="extractThumbPdf">
//                             PDF
//                         </div>
//                     ) : (
//                         <Image
//                             src={thumb || '/images/placeholder.png'}
//                             alt="Uploaded invoice preview"
//                             width={260}
//                             height={360}
//                         />
//                     )}
//                     <button
//                         className="btn btn-brand"
//                         type="button"
//                         onClick={() => alert('Pretend we saved to Excel ✅')}>
//                         Save to Excel
//                     </button>
//                 </aside>

//                 <form
//                     className="extract-form"
//                     autoComplete="off"
//                     onSubmit={(e) => e.preventDefault()}>
//                     {[
//                         ['NUMBER', 'number', '12345'],
//                         ['DATE', 'date', '06/16/2025'],
//                         ['VENDOR', 'vendor', 'Samira Hadid'],
//                         ['ADDRESS', 'address', '123 Anywhere St., Any City, ST 12345'],
//                     ].map(([label, name, ph]) => (
//                         <div className="field" key={name}>
//                             <label htmlFor={name}>{label}</label>
//                             <input
//                                 id={name}
//                                 name={name}
//                                 type="text"
//                                 placeholder={String(ph)}
//                                 // value={(form as any)[name]}
//                                 value={form.number}
//                                 onChange={(e) =>
//                                     setForm((f) => ({
//                                         ...f,
//                                         [name as keyof FormState]: e.target.value,
//                                     }))
//                                 }
//                             />
//                         </div>
//                     ))}

//                     {/* Item 1 */}
//                     <div className="field">
//                         <label htmlFor="item1">ITEM 1</label>
//                         <input
//                             id="item1"
//                             name="item1"
//                             type="text"
//                             placeholder="Item name"
//                             value={form.item1}
//                             onChange={(e) => setForm((f) => ({ ...f, item1: e.target.value }))}
//                         />
//                     </div>
//                     <div className="row-2">
//                         <div className="field">
//                             <label htmlFor="item1Qty">ITEM 1 QUANTITY</label>
//                             <input
//                                 id="item1Qty"
//                                 name="item1Qty"
//                                 type="text"
//                                 placeholder="1"
//                                 value={form.item1Qty}
//                                 onChange={(e) =>
//                                     setForm((f) => ({ ...f, item1Qty: e.target.value }))
//                                 }
//                             />
//                         </div>
//                         <div className="field">
//                             <label htmlFor="item1Price">ITEM 1 PRICE</label>
//                             <input
//                                 id="item1Price"
//                                 name="item1Price"
//                                 type="text"
//                                 placeholder="123"
//                                 value={form.item1Price}
//                                 onChange={(e) =>
//                                     setForm((f) => ({ ...f, item1Price: e.target.value }))
//                                 }
//                             />
//                         </div>
//                     </div>

//                     {/* Item 2 */}
//                     <div className="field">
//                         <label htmlFor="item2">ITEM 2</label>
//                         <input
//                             id="item2"
//                             name="item2"
//                             type="text"
//                             placeholder="Item name"
//                             value={form.item2}
//                             onChange={(e) => setForm((f) => ({ ...f, item2: e.target.value }))}
//                         />
//                     </div>
//                     <div className="row-2">
//                         <div className="field">
//                             <label htmlFor="item2Qty">ITEM 2 QUANTITY</label>
//                             <input
//                                 id="item2Qty"
//                                 name="item2Qty"
//                                 type="text"
//                                 placeholder="2"
//                                 value={form.item2Qty}
//                                 onChange={(e) =>
//                                     setForm((f) => ({ ...f, item2Qty: e.target.value }))
//                                 }
//                             />
//                         </div>
//                         <div className="field">
//                             <label htmlFor="item2Price">ITEM 2 PRICE</label>
//                             <input
//                                 id="item2Price"
//                                 name="item2Price"
//                                 type="text"
//                                 placeholder="123"
//                                 value={form.item2Price}
//                                 onChange={(e) =>
//                                     setForm((f) => ({ ...f, item2Price: e.target.value }))
//                                 }
//                             />
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </section>
//     );
// }

// import Image from 'next/image';
// import { useEffect, useMemo, useState } from 'react';

// // ---- Types that match Flask to_dict() ----
// type LineItem = {
//   description: string;
//   quantity: number | string;
//   unit_price: number | string;
//   total: number | string;
// };

// export type Invoice = {
//   id: number | null;
//   vendor_name: string;
//   invoice_number: string;
//   invoice_date: string | null; // ISO "YYYY-MM-DD" or null
//   due_date: string | null;     // ISO "YYYY-MM-DD" or null
//   line_items: LineItem[];
//   subtotal: string | null;     // returned as string in API
//   tax: string | null;
//   total: string | null;
// };

// const EMPTY_INVOICE: Invoice = {
//   id: null,
//   vendor_name: '',
//   invoice_number: '',
//   invoice_date: null,
//   due_date: null,
//   line_items: [
//     { description: '', quantity: '', unit_price: '', total: '' },
//     { description: '', quantity: '', unit_price: '', total: '' },
//   ],
//   subtotal: '',
//   tax: '',
//   total: '',
// };

// type Props = {
//   file: File | null;
//   visible: boolean;
//   // optional: load a specific invoice; if omitted, loads the latest
//   invoiceId?: number;
//   apiBase?: string; // default http://localhost:4000
// };

// export default function ExtractionPanel({ file, visible, invoiceId, apiBase }: Props) {
//   const base = apiBase ?? 'http://localhost:4000';
//   const [thumb, setThumb] = useState<string>('');
//   const [invoice, setInvoice] = useState<Invoice>(EMPTY_INVOICE);

//   // thumbnail logic (unchanged)
//   useEffect(() => {
//     if (!file) return setThumb('');
//     if (file.type.startsWith('image/')) {
//       const r = new FileReader();
//       r.onload = (e) => setThumb(String(e.target?.result || ''));
//       r.readAsDataURL(file);
//     } else {
//       setThumb('');
//     }
//   }, [file]);

//   // fetch invoice: by id or latest
//   useEffect(() => {
//     let canceled = false;

//     const fetchInvoice = async () => {
//       try {
//         if (invoiceId != null) {
//           const res = await fetch(`${base}/api/flask/invoices/${invoiceId}`);
//           const data: Invoice | { message: string } = await res.json();
//           if (!canceled && (data as any).id != null) {
//             setInvoice(normalizeInvoice(data as Invoice));
//           }
//         } else {
//           // latest: list then take first (assuming your list is desc by id)
//           const res = await fetch(`${base}/api/flask/invoices`);
//           const list: Invoice[] = await res.json();
//           const latest = Array.isArray(list) && list.length > 0 ? list[0] : EMPTY_INVOICE;
//           if (!canceled) setInvoice(normalizeInvoice(latest));
//         }
//       } catch (e) {
//         console.error('Failed to load invoice:', e);
//         if (!canceled) setInvoice(EMPTY_INVOICE);
//       }
//     };

//     fetchInvoice();
//     return () => {
//       canceled = true;
//     };
//   }, [base, invoiceId]);

//   const isPdf = !!file && file.type === 'application/pdf';

//   // ---- Helpers for controlled inputs ----
//   const updateField = (key: keyof Invoice, value: any) =>
//     setInvoice((inv) => ({ ...inv, [key]: value }));

//   const updateLineItem = (idx: number, key: keyof LineItem, value: any) =>
//     setInvoice((inv) => {
//       const items = inv.line_items.slice();
//       if (!items[idx]) return inv;
//       items[idx] = { ...items[idx], [key]: value };
//       return { ...inv, line_items: items };
//     });

//   const addLineItem = () =>
//     setInvoice((inv) => ({
//       ...inv,
//       line_items: [...inv.line_items, { description: '', quantity: '', unit_price: '', total: '' }],
//     }));

//   const removeLineItem = (idx: number) =>
//     setInvoice((inv) => ({
//       ...inv,
//       line_items: inv.line_items.filter((_, i) => i !== idx),
//     }));

//   const totalsHint = useMemo(
//     () => `Subtotal: ${invoice.subtotal ?? ''}  |  Tax: ${invoice.tax ?? ''}  |  Total: ${invoice.total ?? ''}`,
//     [invoice.subtotal, invoice.tax, invoice.total]
//   );

//   if (!visible) return null;

//   return (
//     <section className="extraction">
//       <div className="extraction-grid">
//         <aside className="extract-thumb">
//           {isPdf ? (
//             <div className="pdf-fallback" id="extractThumbPdf">PDF</div>
//           ) : (
//             <Image
//               src={thumb || '/images/placeholder.png'}
//               alt="Uploaded invoice preview"
//               width={260}
//               height={360}
//             />
//           )}
//           <button
//             className="btn btn-brand"
//             type="button"
//             onClick={() => alert('Pretend we saved to Excel ✅')}
//           >
//             Save to Excel
//           </button>
//         </aside>

//         <form className="extract-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
//           {/* Top-level invoice fields (match Flask to_dict) */}
//           <Field
//             label="VENDOR NAME"
//             id="vendor_name"
//             value={invoice.vendor_name}
//             onChange={(v) => updateField('vendor_name', v)}
//             placeholder="Acme Corp"
//           />

//           <Field
//             label="INVOICE NUMBER"
//             id="invoice_number"
//             value={invoice.invoice_number}
//             onChange={(v) => updateField('invoice_number', v)}
//             placeholder="INV-1001"
//           />

//           <Field
//             label="INVOICE DATE"
//             id="invoice_date"
//             type="date"
//             value={invoice.invoice_date ?? ''}
//             onChange={(v) => updateField('invoice_date', v)}
//             placeholder="YYYY-MM-DD"
//           />

//           <Field
//             label="DUE DATE"
//             id="due_date"
//             type="date"
//             value={invoice.due_date ?? ''}
//             onChange={(v) => updateField('due_date', v)}
//             placeholder="YYYY-MM-DD"
//           />

//           {/* Line Items */}
//           <h4 style={{ marginTop: 16 }}>Line Items</h4>
//           {invoice.line_items.map((it, idx) => (
//             <div className="row-4" key={idx} style={{ gap: 8, alignItems: 'end' }}>
//               <Field
//                 label="DESCRIPTION"
//                 id={`li_desc_${idx}`}
//                 value={it.description}
//                 onChange={(v) => updateLineItem(idx, 'description', v)}
//                 placeholder="Widget A"
//               />
//               <Field
//                 label="QTY"
//                 id={`li_qty_${idx}`}
//                 value={String(it.quantity ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'quantity', v)}
//                 placeholder="1"
//               />
//               <Field
//                 label="UNIT PRICE"
//                 id={`li_unit_${idx}`}
//                 value={String(it.unit_price ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'unit_price', v)}
//                 placeholder="19.99"
//               />
//               <Field
//                 label="TOTAL"
//                 id={`li_total_${idx}`}
//                 value={String(it.total ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'total', v)}
//                 placeholder="19.99"
//               />
//               <button type="button" className="btn btn-danger" onClick={() => removeLineItem(idx)}>
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button type="button" className="btn" onClick={addLineItem} style={{ marginTop: 8 }}>
//             + Add Line Item
//           </button>

//           {/* Totals */}
//           <div className="row-3" style={{ marginTop: 16, gap: 8 }}>
//             <Field
//               label="SUBTOTAL"
//               id="subtotal"
//               value={invoice.subtotal ?? ''}
//               onChange={(v) => updateField('subtotal', v)}
//               placeholder="49.98"
//             />
//             <Field
//               label="TAX"
//               id="tax"
//               value={invoice.tax ?? ''}
//               onChange={(v) => updateField('tax', v)}
//               placeholder="4.00"
//             />
//             <Field
//               label="TOTAL"
//               id="total"
//               value={invoice.total ?? ''}
//               onChange={(v) => updateField('total', v)}
//               placeholder="53.98"
//             />
//           </div>

//           <small style={{ opacity: 0.75, display: 'block', marginTop: 8 }}>{totalsHint}</small>
//         </form>
//       </div>
//     </section>
//   );
// }

// /** Small controlled input helper */
// function Field(props: {
//   label: string;
//   id: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
//   type?: 'text' | 'date' | 'number';
// }) {
//   const { label, id, value, onChange, placeholder, type = 'text' } = props;
//   return (
//     <div className="field">
//       <label htmlFor={id}>{label}</label>
//       <input
//         id={id}
//         name={id}
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// }

// /** Normalize API payload to our state shape (strings for inputs) */
// function normalizeInvoice(inv: Partial<Invoice> | null | undefined): Invoice {
//   const safe = inv ?? {};
//   const items = Array.isArray(safe.line_items) ? safe.line_items : [];
//   return {
//     id: safe.id ?? null,
//     vendor_name: safe.vendor_name ?? '',
//     invoice_number: safe.invoice_number ?? '',
//     invoice_date: safe.invoice_date ?? null,
//     due_date: safe.due_date ?? null,
//     line_items: items.map((it: any) => ({
//       description: String(it?.description ?? ''),
//       quantity: it?.quantity ?? '',
//       unit_price: it?.unit_price ?? '',
//       total: it?.total ?? '',
//     })),
//     subtotal: safe.subtotal ?? '',
//     tax: safe.tax ?? '',
//     total: safe.total ?? '',
//   };
// }

// ExtractionPanel.tsx
// import Image from 'next/image';
// import { useEffect, useMemo, useState } from 'react';

// /* ---------- Types that mirror Flask to_dict() ---------- */
// type LineItem = {
//     description: string;
//     quantity: number | string;
//     unit_price: number | string;
//     total: number | string;
// };

// export type Invoice = {
//     id: number | null;
//     vendor_name: string;
//     invoice_number: string;
//     invoice_date: string | null; // ISO YYYY-MM-DD or null
//     due_date: string | null; // ISO YYYY-MM-DD or null
//     line_items: LineItem[];
//     subtotal: string | null; // returned as string by API
//     tax: string | null;
//     total: string | null;
// };

// const EMPTY_INVOICE: Invoice = {
//     id: null,
//     vendor_name: '',
//     invoice_number: '',
//     invoice_date: null,
//     due_date: null,
//     line_items: [
//         { description: '', quantity: '', unit_price: '', total: '' },
//         { description: '', quantity: '', unit_price: '', total: '' },
//     ],
//     subtotal: '',
//     tax: '',
//     total: '',
// };

// type Props = {
//     file: File | null;
//     visible: boolean;
//     /** Optional: fetch a specific invoice instead of the latest */
//     invoiceId?: number;
//     /** Optional: override API base (default http://localhost:4000) */
//     apiBase?: string;
// };

// /* ---------- Utilities ---------- */
// function normalizeInvoice(inv: Partial<Invoice> | null | undefined): Invoice {
//     const safe = inv ?? {};
//     const items = Array.isArray(safe.line_items) ? safe.line_items : [];
//     return {
//         id: safe.id ?? null,
//         vendor_name: safe.vendor_name ?? '',
//         invoice_number: safe.invoice_number ?? '',
//         invoice_date: safe.invoice_date ?? null,
//         due_date: safe.due_date ?? null,
//         line_items: items.map((it: any) => ({
//             description: String(it?.description ?? ''),
//             quantity: it?.quantity ?? '',
//             unit_price: it?.unit_price ?? '',
//             total: it?.total ?? '',
//         })),
//         subtotal: safe.subtotal ?? '',
//         tax: safe.tax ?? '',
//         total: safe.total ?? '',
//     };
// }

// function toApiPayload(invoice: Invoice) {
//     // normalize dates: keep '' as null
//     const normDate = (s: string | null) => (s && s.trim() !== '' ? s : null);

//     // coerce numeric-like fields safely
//     const num = (v: any) => {
//         if (v === '' || v === null || v === undefined) return null;
//         const n = Number(v);
//         return Number.isFinite(n) ? n : null;
//         // server converts to Decimal via _to_decimal
//     };

//     return {
//         vendor_name: invoice.vendor_name?.trim() || '',
//         invoice_number: invoice.invoice_number?.trim() || '',
//         invoice_date: normDate(invoice.invoice_date ?? null),
//         due_date: normDate(invoice.due_date ?? null),
//         line_items: (invoice.line_items || []).map((it) => ({
//             description: (it.description ?? '').toString(),
//             quantity: num(it.quantity),
//             unit_price: num(it.unit_price),
//             total: num(it.total),
//         })),
//         subtotal: num(invoice.subtotal),
//         tax: num(invoice.tax),
//         total: num(invoice.total),
//     };
// }

// /** Small controlled input helper */
// function Field(props: {
//     label: string;
//     id: string;
//     value: string;
//     onChange: (v: string) => void;
//     placeholder?: string;
//     type?: 'text' | 'date' | 'number';
// }) {
//     const { label, id, value, onChange, placeholder, type = 'text' } = props;
//     return (
//         <div className="field">
//             <label htmlFor={id}>{label}</label>
//             <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//             />
//         </div>
//     );
// }

// /* ---------- Component ---------- */
// export default function ExtractionPanel({ file, visible, invoiceId, apiBase }: Props) {
//     const base = apiBase ?? 'http://localhost:4000';
//     const [thumb, setThumb] = useState<string>('');
//     const [invoice, setInvoice] = useState<Invoice>(EMPTY_INVOICE);
//     const [saving, setSaving] = useState(false);
//     const [saveMsg, setSaveMsg] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     // Preview logic
//     useEffect(() => {
//         if (!file) {
//             setThumb('');
//             return;
//         }
//         if (file.type.startsWith('image/')) {
//             const r = new FileReader();
//             r.onload = (e) => setThumb(String(e.target?.result || ''));
//             r.readAsDataURL(file);
//         } else {
//             setThumb('');
//         }
//     }, [file]);

//     // Fetch invoice: by id or latest
//     useEffect(() => {
//         let canceled = false;
//         const fetchInvoice = async () => {
//             setLoading(true);
//             setSaveMsg(null);
//             try {
//                 if (invoiceId != null) {
//                     const res = await fetch(`${base}/api/flask/invoices/${invoiceId}`);
//                     const data = await res.json();
//                     if (!canceled && data && typeof data === 'object' && 'id' in data) {
//                         setInvoice(normalizeInvoice(data));
//                     }
//                 } else {
//                     const res = await fetch(`${base}/api/flask/invoices`);
//                     const list: any[] = await res.json();
//                     const latest = Array.isArray(list) && list.length > 0 ? list[0] : EMPTY_INVOICE;
//                     if (!canceled) setInvoice(normalizeInvoice(latest));
//                 }
//             } catch (e) {
//                 console.error('Failed to load invoice:', e);
//                 if (!canceled) setInvoice(EMPTY_INVOICE);
//             } finally {
//                 if (!canceled) setLoading(false);
//             }
//         };
//         fetchInvoice();
//         return () => {
//             canceled = true;
//         };
//     }, [base, invoiceId]);

//     const isPdf = !!file && file.type === 'application/pdf';

//     // Controlled input helpers
//     const updateField = (key: keyof Invoice, value: any) =>
//         setInvoice((inv) => ({ ...inv, [key]: value }));

//     const updateLineItem = (idx: number, key: keyof LineItem, value: any) =>
//         setInvoice((inv) => {
//             const items = inv.line_items.slice();
//             if (!items[idx]) return inv;
//             items[idx] = { ...items[idx], [key]: value };
//             return { ...inv, line_items: items };
//         });

//     const addLineItem = () =>
//         setInvoice((inv) => ({
//             ...inv,
//             line_items: [
//                 ...inv.line_items,
//                 { description: '', quantity: '', unit_price: '', total: '' },
//             ],
//         }));

//     const removeLineItem = (idx: number) =>
//         setInvoice((inv) => ({
//             ...inv,
//             line_items: inv.line_items.filter((_, i) => i !== idx),
//         }));

//     // Basic totals hint
//     const totalsHint = useMemo(
//         () =>
//             `Subtotal: ${invoice.subtotal ?? ''}  |  Tax: ${invoice.tax ?? ''}  |  Total: ${
//                 invoice.total ?? ''
//             }`,
//         [invoice.subtotal, invoice.tax, invoice.total]
//     );

//     // Save/Update to DB
//     const saveInvoice = async () => {
//         setSaving(true);
//         setSaveMsg(null);
//         try {
//             const payload = toApiPayload(invoice);

//             if (!payload.vendor_name || !payload.invoice_number) {
//                 setSaveMsg('vendor_name and invoice_number are required.');
//                 setSaving(false);
//                 return;
//             }

//             const isUpdate = invoice.id != null;
//             const url = isUpdate
//                 ? `${base}/api/flask/invoices/${invoice.id}`
//                 : `${base}/api/flask/invoices`;
//             const method = isUpdate ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) {
//                 const err = await res.json().catch(() => ({} as any));
//                 throw new Error(err?.error || err?.message || `HTTP ${res.status}`);
//             }

//             const saved = await res.json();
//             if (saved && typeof saved === 'object') {
//                 setInvoice((prev) => normalizeInvoice({ ...prev, ...saved }));
//             }
//             setSaveMsg(isUpdate ? 'Invoice updated ✅' : 'Invoice saved ✅');
//         } catch (e: any) {
//             console.error('Save failed:', e);
//             setSaveMsg(`Save failed: ${e.message || e.toString()}`);
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (!visible) return null;

//     return (
//         <section className="extraction">
//             <div className="extraction-grid">
//                 <aside className="extract-thumb">
//                     {isPdf ? (
//                         <div className="pdf-fallback" id="extractThumbPdf">
//                             PDF
//                         </div>
//                     ) : (
//                         <Image
//                             src={thumb || '/images/placeholder.png'}
//                             alt="Uploaded invoice preview"
//                             width={260}
//                             height={360}
//                         />
//                     )}
//                     <button
//                         className="btn btn-brand"
//                         type="button"
//                         disabled={saving}
//                         onClick={saveInvoice}
//                         title="Save invoice to DB">
//                         {saving ? 'Saving…' : 'Save to DB'}
//                     </button>
//                     {saveMsg && (
//                         <div role="status" style={{ marginTop: 8, opacity: 0.8 }}>
//                             {saveMsg}
//                         </div>
//                     )}
//                 </aside>

//                 <form
//                     className="extract-form"
//                     autoComplete="off"
//                     onSubmit={(e) => e.preventDefault()}>
//                     {loading && (
//                         <div className="field">
//                             <em>Loading invoice…</em>
//                         </div>
//                     )}

//                     {/* Top-level invoice fields */}
//                     <Field
//                         label="VENDOR NAME"
//                         id="vendor_name"
//                         value={invoice.vendor_name}
//                         onChange={(v) => updateField('vendor_name', v)}
//                         placeholder="Acme Corp"
//                     />

//                     <Field
//                         label="INVOICE NUMBER"
//                         id="invoice_number"
//                         value={invoice.invoice_number}
//                         onChange={(v) => updateField('invoice_number', v)}
//                         placeholder="INV-1001"
//                     />

//                     <Field
//                         label="INVOICE DATE"
//                         id="invoice_date"
//                         type="date"
//                         value={invoice.invoice_date ?? ''}
//                         onChange={(v) => updateField('invoice_date', v)}
//                         placeholder="YYYY-MM-DD"
//                     />

//                     <Field
//                         label="DUE DATE"
//                         id="due_date"
//                         type="date"
//                         value={invoice.due_date ?? ''}
//                         onChange={(v) => updateField('due_date', v)}
//                         placeholder="YYYY-MM-DD"
//                     />

//                     {/* Line Items */}
//                     <h4 style={{ marginTop: 16 }}>Line Items</h4>
//                     {invoice.line_items.map((it, idx) => (
//                         <div className="row-4" key={idx} style={{ gap: 8, alignItems: 'end' }}>
//                             <Field
//                                 label="DESCRIPTION"
//                                 id={`li_desc_${idx}`}
//                                 value={String(it.description ?? '')}
//                                 onChange={(v) => updateLineItem(idx, 'description', v)}
//                                 placeholder="Widget A"
//                             />
//                             <Field
//                                 label="QTY"
//                                 id={`li_qty_${idx}`}
//                                 value={String(it.quantity ?? '')}
//                                 onChange={(v) => updateLineItem(idx, 'quantity', v)}
//                                 placeholder="1"
//                             />
//                             <Field
//                                 label="UNIT PRICE"
//                                 id={`li_unit_${idx}`}
//                                 value={String(it.unit_price ?? '')}
//                                 onChange={(v) => updateLineItem(idx, 'unit_price', v)}
//                                 placeholder="19.99"
//                             />
//                             <Field
//                                 label="TOTAL"
//                                 id={`li_total_${idx}`}
//                                 value={String(it.total ?? '')}
//                                 onChange={(v) => updateLineItem(idx, 'total', v)}
//                                 placeholder="19.99"
//                             />
//                             <button
//                                 type="button"
//                                 className="btn btn-danger"
//                                 onClick={() => removeLineItem(idx)}
//                                 aria-label={`Remove line item ${idx + 1}`}>
//                                 Remove
//                             </button>
//                         </div>
//                     ))}
//                     <button
//                         type="button"
//                         className="btn"
//                         onClick={addLineItem}
//                         style={{ marginTop: 8 }}>
//                         + Add Line Item
//                     </button>

//                     {/* Totals */}
//                     <div className="row-3" style={{ marginTop: 16, gap: 8 }}>
//                         <Field
//                             label="SUBTOTAL"
//                             id="subtotal"
//                             value={invoice.subtotal ?? ''}
//                             onChange={(v) => updateField('subtotal', v)}
//                             placeholder="49.98"
//                         />
//                         <Field
//                             label="TAX"
//                             id="tax"
//                             value={invoice.tax ?? ''}
//                             onChange={(v) => updateField('tax', v)}
//                             placeholder="4.00"
//                         />
//                         <Field
//                             label="TOTAL"
//                             id="total"
//                             value={invoice.total ?? ''}
//                             onChange={(v) => updateField('total', v)}
//                             placeholder="53.98"
//                         />
//                     </div>

//                     <small style={{ opacity: 0.75, display: 'block', marginTop: 8 }}>
//                         {totalsHint}
//                     </small>
//                 </form>
//             </div>
//         </section>
//     );
// }

// components/ExtractionPanel.tsx
// import Image from 'next/image';
// import { useEffect, useMemo, useState } from 'react';

// /* ---------- Types that mirror Flask to_dict() ---------- */
// type LineItem = {
//   description: string;
//   quantity: number | string;
//   unit_price: number | string;
//   total: number | string;
// };

// export type Invoice = {
//   id: number | null;             // server will return this after POST
//   vendor_name: string;
//   invoice_number: string;
//   invoice_date: string | null;   // ISO YYYY-MM-DD or null
//   due_date: string | null;       // ISO YYYY-MM-DD or null
//   line_items: LineItem[];
//   subtotal: string | null;       // returned as string by API
//   tax: string | null;
//   total: string | null;
// };

// const EMPTY_INVOICE: Invoice = {
//   id: null,
//   vendor_name: '',
//   invoice_number: '',
//   invoice_date: null,
//   due_date: null,
//   line_items: [
//     { description: '', quantity: '', unit_price: '', total: '' },
//     { description: '', quantity: '', unit_price: '', total: '' },
//   ],
//   subtotal: '',
//   tax: '',
//   total: '',
// };

// type Props = {
//   file: File | null;
//   visible: boolean;
//   /** Optional: override API base (default http://localhost:4000) */
//   apiBase?: string;
// };

// /* ---------- Utilities ---------- */
// function normalizeInvoice(inv: Partial<Invoice> | null | undefined): Invoice {
//   const safe = inv ?? {};
//   const items = Array.isArray(safe.line_items) ? safe.line_items : [];
//   return {
//     id: safe.id ?? null,
//     vendor_name: safe.vendor_name ?? '',
//     invoice_number: safe.invoice_number ?? '',
//     invoice_date: safe.invoice_date ?? null,
//     due_date: safe.due_date ?? null,
//     line_items: items.map((it: any) => ({
//       description: String(it?.description ?? ''),
//       quantity: it?.quantity ?? '',
//       unit_price: it?.unit_price ?? '',
//       total: it?.total ?? '',
//     })),
//     subtotal: safe.subtotal ?? '',
//     tax: safe.tax ?? '',
//     total: safe.total ?? '',
//   };
// }

// function toApiPayload(invoice: Invoice) {
//   const normDate = (s: string | null) => (s && s.trim() !== '' ? s : null);
//   const num = (v: any) => {
//     if (v === '' || v === null || v === undefined) return null;
//     const n = Number(v);
//     return Number.isFinite(n) ? n : null;
//   };

//   return {
//     vendor_name: invoice.vendor_name?.trim() || '',
//     invoice_number: invoice.invoice_number?.trim() || '',
//     invoice_date: normDate(invoice.invoice_date ?? null),
//     due_date: normDate(invoice.due_date ?? null),
//     line_items: (invoice.line_items || []).map((it) => ({
//       description: (it.description ?? '').toString(),
//       quantity: num(it.quantity),
//       unit_price: num(it.unit_price),
//       total: num(it.total),
//     })),
//     subtotal: num(invoice.subtotal),
//     tax: num(invoice.tax),
//     total: num(invoice.total),
//   };
// }

// /** Small controlled input helper */
// function Field(props: {
//   label: string;
//   id: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
//   type?: 'text' | 'date' | 'number';
// }) {
//   const { label, id, value, onChange, placeholder, type = 'text' } = props;
//   return (
//     <div className="field">
//       <label htmlFor={id}>{label}</label>
//       <input
//         id={id}
//         name={id}
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// }

// /* ---------- Component ---------- */
// export default function ExtractionPanel({ file, visible, apiBase }: Props) {
//   const base = apiBase ?? 'http://localhost:4000';
//   const [thumb, setThumb] = useState<string>('');
//   const [invoice, setInvoice] = useState<Invoice>(EMPTY_INVOICE);
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState<string | null>(null);

//   // Preview logic
//   useEffect(() => {
//     if (!file) {
//       setThumb('');
//       return;
//     }
//     if (file.type.startsWith('image/')) {
//       const r = new FileReader();
//       r.onload = (e) => setThumb(String(e.target?.result || ''));
//       r.readAsDataURL(file);
//     } else {
//       setThumb('');
//     }
//   }, [file]);

//   const isPdf = !!file && file.type === 'application/pdf';

//   // Controlled input helpers
//   const updateField = (key: keyof Invoice, value: any) =>
//     setInvoice((inv) => ({ ...inv, [key]: value }));

//   const updateLineItem = (idx: number, key: keyof LineItem, value: any) =>
//     setInvoice((inv) => {
//       const items = inv.line_items.slice();
//       if (!items[idx]) return inv;
//       items[idx] = { ...items[idx], [key]: value };
//       return { ...inv, line_items: items };
//     });

//   const addLineItem = () =>
//     setInvoice((inv) => ({
//       ...inv,
//       line_items: [...inv.line_items, { description: '', quantity: '', unit_price: '', total: '' }],
//     }));

//   const removeLineItem = (idx: number) =>
//     setInvoice((inv) => ({
//       ...inv,
//       line_items: inv.line_items.filter((_, i) => i !== idx),
//     }));

//   // Basic totals hint
//   const totalsHint = useMemo(
//     () => `Subtotal: ${invoice.subtotal ?? ''}  |  Tax: ${invoice.tax ?? ''}  |  Total: ${invoice.total ?? ''}`,
//     [invoice.subtotal, invoice.tax, invoice.total]
//   );

//   // Save: ALWAYS POST (create new)
//   const saveInvoice = async () => {
//     setSaving(true);
//     setSaveMsg(null);
//     try {
//       const payload = toApiPayload(invoice);

//       if (!payload.vendor_name || !payload.invoice_number) {
//         setSaveMsg('vendor_name and invoice_number are required.');
//         setSaving(false);
//         return;
//       }

//       const res = await fetch(`${base}/api/flask/invoices`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({} as any));
//         throw new Error(err?.error || err?.message || `HTTP ${res.status}`);
//       }

//       const saved = await res.json();
//       // reflect server response (including new id)
//       setInvoice((prev) => normalizeInvoice({ ...prev, ...saved }));
//       setSaveMsg('Invoice saved ✅');
//     } catch (e: any) {
//       console.error('Save failed:', e);
//       setSaveMsg(`Save failed: ${e.message || e.toString()}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!visible) return null;

//   return (
//     <section className="extraction">
//       <div className="extraction-grid">
//         <aside className="extract-thumb">
//           {isPdf ? (
//             <div className="pdf-fallback" id="extractThumbPdf">PDF</div>
//           ) : (
//             <Image
//               src={thumb || '/images/placeholder.png'}
//               alt="Uploaded invoice preview"
//               width={260}
//               height={360}
//             />
//           )}
//           <button
//             className="btn btn-brand"
//             type="button"
//             disabled={saving}
//             onClick={saveInvoice}
//             title="Save invoice to DB"
//           >
//             {saving ? 'Saving…' : 'Save to DB'}
//           </button>
//           {saveMsg && (
//             <div role="status" style={{ marginTop: 8, opacity: 0.8 }}>
//               {saveMsg}
//             </div>
//           )}
//         </aside>

//         <form className="extract-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
//           {/* Top-level invoice fields */}
//           <Field
//             label="VENDOR NAME"
//             id="vendor_name"
//             value={invoice.vendor_name}
//             onChange={(v) => updateField('vendor_name', v)}
//             placeholder="Acme Corp"
//           />

//           <Field
//             label="INVOICE NUMBER"
//             id="invoice_number"
//             value={invoice.invoice_number}
//             onChange={(v) => updateField('invoice_number', v)}
//             placeholder="INV-1001"
//           />

//           <Field
//             label="INVOICE DATE"
//             id="invoice_date"
//             type="date"
//             value={invoice.invoice_date ?? ''}
//             onChange={(v) => updateField('invoice_date', v)}
//             placeholder="YYYY-MM-DD"
//           />

//           <Field
//             label="DUE DATE"
//             id="due_date"
//             type="date"
//             value={invoice.due_date ?? ''}
//             onChange={(v) => updateField('due_date', v)}
//             placeholder="YYYY-MM-DD"
//           />

//           {/* Line Items */}
//           <h4 style={{ marginTop: 16 }}>Line Items</h4>
//           {invoice.line_items.map((it, idx) => (
//             <div className="row-4" key={idx} style={{ gap: 8, alignItems: 'end' }}>
//               <Field
//                 label="DESCRIPTION"
//                 id={`li_desc_${idx}`}
//                 value={String(it.description ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'description', v)}
//                 placeholder="Widget A"
//               />
//               <Field
//                 label="QTY"
//                 id={`li_qty_${idx}`}
//                 value={String(it.quantity ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'quantity', v)}
//                 placeholder="1"
//               />
//               <Field
//                 label="UNIT PRICE"
//                 id={`li_unit_${idx}`}
//                 value={String(it.unit_price ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'unit_price', v)}
//                 placeholder="19.99"
//               />
//               <Field
//                 label="TOTAL"
//                 id={`li_total_${idx}`}
//                 value={String(it.total ?? '')}
//                 onChange={(v) => updateLineItem(idx, 'total', v)}
//                 placeholder="19.99"
//               />
//               <button
//                 type="button"
//                 className="btn btn-danger"
//                 onClick={() => removeLineItem(idx)}
//                 aria-label={`Remove line item ${idx + 1}`}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button type="button" className="btn" onClick={addLineItem} style={{ marginTop: 8 }}>
//             + Add Line Item
//           </button>

//           {/* Totals */}
//           <div className="row-3" style={{ marginTop: 16, gap: 8 }}>
//             <Field
//               label="SUBTOTAL"
//               id="subtotal"
//               value={invoice.subtotal ?? ''}
//               onChange={(v) => updateField('subtotal', v)}
//               placeholder="49.98"
//             />
//             <Field
//               label="TAX"
//               id="tax"
//               value={invoice.tax ?? ''}
//               onChange={(v) => updateField('tax', v)}
//               placeholder="4.00"
//             />
//             <Field
//               label="TOTAL"
//               id="total"
//               value={invoice.total ?? ''}
//               onChange={(v) => updateField('total', v)}
//               placeholder="53.98"
//             />
//           </div>

//           <small style={{ opacity: 0.75, display: 'block', marginTop: 8 }}>{totalsHint}</small>
//         </form>
//       </div>
//     </section>
//   );
// }
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

export default function ExtractionPanel({ file, visible, apiBase }: Props) {
    const base = apiBase ?? 'http://localhost:4000';
    const [thumb, setThumb] = useState<string>('');
    const [invoice, setInvoice] = useState<Invoice>(EMPTY_INVOICE);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [extractMsg, setExtractMsg] = useState<string | null>(null);

    // Preview logic
    useEffect(() => {
        if (!file) {
            setThumb('');
            setInvoice(EMPTY_INVOICE);
            return;
        }
        if (file.type.startsWith('image/')) {
            const r = new FileReader();
            r.onload = (e) => setThumb(String(e.target?.result || ''));
            r.readAsDataURL(file);
        } else {
            setThumb('');
        }
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

    /** ---- NEW: call backend extractor with the uploaded file ---- */
    const extractFromFile = async () => {
        if (!file) {
            setExtractMsg('No file selected.');
            return;
        }
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
                throw new Error(err?.message || `Extractor HTTP ${res.status}`);
            }

            const data = await res.json();
            setInvoice(normalizeInvoice(data));
            setExtractMsg('Extracted ✅ — review fields, then Save to DB.');
        } catch (e: any) {
            console.error('Extract failed:', e);
            setExtractMsg(`Extract failed: ${e.message || e.toString()}`);
        } finally {
            setExtracting(false);
        }
    };

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

                    {/* NEW: Extract with AI */}
                    <button
                        className="btn"
                        type="button"
                        disabled={!file || extracting}
                        onClick={extractFromFile}
                        title="Extract fields from uploaded file"
                        style={{ marginBottom: 8 }}>
                        {extracting ? 'Extracting…' : 'Extract with AI'}
                    </button>
                    {extractMsg && (
                        <div role="status" style={{ marginBottom: 8, opacity: 0.8 }}>
                            {extractMsg}
                        </div>
                    )}

                    {/* Save to DB */}
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
