import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
    file: File | null;
    progress: number; // 0..100
    onExtract: () => void;
    visible: boolean;
};

export default function Preview({ file, progress, onExtract, visible }: Props) {
    const [dataUrl, setDataUrl] = useState<string>('');

    useEffect(() => {
        if (!file) return setDataUrl('');
        if (file.type.startsWith('image/')) {
            const r = new FileReader();
            r.onload = (e) => setDataUrl(String(e.target?.result || ''));
            r.readAsDataURL(file);
        } else {
            setDataUrl('');
        }
    }, [file]);

    if (!visible) return null;

    const isImage = !!file && file.type.startsWith('image/');
    const isPdf = !!file && file.type === 'application/pdf';

    return (
        <section className="preview">
            <div className="preview-inner">
                {isImage ? (
                    // Using next/image keeps layout stable; size matches your CSS box
                    <Image id="previewImg" src={dataUrl} alt="" width={220} height={300} />
                ) : (
                    <div className="pdf-fallback">{isPdf ? 'PDF' : file?.type || 'FILE'}</div>
                )}

                <div className="progress-wrap" aria-hidden={progress >= 100}>
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>

                {progress >= 100 && (
                    <button className="btn btn-brand" type="button" onClick={onExtract}>
                        Extract Information
                    </button>
                )}
            </div>
        </section>
    );
}
