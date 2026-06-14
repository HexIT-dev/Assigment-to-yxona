import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { cx } from "../../lib/utils";

/** Faylni base64 data-URL ga aylantirish (backend url string sifatida saqlaydi) */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  max?: number;
  label?: string;
}

export function ImageUpload({ value, onChange, multiple = true, max = 8, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const picked = Array.from(files).slice(0, max - value.length);
      const urls = await Promise.all(picked.map(fileToDataUrl));
      onChange(multiple ? [...value, ...urls].slice(0, max) : urls.slice(0, 1));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const canAdd = value.length < (multiple ? max : 1);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-cobalt-700">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {value.map((url, idx) => (
          <div key={idx} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-cream-300">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute right-1 top-1 rounded-full bg-cobalt-900/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cream-400 text-ink-soft transition hover:border-gold-400 hover:text-gold-500"
          >
            {busy ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
            <span className="text-xs font-medium">Surat</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
