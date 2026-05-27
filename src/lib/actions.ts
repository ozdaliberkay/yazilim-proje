'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

import fs from 'fs';
import path from 'path';


const LEVEL_INTERVALS = [0, 1, 7, 30, 90, 180, 365];


async function fetchKeywordImage(keyword: string): Promise<string> {
  try {
    const cleanKeyword = keyword.trim().split(/[,/]/)[0].trim();
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=File:${encodeURIComponent(cleanKeyword)}&prop=imageinfo&iiprop=url&format=json&origin=*&gsrlimit=3`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          if (page.imageinfo?.[0]?.url) {
            return page.imageinfo[0].url;
          }
        }
      }
    }
  } catch (err) {
    console.error("Wikimedia Commons image fetch failed:", err);
  }
  return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/400/300`;
}



export async function resetPassword(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const newPassword = (formData.get('newPassword') as string);
  if (!email || !newPassword) return { error: 'Email ve yeni şifre zorunlu.' };
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(email) as any;
  if (!user) return { error: 'Kullanıcı bulunamadı.' };
  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id.toString(), { httpOnly: true, secure: false, path: '/', sameSite: 'lax' });
  redirect('/');
  return { success: true };
}

export async function register(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Email adresi ve şifre gereklidir.' };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(username)) return { error: 'Lütfen geçerli bir e-posta adresi formatı kullanın (Örn: isim@domain.com).' };

  if (password.length < 6) return { error: 'Şifre çok kısa (min 6 karakter).' };
  if (password.length > 16) return { error: 'Şifre çok uzun (max 16 karakter).' };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    const userId = info.lastInsertRowid;



    const defaultWords = [
      {
        eng: 'apple', tur: 'elma', type: 'noun', samples: [
          { text: 'I ate a red apple for lunch.', translation: 'Öğle yemeğinde kırmızı bir elma yedim.' },
          { text: 'The apple fell from the tree.', translation: 'Elma ağaçtan düştü.' }
        ]
      },
      {
        eng: 'book', tur: 'kitap', type: 'noun', samples: [
          { text: 'She is reading an interesting book.', translation: 'İlginç bir kitap okuyor.' },
          { text: 'I bought a new book yesterday.', translation: 'Dün yeni bir kitap aldım.' }
        ]
      },
      {
        eng: 'cat', tur: 'kedi', type: 'noun', samples: [
          { text: 'The cat is sleeping on the couch.', translation: 'Kedi kanepede uyuyor.' },
          { text: 'My cat loves to play with yarn.', translation: 'Kedim iplikle oynamayı çok seviyor.' }
        ]
      },
      {
        eng: 'dog', tur: 'köpek', type: 'noun', samples: [
          { text: 'The dog is very friendly.', translation: 'Köpek çok cana yakın.' },
          { text: 'We took the dog for a walk.', translation: 'Köpeği yürüyüşe çıkardık.' }
        ]
      },
      {
        eng: 'house', tur: 'ev', type: 'noun', samples: [
          { text: 'They live in a big house.', translation: 'Büyük bir evde yaşıyorlar.' },
          { text: 'The house has a beautiful garden.', translation: 'Evin güzel bir bahçesi var.' }
        ]
      },
      {
        eng: 'car', tur: 'araba', type: 'noun', samples: [
          { text: 'He drives a blue car.', translation: 'Mavi bir araba kullanıyor.' },
          { text: 'The car needs to be washed.', translation: 'Arabanın yıkanması gerekiyor.' }
        ]
      },
      {
        eng: 'tree', tur: 'ağaç', type: 'noun', samples: [
          { text: 'The tree provides shade in summer.', translation: 'Ağaç yazın gölge sağlar.' },
          { text: 'Birds are singing in the tree.', translation: 'Kuşlar ağaçta şarkı söylüyor.' }
        ]
      },
      {
        eng: 'water', tur: 'su', type: 'noun', samples: [
          { text: 'Please give me a glass of water.', translation: 'Lütfen bana bir bardak su verin.' },
          { text: 'The water in the lake is very clean.', translation: 'Göldeki su çok temiz.' }
        ]
      },
      {
        eng: 'food', tur: 'yiyecek', type: 'noun', samples: [
          { text: 'This restaurant serves delicious food.', translation: 'Bu restoran lezzetli yemekler sunuyor.' },
          { text: 'We need to buy some food for dinner.', translation: 'Akşam yemeği için biraz yiyecek almamız gerekiyor.' }
        ]
      },
      {
        eng: 'friend', tur: 'arkadaş', type: 'noun', samples: [
          { text: 'She is my best friend.', translation: 'O benim en iyi arkadaşım.' },
          { text: 'I met a new friend at school.', translation: 'Okulda yeni bir arkadaş edindim.' }
        ]
      }
    ];

    try {
      db.exec('ALTER TABLE word_samples ADD COLUMN translation TEXT DEFAULT ""');
    } catch (_e) { }

    const insertWordStmt = db.prepare('INSERT OR IGNORE INTO words (userId, engWord, turWord, wordType, picture, audio, topic) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertSampleStmt = db.prepare('INSERT INTO word_samples (wordId, sample, translation) VALUES (?, ?, ?)');

    for (const w of defaultWords) {
      const pictureUrl = await fetchKeywordImage(w.eng);
      const wordInfo = insertWordStmt.run(userId, w.eng, w.tur, w.type, pictureUrl, '', 'default');
      if (wordInfo.changes > 0) {
        const wordId = wordInfo.lastInsertRowid;
        for (const s of w.samples) {
          insertSampleStmt.run(wordId, s.text, s.translation);
        }
      }
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', userId.toString(), { httpOnly: true, secure: false, path: '/', sameSite: 'lax' });
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) return { error: 'Bu email adresi zaten kayıtlı.' };
    return { error: 'Veritabanı kayıt hatası.' };
  }

  redirect('/');
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Lütfen tüm alanları doldurun.' };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(username)) return { error: 'Lütfen geçerli bir e-posta adresi formatı kullanın (Örn: isim@domain.com).' };

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) return { error: 'Kullanıcı bulunamadı.' };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: 'Şifre yanlış.' };

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id.toString(), { httpOnly: true, secure: false, path: '/', sameSite: 'lax' });

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/auth/login');
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  return userId ? parseInt(userId) : null;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as any;
  return user || null;
}


