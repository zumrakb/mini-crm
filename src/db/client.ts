import * as SQLite from 'react-native-quick-sqlite';
import type {
  BatchQueryResult,
  FileLoadResult,
  QuickSQLiteConnection,
  QueryResult,
  SQLBatchTuple,
  Transaction,
} from 'react-native-quick-sqlite';

let db: QuickSQLiteConnection | null = null;
const DB_NAME = 'mini_crm.db';

type SQLiteRuntimeModule = typeof SQLite & {
  default?: Partial<typeof SQLite>;
};

function openDatabase(name: string): QuickSQLiteConnection {
  const sqliteModule = SQLite as SQLiteRuntimeModule;
  const quickSQLite = sqliteModule.QuickSQLite ?? sqliteModule.default?.QuickSQLite;

  if (!quickSQLite) {
    throw new Error('QuickSQLite native module is not available.');
  }

  quickSQLite.open(name);

  return {
    close: () => quickSQLite.close(name),
    delete: () => quickSQLite.delete(name),
    attach: (dbNameToAttach: string, alias: string, location?: string) =>
      quickSQLite.attach(name, dbNameToAttach, alias, location),
    detach: (alias: string) => quickSQLite.detach(name, alias),
    transaction: (fn: (tx: Transaction) => Promise<void> | void) =>
      quickSQLite.transaction(name, fn),
    execute: (query: string, params?: unknown[]): QueryResult =>
      quickSQLite.execute(name, query, params),
    executeAsync: (query: string, params?: unknown[]): Promise<QueryResult> =>
      quickSQLite.executeAsync(name, query, params),
    executeBatch: (commands: SQLBatchTuple[]): BatchQueryResult =>
      quickSQLite.executeBatch(name, commands),
    executeBatchAsync: (commands: SQLBatchTuple[]): Promise<BatchQueryResult> =>
      quickSQLite.executeBatchAsync(name, commands),
    loadFile: (location: string): FileLoadResult =>
      quickSQLite.loadFile(name, location),
    loadFileAsync: (location: string): Promise<FileLoadResult> =>
      quickSQLite.loadFileAsync(name, location),
  };
}

export function getDB(): QuickSQLiteConnection {
  if (!db) {
    db = openDatabase(DB_NAME);
  }

  return db;
}
