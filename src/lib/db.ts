import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL DEFAULT 1,
    engWord TEXT NOT NULL,
    turWord TEXT NOT NULL,
    wordType TEXT, -- e.g., Noun, Verb, Adjective
    picture TEXT, -- Path to image
    audio TEXT, -- URL to pronunciation audio
    topic TEXT,
    UNIQUE(engWord, userId),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS word_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wordId INTEGER NOT NULL,
    sample TEXT NOT NULL,
    translation TEXT DEFAULT '',
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS word_progress (
    userId INTEGER NOT NULL,
    wordId INTEGER NOT NULL,
    level INTEGER DEFAULT 0, -- 0 to 7 (Mastered)
    nextAttempt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastAttempt DATETIME,
    PRIMARY KEY (userId, wordId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    userId INTEGER PRIMARY KEY,
    newWordsPerDay INTEGER DEFAULT 10,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

export default db;