export async function addWord(prevState: any, formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Yetkiniz yok.' };

  const engWord = formData.get('engWord') as string;
  const topic = formData.get('topic') as string;
  let turWord = formData.get('turWord') as string;
  let pictureUrl = formData.get('pictureUrl') as string;
  let sample1 = formData.get('sample1') as string;
  let sample2 = formData.get('sample2') as string;
  let sample3 = formData.get('sample3') as string;

  if (!engWord) return { error: 'Lütfen bir İngilizce kelime girin.' };

  try {
    let wordType = 'not specified';
    let phoneticAudio = '';
    let samples: { text: string, translation: string }[] = [];

    const manualSamples = [sample1, sample2, sample3].filter(Boolean);


    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(engWord)}`);
    if (dictRes.ok) {
      const dictData = await dictRes.json();
      if (dictData && dictData.length > 0) {
        const entry = dictData[0];

        if (entry.meanings && entry.meanings.length > 0) {
          wordType = entry.meanings[0].partOfSpeech || 'word';
        }

        for (const p of entry.phonetics || []) {
          if (p.audio) { phoneticAudio = p.audio; break; }
        }

        if (manualSamples.length === 0 && entry.meanings) {
          for (const meaning of entry.meanings) {
            for (const definition of meaning.definitions || []) {
              if (definition.example && samples.length < 3) {
                samples.push({ text: definition.example, translation: '' });
              }
            }
          }
        }
      }
    }


    for (const s of manualSamples) {
      samples.push({ text: s, translation: '' });
    }


    for (let i = 0; i < samples.length; i++) {
      const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(samples[i].text)}&langpair=en|tr`);
      if (transRes.ok) {
        const transData = await transRes.json();
        samples[i].translation = transData?.responseData?.translatedText || '';
      }
    }


    if (!turWord) {
      const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(engWord)}&langpair=en|tr`);
      if (transRes.ok) {
        const transData = await transRes.json();
        turWord = transData?.responseData?.translatedText || 'Çeviri bulunamadı';
      }
    }


    if (!pictureUrl) {
      pictureUrl = await fetchKeywordImage(engWord);
    }


    const info = db.prepare('INSERT OR IGNORE INTO words (userId, engWord, turWord, wordType, picture, audio, topic) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, engWord, turWord, wordType, pictureUrl, phoneticAudio, topic);

    if (info.changes === 0) {
      return { error: 'Bu kelime zaten sistemde var.' };
    }

    const wordId = info.lastInsertRowid;

    if (samples.length === 0) {
      samples.push({ text: `${engWord} için henüz örnek cümle bulunmuyor.`, translation: '' });
    }

    for (const sample of samples) {
      db.prepare('INSERT INTO word_samples (wordId, sample, translation) VALUES (?, ?, ?)').run(wordId, sample.text, sample.translation);
    }

    revalidatePath('/words');
    revalidatePath('/');

    return { success: 'Kelime başarıyla eklendi!' };
  } catch (err) {
    console.error(err);
    return { error: 'Bir hata oluştu, lütfen tekrar deneyin.' };
  }
}

export async function deleteWord(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const wordId = formData.get('wordId') as string;
  if (!wordId) return;

  const wid = parseInt(wordId, 10);
  const word = db.prepare('SELECT userId FROM words WHERE id = ?').get(wid) as any;

  if (word?.userId === userId) {
    db.prepare('DELETE FROM words WHERE id = ?').run(wid);
  } else {
    db.prepare(`
      INSERT INTO word_progress (userId, wordId, level) 
      VALUES (?, ?, -1)
      ON CONFLICT(userId, wordId) DO UPDATE SET level = -1
    `).run(userId, wid);
  }

  revalidatePath('/words');
  revalidatePath('/');
}

export async function getLibraryWords() {
  const userId = await getCurrentUserId();
  if (!userId) return [];


  const rawWords = db.prepare(`
    SELECT DISTINCT w.*
    FROM words w
    LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
    WHERE (w.userId = ? AND (p.level IS NULL OR p.level >= 0)) OR (p.userId = ? AND p.level >= 0)
    ORDER BY w.id DESC
  `).all(userId, userId, userId) as any[];

  for (const w of rawWords) {
    const samples = db.prepare(`SELECT sample, translation FROM word_samples WHERE wordId = ?`).all(w.id) as any[];
    w.samples = samples;
  }
  return rawWords;
}

export async function submitQuizAnswer(wordId: number, grade: number) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const progress = db.prepare('SELECT * FROM word_progress WHERE userId = ? AND wordId = ?').get(userId, wordId) as any;
  const isNew = !progress;
  const nextDate = new Date();

  if (!progress) {
    let newLevel = 0;
    if (grade === 2) newLevel = 1;
    else if (grade === 1) newLevel = 0;

    const daysDelay = LEVEL_INTERVALS[newLevel] || 1;
    nextDate.setDate(nextDate.getDate() + daysDelay);

    db.prepare(`
      INSERT INTO word_progress (userId, wordId, level, nextAttempt, lastAttempt) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, wordId, newLevel, nextDate.toISOString());

    if (newLevel > 0) {
      const settings = db.prepare('SELECT newWordsPerDay FROM settings WHERE userId = ?').get(userId) as any;
      const current = settings?.newWordsPerDay ?? 10;
      const updated = Math.max(0, current - 1);
      db.prepare('UPDATE settings SET newWordsPerDay = ? WHERE userId = ?').run(updated, userId);
    }
  } else {
    let newLevel = progress.level;
    let daysDelay = 1;

    if (grade === 0) {
      newLevel = 0;
      daysDelay = 1;
    } else if (grade === 1) {
      daysDelay = 1;
    } else if (grade === 2) {
      newLevel = Math.min(newLevel + 1, 7);
      daysDelay = LEVEL_INTERVALS[newLevel] || 365;
    }

    nextDate.setDate(nextDate.getDate() + daysDelay);

    db.prepare(`
      UPDATE word_progress 
      SET level = ?, nextAttempt = ?, lastAttempt = CURRENT_TIMESTAMP 
      WHERE userId = ? AND wordId = ?
    `).run(newLevel, nextDate.toISOString(), userId, wordId);
  }

  revalidatePath('/quiz');
  revalidatePath('/');
}

