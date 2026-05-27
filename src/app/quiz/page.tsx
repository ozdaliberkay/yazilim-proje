import { getWordsDueForTesting } from '@/lib/actions';
import { Brain, Sparkles } from 'lucide-react';
import QuizCardClient from '@/components/QuizCardClient';

export default async function QuizPage() {
  const words = await getWordsDueForTesting();

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 pt-32">
        <div className="card p-12 text-center max-w-lg shadow-xl bg-white border border-slate-200" style={{ borderRadius: '2.5rem' }}>
          <div className="w-20 h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-200">
            <Brain size={40} />
          </div>
          <h1 className="text-4xl font-black mb-6 text-slate-900 tracking-tighter uppercase italic">Tamamlandı!</h1>
          <p className="text-slate-400 mb-12 font-black uppercase tracking-widest text-[10px] leading-relaxed italic opacity-70">
            Bugün için belirlenen tüm kelime tekrarlarını tamamladınız.
            Yeni kelime ekleyerek kütüphanenizi genişletebilir veya yarınki oturumu bekleyebilirsiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/words" className="btn-primary">Yeni Kelime Ekle</a>
            <form action="/api/generate-ai-words" method="post" className="inline">
              <button type="submit" className="btn-primary">AI Kelimeler Ekle</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[0];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="container flex flex-col items-center">
        <header className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade">
            <Sparkles size={16} className="text-slate-400 animate-pulse" />
            <span className="text-slate-950 font-black uppercase tracking-widest text-[10px] border-b border-slate-950 pb-1">Günlük Oturum</span>
            <Sparkles size={16} className="text-slate-400 animate-pulse" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Sınav</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sınavdaki Kelime Sayısı <span className="text-slate-900 font-black">{words.length} Kelime</span></p>
        </header>

        <QuizCardClient key={currentWord.id} word={currentWord} />

        <footer className="mt-16 text-slate-200 text-[10px] flex gap-8 font-black uppercase tracking-widest">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm"></div> Performans Takibi Aktif</div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-sm"></div> Hafıza Tutarlılığı</div>
        </footer>
      </div>
    </div>
  );
}
