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
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import ModelPicker from '@/components/ModelPicker';
import Dropzone from '@/components/Dropzone';
import Preview from '@/components/Preview';
import ExtractionPanel from '@/components/ExtractionPanel';
import FileList from '@/components/FileList';

export default function Home() {
    const [model, setModel] = useState('ChatGPT 5');
    const [files, setFiles] = useState<File[]>([]);
    const [selected, setSelected] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'idle' | 'uploading' | 'ready' | 'extracted'>('idle');

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

    const onFiles = (fl: FileList | File[]) => {
        const arr = Array.from(fl);
        setFiles(arr);
        setSelected(arr[0] || null);
        setProgress(0);
        setPhase('uploading');
    };

    const showPreview = useMemo(() => phase === 'uploading' || phase === 'ready', [phase]);

    return (
        <>
            <Head>
                <title>Stryker</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* your Google Fonts & styles.css are already wired globally via _app or imported in globals */}
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
                    {/* <FileList files={files} /> */}
                </div>
            </main>
        </>
    );
}
