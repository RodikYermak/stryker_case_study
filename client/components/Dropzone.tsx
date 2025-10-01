import { useCallback, useRef, useState } from 'react';

export type PickedFile = File;

type Props = {
    onFiles: (files: FileList | File[]) => void;
};

export default function Dropzone({ onFiles }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const openPicker = useCallback(() => inputRef.current?.click(), []);

    const handleFiles = useCallback(
        (files?: FileList | null) => {
            if (files && files.length) onFiles(files);
        },
        [onFiles]
    );

    return (
        <form
            className={`dropzone ${dragOver ? 'is-dragover' : ''}`}
            aria-label="Invoice upload"
            onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== 'BUTTON') openPicker();
            }}
            onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
                handleFiles(e.dataTransfer?.files || undefined);
            }}>
            <input
                ref={inputRef}
                id="fileInput"
                className="file-input"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="dropzone-content">
                <svg
                    className="upload-icon"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                        d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 14v2h14v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2h2z"
                        fill="currentColor"
                    />
                </svg>
                <p className="dropzone-text">
                    <strong>Upload or Drag</strong> your <b>PDF</b> invoice here
                </p>
                <button type="button" className="btn btn-ghost" onClick={openPicker}>
                    Browse files
                </button>
            </div>
        </form>
    );
}
