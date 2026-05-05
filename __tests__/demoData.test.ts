let mockDb: FakeDemoDb | null = null;

jest.mock('../src/db/client', () => ({
  getDB: () => {
    if (!mockDb) {
      throw new Error('Missing fake database.');
    }

    return mockDb;
  },
}));

jest.mock('../src/utils/backupUtils', () => ({
  BACKUP_VERSION: 1,
}));

import {
  appendDemoData,
  getDemoDataSummary,
  removeDemoData,
} from '../src/utils/demoData';

type Row = Record<string, number>;

class FakeDemoDb {
  operations: string[] = [];
  private lastInsertId = 1000;

  execute(query: string, params: unknown[] = []) {
    const sql = query.replace(/\s+/g, ' ').trim();
    this.operations.push(sql);

    if (sql === 'SELECT last_insert_rowid() AS id') {
      return { rows: { _array: [{ id: this.lastInsertId }] } };
    }

    if (sql.startsWith('INSERT INTO customers')) {
      this.lastInsertId += 1;
      return { rows: { _array: [] } };
    }

    if (sql.startsWith('INSERT INTO terms')) {
      this.lastInsertId += 1;
      return { rows: { _array: [] } };
    }

    if (sql.startsWith('INSERT INTO activities')) {
      this.lastInsertId += 1;
      return { rows: { _array: [] } };
    }

    if (sql.includes('FROM demo_records WHERE rowType = ?')) {
      return { rows: { _array: this.getTrackedRows(String(params[0])) } };
    }

    if (sql.startsWith('SELECT id FROM customers WHERE id IN')) {
      return { rows: { _array: params.map(id => ({ id })) } };
    }

    if (sql.startsWith('SELECT id FROM terms WHERE id IN')) {
      return { rows: { _array: params.map(id => ({ id })) } };
    }

    if (sql.startsWith('SELECT id FROM activities WHERE id IN')) {
      return { rows: { _array: params.map(id => ({ id })) } };
    }

    if (sql.startsWith('SELECT id FROM terms WHERE customerId IN')) {
      return { rows: { _array: this.getTermsForCustomers() } };
    }

    if (sql.startsWith('SELECT id FROM activities WHERE customerId IN')) {
      return { rows: { _array: this.getActivitiesForCustomers() } };
    }

    if (sql.startsWith('SELECT id FROM activities WHERE relatedTermId IN')) {
      return { rows: { _array: this.getActivitiesForTerms() } };
    }

    return { rows: { _array: [] } };
  }

  protected getTrackedRows(_rowType: string): Row[] {
    return [];
  }

  protected getTermsForCustomers(): Row[] {
    return [];
  }

  protected getActivitiesForCustomers(): Row[] {
    return [];
  }

  protected getActivitiesForTerms(): Row[] {
    return [];
  }
}

class FakeDbWithDemoRows extends FakeDemoDb {
  protected getTrackedRows(rowType: string): Row[] {
    if (rowType === 'customer') {
      return [{ rowId: 101 }];
    }

    if (rowType === 'term') {
      return [{ rowId: 201 }];
    }

    if (rowType === 'activity') {
      return [{ rowId: 301 }];
    }

    return [];
  }

  protected getTermsForCustomers(): Row[] {
    return [{ id: 202 }];
  }

  protected getActivitiesForCustomers(): Row[] {
    return [{ id: 302 }];
  }

  protected getActivitiesForTerms(): Row[] {
    return [{ id: 303 }];
  }
}

describe('demo data helpers', () => {
  beforeEach(() => {
    mockDb = null;
  });

  it('adds demo records without replacing existing app data', () => {
    const db = new FakeDemoDb();
    mockDb = db;

    appendDemoData(new Date('2026-05-06T12:00:00.000Z'));

    expect(db.operations).toContain('BEGIN');
    expect(db.operations).toContain('COMMIT');
    expect(db.operations).not.toContain('DELETE FROM customers');
    expect(db.operations).not.toContain('DELETE FROM terms');
    expect(db.operations).not.toContain('DELETE FROM activities');
    expect(db.operations.filter(sql => sql.startsWith('INSERT INTO customers'))).toHaveLength(6);
    expect(db.operations.filter(sql => sql.startsWith('INSERT INTO terms'))).toHaveLength(7);
    expect(db.operations.filter(sql => sql.startsWith('INSERT INTO activities'))).toHaveLength(8);
  });

  it('removes only scoped demo rows with id-based deletes', () => {
    const db = new FakeDbWithDemoRows();
    mockDb = db;

    removeDemoData();

    const deleteOperations = db.operations.filter(sql => sql.startsWith('DELETE FROM'));
    expect(deleteOperations).toContain('DELETE FROM activities WHERE id IN (?, ?, ?)');
    expect(deleteOperations).toContain('DELETE FROM terms WHERE id IN (?, ?)');
    expect(deleteOperations).toContain('DELETE FROM customers WHERE id IN (?)');
    expect(deleteOperations).toContain('DELETE FROM demo_records');
    expect(deleteOperations).not.toContain('DELETE FROM customers');
    expect(deleteOperations).not.toContain('DELETE FROM terms');
    expect(deleteOperations).not.toContain('DELETE FROM activities');
  });

  it('summarizes active demo rows for the settings screen', () => {
    const db = new FakeDbWithDemoRows();
    mockDb = db;

    expect(getDemoDataSummary()).toEqual({
      customers: 1,
      terms: 2,
      activities: 3,
      hasDemoData: true,
    });
  });
});
