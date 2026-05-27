'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/actions';
import {
   BarChart3,
   TrendingUp,
   CheckCircle,
   Clock,
   Printer,
   BookOpen,
   Search,
   ChevronRight,
   Target,
   Layers,
   Sparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';

const AnalysisCharts = dynamic(() => import('@/components/AnalysisCharts'), {
   ssr: false,
   loading: () => <div className="h-[420px] bg-white border border-slate-200 rounded-3xl animate-pulse mb-16" />
});

export default function AnalysisPage() {
   const [stats, setStats] = useState<any>(null);
   const [filter, setFilter] = useState('');

   useEffect(() => {
      getStats().then(setStats);
   }, []);

   if (!stats) return (
      <div className="min-h-screen pt-32 px-8 flex items-center justify-center bg-slate-50">
         <div className="text-center">
            <Sparkles className="mx-auto mb-4 text-slate-200 animate-spin" size={40} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Veri Analizi Hazırlanıyor...</p>
         </div>
      </div>
   );

   const getLevelLabel = (level: number) => {
      if (level >= 7) return 'Tamamlandı';
      if (level >= 5) return 'Gelişmiş';
      if (level >= 3) return 'Ara Kademe';
      if (level >= 1) return 'Başlangıç';
      return 'Yeni';
   };

   const getLevelColor = (level: number) => {
      if (level >= 7) return 'bg-slate-950 text-white';
      if (level >= 5) return 'bg-slate-800 text-white';
      if (level >= 3) return 'bg-slate-400 text-white';
      if (level >= 1) return 'bg-slate-200 text-slate-700';
      return 'bg-slate-100 text-slate-400';
   };


   const groupedWords = stats.wordDetails?.reduce((acc: any, word: any) => {
      const isMatch =
         word.engWord.toLowerCase().includes(filter.toLowerCase()) ||
         word.turWord.toLowerCase().includes(filter.toLowerCase()) ||
         (word.topic || '').toLowerCase().includes(filter.toLowerCase());

      if (isMatch) {
         const t = word.topic || 'Genel';
         if (!acc[t]) acc[t] = [];
         acc[t].push(word);
      }
      return acc;
   }, {});

   const overallProgress = stats.totalWords > 0 ? Math.round((stats.learnedWords / stats.totalWords) * 100) : 0;

   return (
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen print:bg-white print:pt-0">
         <style jsx global>{`
        @media print {
          header, .bg-glow, .no-print, button, nav { display: none !important; }
          .print-m-0 { margin: 0 !important; padding: 0 !important; }
          .print-shadow-none { box-shadow: none !important; border: 1px solid #eee !important; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; margin-bottom: 2rem !important; }
        }
      `}</style>

         <div className="container max-w-6xl">
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 px-2">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 bg-slate-950 rounded-xl text-white shadow-xl shadow-slate-200">
                        <TrendingUp size={20} />
                     </div>
                     <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase italic">Analiz</h1>
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] pl-1">Performans ve İlerleme Raporu</p>
               </div>

               <div className="flex items-center gap-4 no-print">
                  <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 transition-colors" size={18} />
                     <input
                        type="text"
                        placeholder="Kelime veya kategori ara..."
                        className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all w-full md:w-80 font-bold text-sm text-slate-950 shadow-sm"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                     />
                  </div>
                  <button
                     onClick={() => window.print()}
                     className="p-4 bg-white border border-slate-200 text-slate-950 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-black uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                     <Printer size={18} /> Yazdır
                  </button>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 px-2">
               {[
                  { label: 'Kütüphane', value: stats.totalWords, icon: BookOpen, sub: 'Toplam Kayıt' },
                  { label: 'Ustalaşılan', value: stats.learnedWords, icon: CheckCircle, sub: 'Seviye 7/7' },
                  { label: 'Süreçte', value: stats.inProgressWords, icon: Clock, sub: 'Seviye 1-6' },
                  { label: 'Hakimiyet', value: `${overallProgress}%`, icon: Target, sub: 'Genel Başarı', dark: true }
               ].map((card, i) => (
                  <div key={i} className={`card p-8 border ${card.dark ? 'bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl ${card.dark ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-950 border border-slate-100'}`}>
                           <card.icon size={20} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${card.dark ? 'text-slate-400' : 'text-slate-400'}`}>{card.label}</span>
                     </div>
                     <h3 className="text-4xl font-black tracking-tighter mb-1">{card.value}</h3>
                     <p className={`text-[10px] font-black uppercase tracking-widest italic ${card.dark ? 'text-slate-500' : 'text-slate-300'}`}>{card.sub}</p>
                  </div>
               ))}
            </div>

            <AnalysisCharts stats={stats} />

            <div className="space-y-12">
               <div className="flex items-center gap-4 px-2">
                  <Layers size={16} className="text-slate-300" />
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Kategori Bazlı Detaylı Analiz</h2>
                  <div className="h-px bg-slate-100 flex-1"></div>
               </div>

               {groupedWords && Object.keys(groupedWords).map((topic) => {

                  const rawWords = groupedWords[topic];
                  const seen = new Set<string>();
                  const words = rawWords.filter((w: any) => {
                     if (seen.has(w.engWord)) return false;
                     seen.add(w.engWord);
                     return true;
                  });
                  const topicStat = stats.topicStats?.find((s: any) => (s.topic || 'Genel') === topic);
                  const percent = topicStat ? Math.round((topicStat.learned / topicStat.total) * 100) : 0;

                  return (
                     <section key={topic} className="card bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30">
                           <div className="flex items-start gap-6">
                              <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl shadow-slate-200">
                                 {topic.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-3xl font-black text-slate-950 capitalize tracking-tighter">{topic}</h3>
                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                       {words.length} Kelime
                                    </span>
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Bu kategorideki uzmanlık düzeyiniz</p>
                              </div>
                           </div>

                           <div className="flex-1 max-w-xs w-full">
                              <div className="flex justify-between items-end mb-3">
                                 <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Uzmanlık: {percent}%</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                    {topicStat?.learned || 0} / {topicStat?.total || 0} Tamamlandı
                                 </span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                 <div
                                    className="h-full bg-slate-950 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${percent}%` }}
                                 ></div>
                              </div>
                           </div>
                        </div>

                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-white text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                    <th className="px-10 py-5">İngilizce</th>
                                    <th className="px-10 py-5">Türkçe</th>
                                    <th className="px-10 py-5">Seviye</th>
                                    <th className="px-10 py-5 text-right">Durum</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {words.map((w: any) => (
                                    <tr key={`${w.engWord}-${topic}`} className="group hover:bg-slate-50/50 transition-colors">
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-3">
                                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-950 transition-colors"></div>
                                             <span className="font-black text-slate-950 text-xl tracking-tighter capitalize">{w.engWord}</span>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6">
                                          <span className="text-slate-500 font-bold tracking-tight text-sm italic">{w.turWord}</span>
                                       </td>
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-1.5">
                                             {Array.from({ length: 7 }).map((_, i) => (
                                                <div
                                                   key={i}
                                                   className={`w-4 h-1.5 rounded-full transition-all duration-500 ${i < (w.level || 0)
                                                      ? (w.level >= 7 ? 'bg-slate-950' : 'bg-slate-800')
                                                      : 'bg-slate-100'
                                                      }`}
                                                ></div>
                                             ))}
                                          </div>
                                       </td>
                                       <td className="px-10 py-6 text-right">
                                          <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase italic shadow-sm ${getLevelColor(w.level || 0)}`}>
                                             {getLevelLabel(w.level || 0)}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </section>
                  );
               })}

               {(!groupedWords || Object.keys(groupedWords).length === 0) && (
                  <div className="py-40 text-center card bg-white border-dashed border-2 border-slate-200">
                     <div className="max-w-xs mx-auto">
                        <Search size={48} className="mx-auto text-slate-100 mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Analiz Edilecek Veri Bulunamadı</p>
                        <p className="text-slate-200 text-[10px] mt-2 font-black leading-relaxed uppercase tracking-widest italic">Arama kriterlerinizi değiştirin veya yeni kelimeler ekleyin.</p>
                     </div>
                  </div>
               )}
            </div>


         </div>
      </div>
   );
}
