type Props = {
  value: string;
  onChange: (v: string) => void;
};
const MODELS = ["ChatGPT 5", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "Grok 4"];

export default function ModelPicker({ value, onChange }: Props) {
  return (
    <section className="model-cell">
      <label htmlFor="llmModel" className="sr-only">LLM</label>
      <select
        id="llmModel"
        className="model-select"
        aria-label="LLM model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {MODELS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </section>
  );
}