export async function getWordsDueForTesting() {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  try {
    db.exec('ALTER TABLE settings ADD COLUMN maxWordsPerTest INTEGER DEFAULT 10');
  } catch (e) {
  }
  const settings = db.prepare('SELECT newWordsPerDay, maxWordsPerTest FROM settings WHERE userId = ?').get(userId) as any;
  const maxTestWords = settings?.maxWordsPerTest ?? 10;
  const newWordsLimit = settings?.newWordsPerDay ?? 10;

  const now = new Date().toISOString();


  const dueReviews = db.prepare(`
    SELECT w.*, p.level 
    FROM words w 
    JOIN word_progress p ON w.id = p.wordId 
    WHERE p.userId = ? AND p.level > 0 AND p.level < 7 AND p.nextAttempt <= ?
  `).all(userId, now) as any[];

  const remainingNew = Math.max(0, newWordsLimit - dueReviews.length);

  const newWords = remainingNew > 0 ? db.prepare(`
    SELECT w.*, 0 as level 
    FROM words w 
    LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
    WHERE p.wordId IS NULL AND w.userId = ?
    ORDER BY RANDOM()
    LIMIT ?
  `).all(userId, userId, remainingNew) as any[] : [];

  let combined = [...dueReviews, ...newWords];

  const filteredCombined = combined.filter(word => {
    const hasPicture = typeof word.picture === 'string' && word.picture.trim() !== '';
    const hasTurkish = typeof word.turWord === 'string' && word.turWord.trim() !== '';
    return hasPicture && hasTurkish;
  });

  const uniqueMap = new Map<number, any>();
  filteredCombined.forEach(word => {
    if (!uniqueMap.has(word.id)) {
      uniqueMap.set(word.id, word);
    }
  });
  const uniqueWords = Array.from(uniqueMap.values());

  let limited = uniqueWords.slice(0, maxTestWords);

  if (limited.length < maxTestWords) {
    const needed = maxTestWords - limited.length;
    const usedIds = limited.map((w: any) => w.id);
    let extraWords: any[] = [];
    if (usedIds.length > 0) {
      const placeholders = usedIds.join(',');
      extraWords = db.prepare(`
        SELECT w.*
        FROM words w
        WHERE w.id NOT IN (${placeholders})
          AND w.userId = ?
          AND w.picture != ''
          AND w.turWord != ''
        ORDER BY RANDOM()
        LIMIT ${needed}
      `).all(userId) as any[];
    } else {
      extraWords = db.prepare(`
        SELECT w.*
        FROM words w
        WHERE w.userId = ?
          AND w.picture != ''
          AND w.turWord != ''
        ORDER BY RANDOM()
        LIMIT ${needed}
      `).all(userId) as any[];
    }
    limited = limited.concat(extraWords);
  }
  return limited.sort(() => Math.random() - 0.5);
}

