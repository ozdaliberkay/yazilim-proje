'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition cursor-pointer"
    >
      <Printer size={16} /> Print Matrix Report
    </button>
  );
}
