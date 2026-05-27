import { getLibraryWords, deleteWord } from '@/lib/actions';
import { BookOpen, Trash2, Quote, Plus } from 'lucide-react';
import AddWordForm from '@/components/AddWordForm';
import WordCardImage from '@/components/WordCardImage';

export default async function WordsPage() {
  const words = await getLibraryWords();

  const formatSample = (text: string, target: string) => {
    if (!text || !target) return text;

    const targets = target.split(/[,/]/).map(t => t.trim()).filter(t => t.length > 2);
    if (targets.length === 0) targets.push(target.trim());

    const escapedTargets = targets.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escapedTargets})`, 'gi');

    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = targets.some(t => part.toLocaleLowerCase('tr-TR') === t.toLocaleLowerCase('tr-TR'));
      return isMatch
        ? <strong key={i} className="text-slate-950 font-black underline decoration-slate-200 underline-offset-4">{part}</strong>
        : part;
    });
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-xl shadow-slate-100"><BookOpen size={24} /></div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">Kelime Hazinesi</h1>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Kelime havuzunu yönetin ve genişletin</p>
        </header>

        <section className="card p-10 mb-16 relative overflow-hidden bg-slate-950 border-none shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Plus size={200} color="white" />
          </div>
          <div className="relative z-10" >
            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter mb-6">Yeni Kelime Ekle</h2>
            <p className="text-slate-400 mb-10 max-w-2xl text-[10px] font-black uppercase tracking-widest leading-loose italic opacity-60">
              Sisteme yeni bir kelime girişi yapın. Yapay zeka motoru otomatik olarak
              anlamlarını, örnek cümleleri ve görselleri hazırlayacaktır.
            </p>

            <div className="max-w-xl">
              <AddWordForm />
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-8">
            <div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kitaplık</h2>
              <p className="text-slate-900 mt-2 font-black text-2xl tracking-tighter">{words.length} Kayıtlı Kelime</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {words.map((word) => (
              <div key={word.id} className="card group flex flex-col p-2 bg-white hover:border-slate-950 shadow-sm border border-slate-200">
                <div className="p-4 flex flex-col h-full">
                  {word.picture && (
                    <div className="mb-6 rounded-[1.5rem] overflow-hidden aspect-video border border-slate-100 bg-slate-50 relative">
                      <WordCardImage
                        src={word.picture}
                        alt={word.engWord}
                        engWord={word.engWord}
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6 px-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-3xl font-black text-slate-950 capitalize tracking-tighter">{word.engWord}</h3>
                        {word.wordType && (
                          <span className="text-[8px] font-black text-slate-300 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter italic">
                            {word.wordType}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 font-bold text-lg tracking-tight uppercase italic text-[10px]">{word.turWord}</p>
                    </div>
                    <form action={deleteWord}>
                      <input type="hidden" name="wordId" value={word.id} />
                      <button type="submit" className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-600 transition-colors cursor-pointer rounded-xl hover:bg-red-50">
                        <Trash2 size={20} color="black" cursor={"pointer"} />
                      </button>
                    </form>
                  </div>

                  <div className="px-2 mb-8 flex justify-between items-center">
                    <span className="text-[10px] font-black bg-slate-950 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      {word.topic || 'Genel'}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Lvl {word.level || 0}/7</span>
                  </div>

                  <div className="mt-auto space-y-4 px-2 pb-2 font-mono">
                    {word.samples && word.samples.length > 0 ? word.samples.slice(0, 2).map((s: any, i: number) => (
                      <div key={i} className="relative p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <Quote size={12} className="text-slate-200 absolute top-4 right-4" />
                        <p className="text-[10px] text-slate-500 leading-relaxed font-black uppercase tracking-widest mb-1 opacity-40">Bağlam</p>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold tracking-tight">
                          "{formatSample(s.sample || s.text, word.engWord)}"
                        </p>
                        {s.translation && (
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tight leading-relaxed italic opacity-80 pt-1 border-t border-slate-100">
                            → {formatSample(s.translation, word.turWord)}
                          </p>
                        )}
                      </div>
                    )) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center">Örnek bulunamadı</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {words.length === 0 && (
              <div className="col-span-full py-40 text-center card bg-white border-dashed border-2 border-slate-200">
                <div className="max-w-xs mx-auto">
                  <BookOpen size={64} className="mx-auto text-slate-100 mb-6" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Kütüphane Boş</p>
                  <p className="text-slate-200 text-[10px] mt-2 font-black leading-relaxed uppercase tracking-widest italic">Yeni kelime ekleyerek başlayın.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
