import { getDB } from './client';

const INITIAL_MIGRATION_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      companyName TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      orderDate TEXT NOT NULL,
      termDuration TEXT NOT NULL,
      expectedDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Bekleniyor',
      arrivedAt TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      note TEXT,
      relatedTermId INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (relatedTermId) REFERENCES terms(id)
    )
  `,
  'CREATE INDEX IF NOT EXISTS idx_activities_customer_date ON activities(customerId, date DESC, id DESC)',
  'CREATE INDEX IF NOT EXISTS idx_terms_customer_expected_date ON terms(customerId, expectedDate ASC, id DESC)',
] as const;

export function initDatabase(): void {
  const db = getDB();

  INITIAL_MIGRATION_STATEMENTS.forEach(statement => {
    db.execute(statement);
  });
}