export async function getStats() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalWords,
        SUM(CASE WHEN p.level = 7 THEN 1 ELSE 0 END) as learnedWords,
        SUM(CASE WHEN p.level > 0 AND p.level < 7 THEN 1 ELSE 0 END) as inProgressWords
      FROM words w
      LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
      WHERE (w.userId = ? AND (p.level IS NULL OR p.level >= 0)) OR (p.userId = ? AND p.level >= 0)
    `).get(userId, userId, userId) as any;

    const topicStats = db.prepare(`
      SELECT w.topic, 
             COUNT(*) as total, 
             SUM(CASE WHEN p.level = 7 THEN 1 ELSE 0 END) as learned
      FROM words w
      LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
      WHERE (w.userId = ? AND (p.level IS NULL OR p.level >= 0)) OR (p.userId = ? AND p.level >= 0)
      GROUP BY w.topic
    `).all(userId, userId, userId) as any[];

    const wordDetails = db.prepare(`
      SELECT w.engWord, w.turWord, w.topic, p.level
      FROM words w
      LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
      WHERE (w.userId = ? AND (p.level IS NULL OR p.level >= 0)) OR (p.userId = ? AND p.level >= 0)
      ORDER BY p.level DESC, w.engWord ASC
    `).all(userId, userId, userId) as any[];

    return { ...stats, topicStats, wordDetails };
  } catch (e) {
    return null;
  }
}

export async function getLearnedWordsForPuzzle() {
  const userId = await getCurrentUserId();
  if (!userId) return ['SYSTEM'];

  let records = db.prepare(`
    SELECT w.engWord 
    FROM words w 
    JOIN word_progress p ON w.id = p.wordId 
    WHERE p.userId = ? AND p.level >= 6
  `).all(userId) as any[];

  if (records.length === 0) {
    records = db.prepare('SELECT engWord FROM words WHERE userId = ? ORDER BY RANDOM() LIMIT 20').all(userId) as any[];
  }

  let finalWords = records
    .map((r: any) => r.engWord.toLocaleUpperCase('en-US').trim())
    .filter((w: string) => !w.includes(' ') && w.length >= 3 && w.length <= 10);

  if (finalWords.length === 0) {
    finalWords = ['REACT', 'HELLO', 'WORLD', 'SYSTEM'];
  }

  return finalWords;
}



const FALLBACK_CHAINS = [
  ['BRAIN', 'NIGHT', 'TIGER', 'ROBIN', 'NOBLE'],
  ['APPLE', 'EARTH', 'HOUSE', 'EAGLE', 'ELBOW'],
  ['BIRD', 'DEER', 'RABBIT', 'TURTLE', 'EAGLE'],
  ['SUN', 'NATURE', 'EARTH', 'HEAVEN', 'NIGHT'],
  ['CLOUD', 'DREAM', 'MAGIC', 'CROWN', 'NATURE']
];

function findWordChain(words: string[], length: number = 5): string[] | null {
  const uniqueWords = Array.from(new Set(words.map(w => w.trim().toUpperCase()))).filter(w => w.length >= 2);

  function dfs(currentChain: string[]): string[] | null {
    if (currentChain.length === length) {
      return currentChain;
    }
    const lastWord = currentChain[currentChain.length - 1];
    const lastLetter = lastWord[lastWord.length - 1];

    const candidates = uniqueWords.filter(w => !currentChain.includes(w) && w[0] === lastLetter);
    candidates.sort(() => Math.random() - 0.5);

    for (const nextWord of candidates) {
      const result = dfs([...currentChain, nextWord]);
      if (result) return result;
    }
    return null;
  }

  const shuffledWords = [...uniqueWords].sort(() => Math.random() - 0.5);
  for (const startWord of shuffledWords) {
    const chain = dfs([startWord]);
    if (chain) return chain;
  }

  return null;
}

function formatChainWords(words: string[]): string[] {
  return words.map((w, index) => {
    const word = w.toLowerCase();
    if (word.length === 0) return '';
    if (index === words.length - 1) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    if (word.length === 1) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1, -1) + word.charAt(word.length - 1).toUpperCase();
  });
}

async function saveStoryImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storiesDir = path.join(process.cwd(), 'public', 'stories');
    if (!fs.existsSync(storiesDir)) {
      fs.mkdirSync(storiesDir, { recursive: true });
    }

    const filename = `story_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filePath = path.join(storiesDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/stories/${filename}`;
  } catch (error) {
    console.error("Failed to save story image locally:", error);
    return imageUrl;
  }
}

async function generateStoryWithLLM(words: string[], formattedWords: string[]): Promise<{ story: string, summary: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Lütfen şu 5 İngilizce kelimeyi sırasıyla kullanarak Türkçe bir hikaye yaz. Hikaye Türkçe olmalı ancak bu İngilizce kelimeleri (büyük/küçük harf durumunu koruyarak) aynen içermelidir:
Kelime listesi:
${formattedWords.map((fw, i) => `${i + 1}. ${fw}`).join('\n')}

Hikaye içinde bu kelimelerin ilk ve son harflerini büyük yaparak zincir (chain) mantığını göster (örneğin: "${formattedWords.join(', ')}").
Ayrıca hikayenin kısa bir Türkçe özetini yaz.
Çıktıyı kesinlikle şu JSON formatında ver, başka hiçbir şey yazma:
{
  "story": "Hikaye metni buraya",
  "summary": "Hikayenin kısa özeti buraya"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text.trim());
          if (parsed.story && parsed.summary) {
            return { story: parsed.story, summary: parsed.summary };
          }
        }
      }
    } catch (e) {
      console.error("Gemini API call failed:", e);
    }
  }


  if (words[0].toUpperCase() === 'BRAIN' && words[2].toUpperCase() === 'TIGER') {
    return {
      story: `Zeki bir çocuk olan ${formattedWords[0]}, ${formattedWords[1]} boyunca ormanda ilerlerken aniden karşısına çıkan bir ${formattedWords[2]}'dan kaçmaya çalıştı, tam umudunu kaybedecekken bir ${formattedWords[3]} kuşu ona güvenli yolu gösterdi ve böylece o kuşu bir ${formattedWords[4]} kahraman olarak anıldı.`,
      summary: `Genç ve zeki Brain, gece ormanda yürürken bir kaplanla karşılaşıyor, ancak bir robin kuşu ona güvenli yolu gösteriyor.`
    };
  }


  const story = `Macera dolu bir günde, ${formattedWords[0]} arayışındaki kahramanımız, ${formattedWords[1]} geçidini aşarak gizemli bir ${formattedWords[2]} mağarasına girdi. Orada karşılaştığı bilge bir ${formattedWords[3]} ona doğru yolu fısıldadı ve yolculuğunu ${formattedWords[4]} bir zaferle sonlandırdı.`;
  const summary = `${words[0]} arayışındaki kahraman, ${words[1]} geçidini aşıp ${words[2]} mağarasına giriyor, bilge bir ${words[3]} sayesinde yolunu bulup ${words[4]} bir zafer elde ediyor.`;

  return { story, summary };
}


