'use client';

import { useActionState } from 'react';
import { addWord } from '@/lib/actions';
import { Plus, Loader2, Sparkles } from 'lucide-react';

export default function AddWordForm() {
  const [state, formAction, isPending] = useActionState(addWord, null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 mb-6">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">İngilizce Kelime</label>
          <input
            name="engWord"
            placeholder="Örn: Serendipity"
            required
            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-lg font-black text-slate-900 outline-none focus:border-slate-950 transition-all shadow-sm placeholder:text-slate-200"
          />
        </div>
        <div className="space-y-2 mb-6">
          <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Türkçe Karşılık (Opsiyonel)</label>
          <input
            name="turWord"
            placeholder="Sistem otomatik bulabilir..."
            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold text-slate-700 outline-none focus:border-slate-950 transition-all shadow-sm placeholder:text-slate-200"
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Örnek Cümleler (Satır başına bir adet - Opsiyonel)</label>
        <textarea
          name="samples"
          rows={3}
          placeholder="Kendi cümlelerinizi girebilirsiniz veya AI'ya bırakabilirsiniz..."
          className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-slate-950 transition-all shadow-sm placeholder:text-slate-200"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Görsel URL (Opsiyonel)</label>
        <input
          name="picture"
          placeholder="https://..."
          className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-slate-950 transition-all shadow-sm placeholder:text-slate-200"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-5 flex items-center justify-center gap-3 relative overflow-hidden bg-slate-950 shadow-2xl"
      >
        {isPending ? <Loader2 className="animate-spin text-white" /> : <Plus size={22} className="text-white" />}
        <span className="text-white font-black">{isPending ? 'Veriler İşleniyor...' : 'Kelimeyi Ekle'}</span>
        {!isPending && <Sparkles size={16} className="absolute right-6 opacity-20 text-white" />}
      </button>

      {state?.error && (
        <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center animate-fade bg-red-50 py-3 rounded-xl border border-red-100">
          {state.error}
        </p>
      )}
    </form>
  );
}
