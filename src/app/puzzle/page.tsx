'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Send } from 'lucide-react';
import { getLearnedWordsForPuzzle } from '@/lib/actions';

const MAX_ATTEMPTS = 6;

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState('WORD');
  const [wordLength, setWordLength] = useState(4);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);

  const initGame = useCallback(async () => {
    setLoading(true);
    const words = await getLearnedWordsForPuzzle();
    const chosen = words[Math.floor(Math.random() * words.length)] || 'WORD';

    setTargetWord(chosen.toLocaleUpperCase('en-US'));
    setWordLength(chosen.length);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getGuessStatuses = (guess: string) => {
    const statuses = Array(guess.length).fill('absent');
    const targetArr = targetWord.split('');
    const guessArr = guess.split('');

    for (let i = 0; i < guess.length; i++) {
      if (guessArr[i] === targetArr[i]) {
        statuses[i] = 'correct';
        targetArr[i] = '';
        guessArr[i] = '';
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (guessArr[i] !== '' && targetArr.includes(guessArr[i])) {
        statuses[i] = 'present';
        const targetIdx = targetArr.indexOf(guessArr[i]);
        targetArr[targetIdx] = '';
      }
    }

    return statuses;
  };

  return (
    <div className="wordle-page min-h-screen wordle-bg-premium pt-44 pb-12 relative font-mono overflow-x-hidden">
      <div className="absolute inset-0 z-0 wordle-bg-dots opacity-40 pointer-events-none"></div>

      <div className="container relative z-10 flex flex-col items-center">
        <header className="mb-8 text-center text-sans relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-[0.2em] uppercase mb-2 italic">LEX WORDLE</h1>
          <p className="text-slate-400 tracking-tighter uppercase font-black text-[10px] opacity-70 italic">Hafızanızdaki kelimeleri tazeleyin</p>
        </header>

        {!gameOver && !loading && (
          <input
            style={{ padding: "10px", fontSize: "16px", marginBottom: "20px" }}
            type="text"
            value={currentGuess}
            onChange={(e) => {
              const val = e.target.value.toLocaleUpperCase('en-US').replace(/[^A-ZĞÜŞİÖÇ]/g, '');
              setCurrentGuess(val.slice(0, wordLength));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentGuess.length === wordLength) {
                const newGuesses = [...guesses, currentGuess];
                setGuesses(newGuesses);
                setCurrentGuess('');
                if (currentGuess === targetWord) {
                  setWon(true);
                  setGameOver(true);
                } else if (newGuesses.length >= MAX_ATTEMPTS) {
                  setGameOver(true);
                }
              }
            }}
            autoFocus
            onBlur={(e) => e.target.focus()}
          />
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-md border border-white/50">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Uzunluk: {wordLength}</span>
            <div className="flex gap-1">
              {Array.from({ length: wordLength }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <div className="flex flex-col gap-4 mb-8">
            {guesses.map((guess, i) => {
              const statuses = getGuessStatuses(guess);
              return (
                <div key={i} className="flex gap-4 justify-center animate-fade">
                  {guess.split('').map((char, j) => (
                    <div key={j} className={`wordle-tile ${statuses[j]}`}>
                      {char}
                    </div>
                  ))}
                </div>
              );
            })}

            {Array.from({ length: MAX_ATTEMPTS - guesses.length }).map((_, i) => (
              <div key={i} className={`flex gap-4 justify-center transition-all duration-300 ${i === 0 && !gameOver ? 'wordle-active-row' : 'opacity-50'}`}>
                {Array.from({ length: wordLength }).map((_, j) => {
                  const isActive = i === 0 && !gameOver;
                  const isCurrentChar = isActive && j === currentGuess.length;

                  return <div key={j} className={`wordle-tile ${isActive && isCurrentChar ? 'wordle-focus-tile' : ''}`}
                    style={isActive ? { borderColor: '#cbd5e1', backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } : { borderColor: '#f1f5f9', backgroundColor: '#f8fafc', color: '#e2e8f0' }}>
                    {isActive && currentGuess[j] ? (
                      <span className="text-slate-900 animate-zoom">{currentGuess[j]}</span>
                    ) : (isCurrentChar && <div className="w-1 h-10 bg-primary rounded-full animate-cursor"></div>)}
                  </div>
                })}
              </div>
            ))}
          </div>



          {gameOver ? (
            <div className="card p-8 text-center bg-white shadow-xl max-w-sm w-full" style={{ borderRadius: '2rem' }}>
              {won ? (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy size={32} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">MÜKEMMEL!</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Kelimemiz: {targetWord}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">OYUN BİTTİ</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Doğru Kelime: <span className="text-slate-950 font-bold">{targetWord}</span></p>
                </div>
              )}
              <button onClick={initGame} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
                <RefreshCw size={18} /> <span>Yeniden Başlat</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 min-h-[60px]">
              {currentGuess.length === wordLength ? (
                <div className="animate-fade flex items-center gap-2 font-black text-[10px] uppercase tracking-widest bg-slate-100 py-2 px-6 rounded-full border border-slate-200">
                  <Send size={12} /> ENTER TUŞUNA BASARAK KONTROL ET
                </div>
              ) : (
                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] opacity-60">Klavye ile yazmaya başlayın</p>
              )}
            </div>
          )}
        </div>



        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="text-slate-400 text-[9px] tracking-widest uppercase font-black italic opacity-40">Renk Kodları</div>
          <div className="flex gap-8 font-black text-[10px] uppercase tracking-widest italic">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-correct"></div>
              <span className="text-green-400 font-bold">Doğru</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-present"></div>
              <span className="text-orange-400 font-bold">Yanlış Yer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-absent"></div>
              <span className="text-slate-900">Yok</span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .wordle-active-row { transform: scale(1.02); }
      `}</style>
    </div>
  );
}
