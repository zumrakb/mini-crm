import { open, type QuickSQLiteConnection } from 'react-native-quick-sqlite';

let db: QuickSQLiteConnection | null = null;

export function getDB(): QuickSQLiteConnection {
  if (!db) {
    db = open({ name: 'mini_crm.db' });
  }

  return db;
}
