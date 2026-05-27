import { Settings, Save } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/actions';

export default async function SettingsPage() {
  const settings = await getSettings();

  const defaultLimit = (settings.maxWordsPerTest ?? 10).toString();

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 relative">
      <div className="container flex flex-col items-center">
        <div className="card max-w-xl w-full p-12 text-center shadow-xl border border-slate-200 bg-white" style={{ borderRadius: '2.5rem' }}>
          <header className="mb-12 text-center">
            <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Settings size={30} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Sistem Ayarları</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              Sözlük Sistemi
            </p>
          </header>
          <form className="space-y-10" action={updateSettings}>
            <div className="space-y-4 text-left">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">
                Kelime Limiti (Günlük Yeni & Test Maksimum)
              </label>
              <div className="relative">
                <input
                  key={settings.newWordsPerDay}
                  name="wordsLimit"
                  type="number"
                  defaultValue={defaultLimit}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 text-3xl font-black text-slate-800 outline-none focus:border-slate-950 transition-all shadow-inner"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black tracking-tighter uppercase">
                  ADET
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic px-1 mt-5">
                Öğrenme havuzuna her gün eklenecek ve testlerde gösterilecek maksimum kelime sayısını belirleyin.
              </p>
            </div>
            <div className="pt-6">
              <button type="submit" className="btn-primary w-full py-6 flex items-center justify-center gap-3 bg-slate-950">
                <Save size={22} className="text-white" /> <span className="text-white">Ayarları Güncelle</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
