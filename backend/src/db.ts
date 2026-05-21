import Database, { type Database as BetterDatabase } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(__dirname, '../../data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = path.join(DATA_DIR, 'taxitracker.db')

export const db: BetterDatabase = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      shift_date TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      payment_type TEXT NOT NULL,
      meter REAL NOT NULL DEFAULT 0,
      charge REAL NOT NULL DEFAULT 0,
      overring REAL NOT NULL DEFAULT 0,
      cash_in REAL NOT NULL DEFAULT 0,
      gratuity REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_shift_date ON transactions(shift_date);
    CREATE INDEX IF NOT EXISTS idx_transactions_week ON transactions(year, week_number);

    CREATE TABLE IF NOT EXISTS shifts (
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('start','end')),
      time TEXT NOT NULL,
      car TEXT NOT NULL DEFAULT '',
      meter_readings TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (date, type)
    );

    CREATE TABLE IF NOT EXISTS daily_sheets (
      date TEXT PRIMARY KEY,
      day_name TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      shift_start TEXT NOT NULL DEFAULT '',
      shift_end TEXT NOT NULL DEFAULT '',
      car TEXT NOT NULL DEFAULT '',
      meter_readings_start TEXT NOT NULL DEFAULT '[]',
      meter_readings_end TEXT NOT NULL DEFAULT '[]',
      cash_total REAL NOT NULL DEFAULT 0,
      card_total REAL NOT NULL DEFAULT 0,
      account_total REAL NOT NULL DEFAULT 0,
      charge_total REAL NOT NULL DEFAULT 0,
      meter_total REAL NOT NULL DEFAULT 0,
      overring_total REAL NOT NULL DEFAULT 0,
      card_gratuity REAL NOT NULL DEFAULT 0,
      cash_gratuity REAL NOT NULL DEFAULT 0,
      driver_share REAL NOT NULL DEFAULT 0,
      cash_enclosed REAL NOT NULL DEFAULT 0,
      transaction_count INTEGER NOT NULL DEFAULT 0,
      transactions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sheets_week ON daily_sheets(year, week_number);

    CREATE TABLE IF NOT EXISTS frozen_invoices (
      id TEXT PRIMARY KEY,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      version INTEGER NOT NULL,
      frozen_date TEXT NOT NULL,
      total_charge REAL NOT NULL DEFAULT 0,
      total_driver_share REAL NOT NULL DEFAULT 0,
      sheets TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      UNIQUE(year, week_number, version)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)
}
