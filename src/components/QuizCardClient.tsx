'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, HelpCircle, XCircle, Volume2, Info, AlertCircle } from 'lucide-react';
import { submitQuizAnswer } from '@/lib/actions';
import WordCardImage from './WordCardImage';

export default function QuizCardClient({ word }: { word: any }) {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const handleAnswer = async (grade: number) => {
    setLoading(true);
    await submitQuizAnswer(word.id, grade);
    router.refresh();
  };

  const playAudio = () => {
    if (audioRef.current) audioRef.current.play();
  };

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
    <div className="w-full max-w-2xl animate-fade">
      <div className="card p-10 bg-white border border-slate-200 shadow-3xl relative overflow-hidden" style={{ borderRadius: '3rem' }}>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
          <HelpCircle size={120} className="text-slate-900" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 bg-slate-950 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
              KAVRAM {word.topic ? `/ ${word.topic.toUpperCase()}` : ''}
            </span>
            {word.wordType && (
              <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-200">
                {word.wordType === 'noun' ? 'İSİM' : word.wordType === 'verb' ? 'FİİL' : word.wordType === 'adjective' ? 'SIFAT' : word.wordType.toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-7xl font-black text-slate-950 mb-6 tracking-tighter uppercase italic">{word.engWord}</h2>

          <div className="flex items-center gap-4 mb-14">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aşama: {word.level || 0}/6</span>
            </div>
            {word.audio && (
              <button onClick={playAudio} className="p-3 bg-slate-50 text-slate-900 rounded-full hover:bg-slate-950 hover:text-white transition-all shadow-sm border border-slate-100 group">
                <Volume2 size={20} className="group-active:scale-125 transition" />
                <audio ref={audioRef} src={word.audio} />
              </button>
            )}
          </div>

          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="group flex items-center justify-center gap-5 w-full max-w-sm py-6 rounded-[2rem] bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-3xl font-black text-sm tracking-[0.2em] uppercase">
              <BookOpen size={22} className="text-white" /> Anlamını Gör
            </button>
          ) : (
            <div className="w-full animate-fade space-y-12">
              <div className="grid md:grid-cols-2 gap-10 items-center border-t border-slate-50 pt-12">
                <div className="text-left space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-5xl font-black text-slate-900 capitalize tracking-tighter">{word.turWord}</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-2"><Info size={12} /> Anlamı bulundu.</p>
                  </div>

                  {word.samples && word.samples.length > 0 && (
                    <div className="space-y-6 pt-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Bağlamsal Örnekler</h4>
                      <div className="space-y-6">
                        {word.samples.map((s: any, i: number) => (
                          <div key={i} className="space-y-2 pl-4 border-l-2 border-slate-100">
                            <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
                              "{formatSample(s.sample || s.text, word.engWord)}"
                            </p>
                            {s.translation && (
                              <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">
                                → {formatSample(s.translation, word.turWord)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {word.picture ? (
                    <div className="rounded-[2.5rem] overflow-hidden border-8 border-white shadow-3xl shadow-slate-200 bg-slate-50 relative group">
                      <WordCardImage src={word.picture} alt={word.engWord} engWord={word.engWord} />
                      <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-slate-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-slate-100"><HelpCircle size={40} className="text-slate-100" /></div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button disabled={loading} onClick={() => handleAnswer(0)} className="flex flex-col items-center gap-2 px-6 py-5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all rounded-3xl group shadow-sm">
                    <XCircle size={24} className="text-slate-200 group-hover:text-red-400 transition" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Hiç Bilmiyorum</span>
                  </button>
                  <button disabled={loading} onClick={() => handleAnswer(1)} className="flex flex-col items-center gap-2 px-6 py-5 bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all rounded-3xl group shadow-sm">
                    <AlertCircle size={24} className="text-slate-200 group-hover:text-orange-400 transition" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Emin Değilim</span>
                  </button>
                  <button disabled={loading} onClick={() => handleAnswer(2)} className="flex flex-col items-center gap-2 px-6 py-5 bg-slate-950 text-white hover:bg-slate-900 transition-all rounded-3xl shadow-2xl group">
                    <CheckCircle size={24} className="text-emerald-400 group-hover:scale-110 transition" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Tam Biliyorum</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
