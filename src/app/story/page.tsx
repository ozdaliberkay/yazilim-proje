'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, RefreshCw, Terminal, Trash2, Calendar } from 'lucide-react';
import { olusturHikaye, getInitialStoryWords, getSavedStories, deleteStory } from '@/lib/actions';

function renderStoryWithHighlights(text: string, wordsList: string[]) {
  if (!wordsList || wordsList.length === 0) return text;

  const cleanWords = wordsList.map(w => w.trim());
  const pattern = new RegExp(`\\b(${cleanWords.join('|')})\\b`, 'gi');

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isMatch = index % 2 === 1;
    if (!isMatch) {
      return part;
    }

    const matchedWordIndex = cleanWords.findIndex(w => w.toLowerCase() === part.toLowerCase());
    if (matchedWordIndex === -1) {
      return part;
    }

    const word = part;
    const isLastWord = matchedWordIndex === cleanWords.length - 1;

    if (word.length === 0) return '';
    if (word.length === 1) {
      return <strong key={index} className="font-extrabold text-slate-900">{word.toUpperCase()}</strong>;
    }

    if (isLastWord) {
      return (
        <span key={index} className="text-slate-950 font-semibold bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded-lg whitespace-nowrap mx-0.5">
          <strong className="font-black text-indigo-600">{word.charAt(0)}</strong>
          {word.slice(1)}
        </span>
      );
    } else {
      return (
        <span key={index} className="text-slate-950 font-semibold bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded-lg whitespace-nowrap mx-0.5">
          <strong className="font-black text-indigo-600">{word.charAt(0)}</strong>
          {word.slice(1, -1)}
          <strong className="font-black text-indigo-600">{word.charAt(word.length - 1)}</strong>
        </span>
      );
    }
  });
}

export default function WordChainPage() {
  const [words, setWords] = useState<string[]>([]);
  const [story, setStory] = useState<{ text: string, trText?: string, image: string, words: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSaved = async () => {
    try {
      const stories = await getSavedStories();
      setSavedStories(stories);
    } catch (e) {
      console.error("Failed to load saved stories:", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const ws = await getInitialStoryWords();
      setWords(ws);
      await loadSaved();
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await olusturHikaye();
      if (res && res.success && res.kelimeler && res.metin && res.resimYolu) {
        setWords(res.kelimeler);
        setStory({
          text: res.metin,
          trText: res.trMetin,
          image: res.resimYolu,
          words: res.kelimeler
        });
        await loadSaved();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await deleteStory(id);
      if (res && res.success) {

        if (story && savedStories.find(s => s.id === id)?.image === story.image) {
          setStory(null);
        }
        await loadSaved();
      }
    } catch (e) {
      console.error(e);
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="container">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">Hikaye Oluştur</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-70">Öğrenilen kelimelerden zincir (Word Chain) mantığıyla hikaye oluşturma</p>
        </header>

        <section className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="card p-10 flex flex-col justify-between shadow-sm bg-white border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Seçilen Kelimeler (Zincir)</h2>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rastgele Seçim</span>
              </div>
              <div className="flex flex-wrap gap-4 mb-12">
                {words.map((w, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl font-black tracking-tight text-slate-900 hover:border-slate-900 transition-all cursor-default shadow-sm text-lg">
                    {w}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full py-6 flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl bg-slate-950"
            >
              {loading ? <RefreshCw className="animate-spin text-white" /> : <Sparkles size={24} className="text-white" />}
              <span className="text-white">{loading ? 'Hikaye Oluşturuluyor...' : 'Yeni Hikaye Oluştur'}</span>
            </button>
          </div>

          <div className="card p-10 relative overflow-hidden min-h-[500px] shadow-sm bg-white border border-slate-200">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10 transition-all duration-1000">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="font-mono text-[10px] text-slate-900 font-black uppercase tracking-widest animate-pulse">Görsel Bekleniyor...</p>
                </div>
              </div>
            ) : null}

            <div className="relative z-0 h-full">
              {story ? (
                <div className="animate-fade">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-2 bg-slate-950 rounded-full animate-pulse shadow-sm"></div>
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Üretilen Hikaye</h3>
                  </div>
                  <p className="text-2xl leading-relaxed text-slate-700 mb-12 font-normal italic tracking-tight">
                    "{renderStoryWithHighlights(story.text, story.words)}"
                  </p>

                  <div className="space-y-6">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100 border-8 border-white group relative aspect-[4/3] bg-slate-50">
                      <img src={story.image} alt="Story Viz" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    <p className="text-[10px] text-slate-300 text-center font-black uppercase tracking-[0.2em] leading-loose opacity-50">AI GENERATED IMAGE / LOCAL PERSISTED</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-8 text-center opacity-20 py-24">
                  <div className="p-10 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                    <Terminal size={56} className="text-slate-400" />
                  </div>
                  <p className="max-w-xs text-[10px] uppercase tracking-[0.3em] font-black leading-loose text-slate-900">
                    Sistem Hazır. <br />Kelime seçimi ve başlatma bekleniyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <hr className="my-16 border-slate-200" />

        <section className="mb-20">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Kayıtlı Hikayeleriniz</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-70 mt-1">Daha önce ürettiğiniz ve kaydedilen hikayeler</p>
            </div>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-mono text-xs font-black">
              Toplam: {savedStories.length}
            </span>
          </header>

          {savedStories.length === 0 ? (
            <div className="card p-16 text-center shadow-sm bg-white border border-slate-200 flex flex-col items-center justify-center gap-6">
              <div className="p-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                <ImageIcon size={40} className="text-slate-300" />
              </div>
              <p className="max-w-xs text-[10px] uppercase tracking-[0.3em] font-black leading-loose text-slate-400">
                Henüz kayıtlı bir hikaye bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {savedStories.map((s) => (
                <div key={s.id} className="card p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {new Date(s.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                        title="Hikayeyi Sil"
                      >
                        {deletingId === s.id ? (
                          <RefreshCw className="animate-spin text-slate-400" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>

                    <div className="rounded-[1.5rem] overflow-hidden shadow-md border-4 border-white mb-6 relative group/img aspect-[4/3] bg-slate-100">
                      <img
                        src={s.image}
                        alt="Story visual"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.words && Array.isArray(s.words) && s.words.map((w: string, idx: number) => {
                        const word = w.toLowerCase();
                        let displayWord = w;
                        if (idx < 4) {
                          displayWord = word.charAt(0).toUpperCase() + word.slice(1, -1) + word.charAt(word.length - 1).toUpperCase();
                        } else {
                          displayWord = word.charAt(0).toUpperCase() + word.slice(1);
                        }
                        return (
                          <span key={idx} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-black tracking-tight text-slate-700">
                            {displayWord}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-lg leading-relaxed text-slate-700 font-normal italic mb-4">
                      "{renderStoryWithHighlights(s.text, s.words)}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
