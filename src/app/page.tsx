import Link from 'next/link';
import { getStats, getCurrentUser } from '@/lib/actions';
import { Trophy, TrendingUp, BookOpen, Brain } from 'lucide-react';

export default async function Dashboard() {
  const stats = await getStats();
  const user = await getCurrentUser();
  const displayName = user?.username ? user.username.split('@')[0] : 'Misafir';

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 bg-slate-50">
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Analitik Veriler Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-950 tracking-tighter mb-2 capitalize">Hoş Geldin, {displayName}.</h1>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Öğrenme Performans Paneli</p>
        </header>

        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
              <Trophy size={60} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tam Öğrenilen</p>
            <h2 className="text-6xl font-black text-slate-900 mb-6">{stats.learnedWords || 0}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-1000"
                  style={{ width: `${(stats.learnedWords / (stats.totalWords || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-slate-400">{Math.round((stats.learnedWords / (stats.totalWords || 1)) * 100)}%</span>
            </div>
          </div>

          <div className="card p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
              <TrendingUp size={60} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Süreçteki Kelimeler</p>
            <h2 className="text-6xl font-black text-slate-900 mb-6">{stats.inProgressWords || 0}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-700 transition-all duration-1000"
                  style={{ width: `${(stats.inProgressWords / (stats.totalWords || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-slate-400">{Math.round((stats.inProgressWords / (stats.totalWords || 1)) * 100)}%</span>
            </div>
          </div>

          <div className="card p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
              <BookOpen size={60} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Toplam Kelime Havuzu</p>
            <h2 className="text-6xl font-black text-slate-900 mb-6">{stats.totalWords || 0}</h2>
            <p className="text-[10px] text-slate-400 font-black leading-relaxed uppercase tracking-tighter">Kütüphanenize eklenen tüm veriler.</p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="card p-12 overflow-hidden relative flex flex-col justify-center gap-6" style={{ background: 'var(--bg-dark)' }}>
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
              <Brain size={50} color="white" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Sınav Oturumunu Başlat</h2>
              <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed italic text-sm">
                6 aşamalı bilimsel tekrar algoritmasıyla kelimeleri kalıcı hafızanıza aktarın.
              </p>
              <Link href="/quiz" className="btn-primary" style={{ background: 'white', color: 'var(--bg-dark)' }}>
                Hemen Başla
              </Link>
            </div>
          </div>

          <div className="card p-10 flex flex-col gap-8 bg-white border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Çalışılan Konular</h3>
              <Link href="/analysis" className="text-slate-900 font-black uppercase tracking-widest text-[10px] border-b-2 border-slate-900 pb-1">Tüm Raporu Gör</Link>
            </div>
            <div className="space-y-6">
              {stats.topicStats?.slice(0, 3).map((topic: any) => (
                <div key={topic.topic}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-800 capitalize tracking-tight">{topic.topic}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{topic.learned} / {topic.total} Tamamlandı</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-1000"
                      style={{ width: `${(topic.learned / topic.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {!stats.topicStats?.length && <p className="text-slate-300 italic text-sm text-center py-10 uppercase font-black tracking-widest text-[10px] opacity-50">Henüz konu çalışılmadı.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