export async function olusturHikaye() {
  const userId = await getCurrentUserId();


  let rawWords: string[] = [];
  if (userId) {
    const userWords = db.prepare(`
      SELECT DISTINCT w.engWord
      FROM words w
      LEFT JOIN word_progress p ON w.id = p.wordId AND p.userId = ?
      WHERE (w.userId = ? AND (p.level IS NULL OR p.level >= 0)) OR (p.userId = ? AND p.level >= 0)
    `).all(userId, userId, userId) as any[];
    rawWords = userWords.map(w => w.engWord.trim());
  }

  if (rawWords.length < 5) {
    const allWords = db.prepare(`SELECT DISTINCT engWord FROM words`).all() as any[];
    rawWords = Array.from(new Set([...rawWords, ...allWords.map(w => w.engWord.trim())]));
  }

  let selectedWords = findWordChain(rawWords, 5);
  if (!selectedWords) {

    const fallback = FALLBACK_CHAINS[Math.floor(Math.random() * FALLBACK_CHAINS.length)];
    selectedWords = fallback;
  }


  const formattedWords = formatChainWords(selectedWords);


  const { story, summary } = await generateStoryWithLLM(selectedWords, formattedWords);


  const promptTheme = selectedWords[0].toUpperCase() === 'BRAIN' && selectedWords[2].toUpperCase() === 'TIGER'
    ? "A digital painting of a smart child named Brain in the dark night with a tiger and a small robin bird, fantasy adventure style, high quality, highly detailed"
    : `A scenic digital art representing ${selectedWords.join(', ')}, highly detailed, fantasy style, warm lighting`;

  const tempImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptTheme)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;


  const localImageUrl = await saveStoryImage(tempImageUrl);


  if (userId) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        trText TEXT,
        imageUrl TEXT NOT NULL,
        words TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
    db.prepare(`INSERT INTO stories (userId, text, trText, imageUrl, words) VALUES (?, ?, ?, ?, ?)`).run(
      userId,
      story,
      summary,
      localImageUrl,
      JSON.stringify(selectedWords)
    );
  }


  return {
    success: true,
    kelimeler: formattedWords,
    metin: story,
    trMetin: summary,
    resimYolu: localImageUrl,
  };
}


