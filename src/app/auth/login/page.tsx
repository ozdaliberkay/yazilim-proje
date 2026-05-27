'use client';

import { login } from '@/lib/actions';
import { useActionState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null as any);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="card max-w-md w-full p-12 relative overflow-hidden bg-white shadow-2xl border border-slate-200" style={{ borderRadius: '2.5rem' }}>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-950/5 rounded-full blur-3xl"></div>
        
        <header className="mb-12 text-center">
           <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-slate-200">
              <BookOpen size={30} />
           </div>
           <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">Giriş Yap</h1>
           <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-widest italic opacity-70">Kelime Hazinenize Erişin</p>
        </header>

        <form action={formAction} className="space-y-6">
           {state?.error && (
             <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-xs font-black animate-fade">
                <AlertCircle size={18} />
                {state.error}
             </div>
           )}

           <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email Adresi</label>
              <div className="relative">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   name="username"
                   type="email"
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-slate-950 transition-all font-black text-slate-900" 
                   placeholder="ornek@email.com"
                   required
                 />
              </div>
           </div>
           
           <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Şifre</label>
              <div className="relative">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   name="password"
                   type="password"
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-slate-950 transition-all font-black text-slate-900" 
                   placeholder="••••••••"
                   required
                   minLength={6}
                   maxLength={16}
                 />
              </div>
              <div className="flex justify-end pr-2">
                <Link href="/auth/reset-password" id="forgot-password-link" className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-950 transition-colors">
                  Şifremi Unuttum
                </Link>
              </div>
           </div>

           <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-5 mt-8 group bg-slate-950">
              <span className="text-white">Giriş Yap</span> <ArrowRight className="group-hover:translate-x-1 transition text-white" size={20} />
           </button>

           <div className="text-center mt-10 border-t border-slate-100 pt-8">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Hesabınız yok mu? <Link href="/auth/register" className="text-slate-950 hover:underline">Kayıt Ol</Link>
              </p>
           </div>
        </form>
      </div>
    </div>
  );
}
