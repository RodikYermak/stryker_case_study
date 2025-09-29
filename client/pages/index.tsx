// import React from 'react';
// import UserInterface from '@/components/UserInterface';

// const Home: React.FC = () => {
//     return (
//         <div>
//             <UserInterface backendName="flask" />
//         </div>
//     );
// };

// export default Home;
// import Head from 'next/head';
// import { useEffect, useMemo, useState } from 'react';
// import Header from '@/components/Header';
// import ModelPicker from '@/components/ModelPicker';
// import Dropzone from '@/components/Dropzone';
// import Preview from '@/components/Preview';
// import ExtractionPanel from '@/components/ExtractionPanel';
// import FileList from '@/components/FileList';
// import axios from 'axios';

// export default function Home() {
//     const [model, setModel] = useState('ChatGPT 5');
//     const [files, setFiles] = useState<File[]>([]);
//     const [selected, setSelected] = useState<File | null>(null);
//     const [progress, setProgress] = useState(0);
//     const [phase, setPhase] = useState<'idle' | 'uploading' | 'ready' | 'extracted'>('idle');
//     const [users, setUsers] = useState([]);

//     // demo upload simulator — replace with real network flow later
//     useEffect(() => {
//         if (phase !== 'uploading') return;
//         let p = 0;
//         const t = setInterval(() => {
//             p = Math.min(100, p + Math.random() * 18 + 6);
//             setProgress(Math.round(p));
//             if (p >= 100) {
//                 clearInterval(t);
//                 setPhase('ready');
//             }
//         }, 140);
//         return () => clearInterval(t);
//     }, [phase]);

//     // Fetch users
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:4000/api/flask/users`);
//                 setUsers(response.data.reverse());
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };

//         fetchData();
//     }, []);

//     const onFiles = (fl: FileList | File[]) => {
//         const arr = Array.from(fl);
//         setFiles(arr);
//         setSelected(arr[0] || null);
//         setProgress(0);
//         setPhase('uploading');
//     };

//     const showPreview = useMemo(() => phase === 'uploading' || phase === 'ready', [phase]);

//     return (
//         <>
//             <Head>
//                 <title>Stryker</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 {/* your Google Fonts & styles.css are already wired globally via _app or imported in globals */}
//             </Head>

//             <Header />

//             <main className="container main-wrap">
//                 <ModelPicker value={model} onChange={setModel} />
//                 <div>
//                     <Dropzone onFiles={onFiles} />
//                     <Preview
//                         file={selected}
//                         progress={progress}
//                         onExtract={() => setPhase('extracted')}
//                         visible={showPreview}
//                     />
//                     <ExtractionPanel file={selected} visible={phase === 'extracted'} />
//                     {/* <FileList files={files} /> */}
//                     <div>
//                         {users.map((user) => (
//                             <div key={user.name}>{user.name}</div>
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </>
//     );
// }
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import ModelPicker from '@/components/ModelPicker';
import Dropzone from '@/components/Dropzone';
import Preview from '@/components/Preview';
import ExtractionPanel from '@/components/ExtractionPanel';
import axios from 'axios';

type User = { id: number; name: string; email: string };

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

    const [users, setUsers] = useState<User[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // demo upload simulator — replace with real network flow later
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

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get<User[]>(`http://localhost:4000/api/flask/users`);
                setUsers(response.data.reverse());
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Fetch invoices
    const loadInvoices = async () => {
        try {
            setLoadingInvoices(true);
            const res = await axios.get<Invoice[]>(`http://localhost:4000/api/flask/invoices`);
            // assuming backend returns newest first; if not, sort by id desc:
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

                    {/* Users (existing) */}
                    <section style={{ marginTop: 24 }}>
                        <h3>Users</h3>
                        {users.length === 0 ? (
                            <div style={{ opacity: 0.8 }}>No users yet.</div>
                        ) : (
                            <ul>
                                {users.map((u) => (
                                    <li key={u.id}>
                                        {u.name} <span style={{ opacity: 0.7 }}>({u.email})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Invoices table (new) */}
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((inv) => (
                                            <tr key={inv.id}>
                                                <td style={td}>{inv.id}</td>
                                                <td style={td}>{inv.vendor_name}</td>
                                                <td style={td}>{inv.invoice_number}</td>
                                                <td style={td}>{fmtDate(inv.invoice_date)}</td>
                                                <td style={td}>{fmtDate(inv.due_date)}</td>
                                                <td style={td}>
                                                    {/* show count + quick preview of first description */}
                                                    {inv.line_items?.length || 0}{' '}
                                                    {inv.line_items?.[0]?.description
                                                        ? `— ${String(
                                                              inv.line_items[0].description
                                                          )}`
                                                        : ''}
                                                </td>
                                                <td style={td}>{fmtMoney(inv.subtotal)}</td>
                                                <td style={td}>{fmtMoney(inv.tax)}</td>
                                                <td style={td}>{fmtMoney(inv.total)}</td>
                                            </tr>
                                        ))}
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