export async function getSavedStories() {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const rows = db.prepare(`SELECT id, text, trText, imageUrl, words, createdAt FROM stories WHERE userId = ? ORDER BY createdAt DESC`).all(userId) as any[];
  return rows.map(r => ({
    id: r.id,
    text: r.text,
    trText: r.trText,
    image: r.imageUrl,
    words: JSON.parse(r.words),
    createdAt: r.createdAt,
  }));
}


export async function deleteStory(storyId: number) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Yetkiniz yok.' };

  try {
    const story = db.prepare('SELECT imageUrl FROM stories WHERE id = ? AND userId = ?').get(storyId, userId) as any;
    if (story) {
      if (story.imageUrl && story.imageUrl.startsWith('/stories/')) {
        const filePath = path.join(process.cwd(), 'public', story.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      db.prepare('DELETE FROM stories WHERE id = ? AND userId = ?').run(storyId, userId);
      revalidatePath('/story');
      return { success: true };
    }
    return { error: 'Hikaye bulunamadı.' };
  } catch (err) {
    console.error("Failed to delete story:", err);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function generateAiWordsForUser() {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Kullanıcı bulunamadı.' };

  const aiWords = [
    { eng: 'sun', tur: 'güneş' },
    { eng: 'moon', tur: 'ay' },
    { eng: 'star', tur: 'yıldız' },
    { eng: 'river', tur: 'nehir' },
    { eng: 'mountain', tur: 'dağ' },
    { eng: 'forest', tur: 'orman' },
    { eng: 'bird', tur: 'kuş' },
    { eng: 'fish', tur: 'balık' },
    { eng: 'city', tur: 'şehir' },
    { eng: 'country', tur: 'ülke' }
  ];
  const insertStmt = db.prepare('INSERT OR IGNORE INTO words (userId, engWord, turWord, wordType, picture, audio, topic) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const w of aiWords) {
    insertStmt.run(userId, w.eng, w.tur, 'noun', '', '', 'ai-generated');
  }

  db.prepare('UPDATE settings SET newWordsPerDay = COALESCE(newWordsPerDay, 0) + ? WHERE userId = ?').run(aiWords.length, userId);
  revalidatePath('/quiz');
  return { success: true };
}



export async function getInitialStoryWords() {
  const userId = await getCurrentUserId();
  if (!userId) return ['SUN', 'BIRD', 'TREES', 'HAPPY', 'FIELD'];

  let words = db.prepare('SELECT w.engWord FROM words w JOIN word_progress p ON w.id = p.wordId WHERE p.userId = ? AND p.level >= 0 ORDER BY RANDOM() LIMIT 5').all(userId) as any[];

  if (words.length < 5) {
    words = db.prepare('SELECT engWord FROM words WHERE userId = ? ORDER BY RANDOM() LIMIT 5').all(userId) as any[];
  }

  if (words.length > 0) {
    return words.slice(0, 5).map(w => w.engWord);
  }
  return ['SUN', 'BIRD', 'TREES', 'HAPPY', 'FIELD'];
}


export async function getSettings() {
  const userId = await getCurrentUserId();
  if (!userId) return { newWordsPerDay: 10, maxWordsPerTest: 5 };
  const row = db.prepare('SELECT newWordsPerDay, maxWordsPerTest FROM settings WHERE userId = ?').get(userId) as any;
  return { newWordsPerDay: row?.newWordsPerDay ?? 10, maxWordsPerTest: row?.maxWordsPerTest ?? 5 };
}


export async function updateSettings(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('Kullanıcı bulunamadı.');
    return;
  }
  const limitStr = formData.get('wordsLimit') as string;
  const limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit < 1) {
    console.error('Geçerli bir sayı girin.');
    return;
  }

  db.prepare(`INSERT INTO settings (userId, newWordsPerDay, maxWordsPerTest) VALUES (?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET newWordsPerDay = excluded.newWordsPerDay, maxWordsPerTest = excluded.maxWordsPerTest`)
    .run(userId, limit, limit);

  revalidatePath('/quiz');
}
