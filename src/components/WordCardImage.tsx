'use client';

export default function WordCardImage({ src, alt, engWord }: { src: string, alt: string, engWord: string }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f1f5f9/cbd5e1?text=Gorsel+Yuklenemedi`;
      }}
    />
  );
}
