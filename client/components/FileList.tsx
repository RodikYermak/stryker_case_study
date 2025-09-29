type Props = { files: File[] };
export default function FileList({ files }: Props) {
    if (!files.length) return null;
    return (
        <section className="file-list" aria-live="polite">
            <ul>
                {files.map((f) => (
                    <li key={f.name} title={f.name}>
                        {f.name}
                    </li>
                ))}
            </ul>
        </section>
    );
}
