import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ href = "/", label = "Dashboard" }: { href?: string, label?: string }) {
  return (
    <Link href={href} className="absolute top-8 left-8 text-slate-500 hover:text-primary flex items-center gap-2 font-medium transition bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md z-50">
       <ArrowLeft size={18} /> {label}
    </Link>
  );
}
