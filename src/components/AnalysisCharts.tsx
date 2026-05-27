'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnalysisChartsProps {
  stats: any;
}

export default function AnalysisCharts({ stats }: AnalysisChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const levelData = Array.from({ length: 7 }, (_, i) => ({
    name: `Seviye ${i + 1}`,
    count: stats.wordDetails?.filter((w: any) => w.level === i + 1).length || 0,
    level: i + 1,
  }));


  const radarData = stats.topicStats?.map((s: any) => ({
    subject: (s.topic || 'Genel').toUpperCase(),
    A: Math.round((s.learned / s.total) * 100),
    fullMark: 100,
  })).slice(0, 8) || [];

  if (!isMounted) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 px-2 h-[420px]">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl animate-pulse"></div>
      <div className="bg-white border border-slate-200 p-8 rounded-3xl animate-pulse"></div>
    </div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-2xl rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className="text-xl font-black text-slate-950">{payload[0].value} <span className="text-[10px] text-slate-500">Kelime</span></p>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 p-4 shadow-2xl rounded-xl border border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{payload[0].payload.subject}</p>
          <p className="text-xl font-black text-white">%{payload[0].value} <span className="text-[10px] text-slate-400 font-normal">Hakimiyet</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 px-2">
      <div className="card bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-950 rounded-full"></span>
            İlerleme Piramidi
          </h3>
          <p className="text-2xl font-black tracking-tighter text-slate-950 italic">Kelime Seviye Dağılımı</p>
        </div>

        <div className="h-[300px] w-full overflow-hidden">
          <BarChart width={500} height={300} data={levelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
            />
            <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
              {levelData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.level >= 7 ? '#020617' : entry.level >= 5 ? '#1e293b' : entry.level >= 3 ? '#94a3b8' : '#e2e8f0'}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      <div className="card bg-white border border-slate-200 p-8 rounded-3xl shadow-sm overflow-hidden">
        <div className="mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-950 rounded-full"></span>
            Topic Mastery
          </h3>
          <p className="text-2xl font-black tracking-tighter text-slate-950 italic">Kategori Radar Analizi</p>
        </div>

        <div className="h-[300px] w-full flex items-center justify-center overflow-hidden">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" width={500} height={300} data={radarData}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name="Hakimiyet"
              dataKey="A"
              stroke="#0f172a"
              strokeWidth={3}
              fill="#0f172a"
              fillOpacity={0.05}
            />
          </RadarChart>
        </div>
      </div>
    </div>
  );
}
