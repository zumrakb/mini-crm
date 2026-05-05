import { ACTIVITY_TYPE } from '../constants/activityTypes';
import { TERM_STATUS } from '../constants/termStatus';
import { getDB } from '../db/client';
import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import type { BackupPayload } from './backupUtils';
import { BACKUP_VERSION } from './backupUtils';
import { formatISODate } from './dateUtils';

const DEMO_RECORD_TABLE = 'demo_records';
const DEMO_RECORD_TYPES = {
  CUSTOMER: 'customer',
  TERM: 'term',
  ACTIVITY: 'activity',
} as const;

type DemoRecordType = (typeof DEMO_RECORD_TYPES)[keyof typeof DEMO_RECORD_TYPES];

type QueryRows = {
  rows?: {
    _array?: unknown[];
  };
};

export interface DemoDataSummary {
  customers: number;
  terms: number;
  activities: number;
  hasDemoData: boolean;
}

interface DemoDataScope {
  customerIds: number[];
  termIds: number[];
  activityIds: number[];
}

function addDays(baseDate: Date, days: number): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);

  return formatISODate(date);
}

function timestampFor(date: string, hour = 10): string {
  return `${date}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
}

function getRows<T>(result: QueryRows): T[] {
  return (result.rows?._array ?? []) as T[];
}

function getIdRows(result: QueryRows): number[] {
  return getRows<{ id?: number; rowId?: number }>(result)
    .map(row => row.id ?? row.rowId)
    .filter((id): id is number => typeof id === 'number');
}

function uniqueIds(ids: number[]): number[] {
  return Array.from(new Set(ids));
}

function placeholders(values: unknown[]): string {
  return values.map(() => '?').join(', ');
}

function ensureDemoRecordTable(db: QuickSQLiteConnection): void {
  db.execute(`
    CREATE TABLE IF NOT EXISTS ${DEMO_RECORD_TABLE} (
      rowType TEXT NOT NULL,
      rowId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (rowType, rowId)
    )
  `);
}

function getLastInsertId(db: QuickSQLiteConnection): number {
  const rows = getRows<{ id?: number }>(
    db.execute('SELECT last_insert_rowid() AS id'),
  );
  const id = rows[0]?.id;

  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Demo data could not be inserted.');
  }

  return id;
}

function getTrackedDemoIds(db: QuickSQLiteConnection, rowType: DemoRecordType): number[] {
  return getIdRows(
    db.execute(
      `SELECT rowId FROM ${DEMO_RECORD_TABLE} WHERE rowType = ?`,
      [rowType],
    ),
  );
}

function trackDemoRow(
  db: QuickSQLiteConnection,
  rowType: DemoRecordType,
  rowId: number,
): void {
  db.execute(
    `INSERT OR IGNORE INTO ${DEMO_RECORD_TABLE} (rowType, rowId) VALUES (?, ?)`,
    [rowType, rowId],
  );
}

function selectIdsByForeignKey(
  db: QuickSQLiteConnection,
  tableName: 'activities' | 'terms',
  foreignKey: 'customerId' | 'relatedTermId',
  ids: number[],
): number[] {
  if (ids.length === 0) {
    return [];
  }

  return getIdRows(
    db.execute(
      `SELECT id FROM ${tableName} WHERE ${foreignKey} IN (${placeholders(ids)})`,
      ids,
    ),
  );
}

function selectExistingIds(
  db: QuickSQLiteConnection,
  tableName: 'activities' | 'customers' | 'terms',
  ids: number[],
): number[] {
  if (ids.length === 0) {
    return [];
  }

  return getIdRows(
    db.execute(
      `SELECT id FROM ${tableName} WHERE id IN (${placeholders(ids)})`,
      ids,
    ),
  );
}

function deleteRowsByIds(
  db: QuickSQLiteConnection,
  tableName: 'activities' | 'customers' | 'terms',
  ids: number[],
): void {
  if (ids.length === 0) {
    return;
  }

  db.execute(
    `DELETE FROM ${tableName} WHERE id IN (${placeholders(ids)})`,
    ids,
  );
}

function getDemoScopeFromIds(
  db: QuickSQLiteConnection,
  customerIds: number[],
  termIds: number[],
  activityIds: number[],
): DemoDataScope {
  const scopedCustomerIds = selectExistingIds(
    db,
    'customers',
    uniqueIds(customerIds),
  );
  const scopedTermIds = selectExistingIds(db, 'terms', uniqueIds([
    ...termIds,
    ...selectIdsByForeignKey(db, 'terms', 'customerId', scopedCustomerIds),
  ]));
  const scopedActivityIds = selectExistingIds(db, 'activities', uniqueIds([
    ...activityIds,
    ...selectIdsByForeignKey(db, 'activities', 'customerId', scopedCustomerIds),
    ...selectIdsByForeignKey(db, 'activities', 'relatedTermId', scopedTermIds),
  ]));

  return {
    customerIds: scopedCustomerIds,
    termIds: scopedTermIds,
    activityIds: scopedActivityIds,
  };
}

function mergeDemoScopes(...scopes: DemoDataScope[]): DemoDataScope {
  return {
    customerIds: uniqueIds(scopes.flatMap(scope => scope.customerIds)),
    termIds: uniqueIds(scopes.flatMap(scope => scope.termIds)),
    activityIds: uniqueIds(scopes.flatMap(scope => scope.activityIds)),
  };
}

function getTrackedDemoScope(db: QuickSQLiteConnection): DemoDataScope {
  return getDemoScopeFromIds(
    db,
    getTrackedDemoIds(db, DEMO_RECORD_TYPES.CUSTOMER),
    getTrackedDemoIds(db, DEMO_RECORD_TYPES.TERM),
    getTrackedDemoIds(db, DEMO_RECORD_TYPES.ACTIVITY),
  );
}

function getLegacyDemoScope(
  db: QuickSQLiteConnection,
  payload: BackupPayload,
): DemoDataScope {
  return getDemoScopeFromIds(
    db,
    getLegacyDemoCustomerIds(db, payload),
    [],
    [],
  );
}

function getDemoDataScope(
  db: QuickSQLiteConnection,
  payload: BackupPayload,
): DemoDataScope {
  ensureDemoRecordTable(db);

  return mergeDemoScopes(
    getTrackedDemoScope(db),
    getLegacyDemoScope(db, payload),
  );
}

function deleteDemoScope(db: QuickSQLiteConnection, scope: DemoDataScope): void {
  deleteRowsByIds(db, 'activities', scope.activityIds);
  deleteRowsByIds(db, 'terms', scope.termIds);
  deleteRowsByIds(db, 'customers', scope.customerIds);
}

function getSummaryFromScope(scope: DemoDataScope): DemoDataSummary {
  const customers = scope.customerIds.length;
  const terms = scope.termIds.length;
  const activities = scope.activityIds.length;

  return {
    customers,
    terms,
    activities,
    hasDemoData: customers > 0 || terms > 0 || activities > 0,
  };
}

function getEmptyDemoSummary(): DemoDataSummary {
  return {
    customers: 0,
    terms: 0,
    activities: 0,
    hasDemoData: false,
  };
}

function getLegacyDemoCustomerIds(
  db: QuickSQLiteConnection,
  payload: BackupPayload,
): number[] {
  if (payload.customers.length === 0) {
    return [];
  }

  const conditions = payload.customers
    .map(() => '(customerName = ? AND companyName = ? AND phone = ? AND email = ?)')
    .join(' OR ');
  const params = payload.customers.flatMap(customer => [
    customer.customerName,
    customer.companyName,
    customer.phone,
    customer.email,
  ]);

  return getIdRows(
    db.execute(
      `SELECT id FROM customers WHERE ${conditions}`,
      params,
    ),
  );
}

function removeDemoDataInTransaction(
  db: QuickSQLiteConnection,
  payload: BackupPayload,
): void {
  deleteDemoScope(db, getDemoDataScope(db, payload));
  db.execute(`DELETE FROM ${DEMO_RECORD_TABLE}`);
}

export function createDemoBackupPayload(baseDate = new Date()): BackupPayload {
  const today = formatISODate(baseDate);
  const yesterday = addDays(baseDate, -1);
  const twoDaysAgo = addDays(baseDate, -2);
  const lastWeek = addDays(baseDate, -7);
  const tomorrow = addDays(baseDate, 1);
  const inThreeDays = addDays(baseDate, 3);
  const inFiveDays = addDays(baseDate, 5);
  const inNineDays = addDays(baseDate, 9);
  const inTwelveDays = addDays(baseDate, 12);
  const inSixteenDays = addDays(baseDate, 16);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    customers: [
      {
        id: 1,
        customerName: 'Cemal Aydin',
        companyName: 'Aydin CNC Atolyesi',
        phone: '+90 555 010 10 01',
        email: 'cemal.aydin@example.com',
        createdAt: timestampFor(lastWeek, 9),
        updatedAt: timestampFor(today, 9),
      },
      {
        id: 2,
        customerName: 'Murat Ergun',
        companyName: 'Eksen Kalip Makina',
        phone: '+90 555 010 10 02',
        email: 'murat.ergun@example.com',
        createdAt: timestampFor(lastWeek, 10),
        updatedAt: timestampFor(yesterday, 15),
      },
      {
        id: 3,
        customerName: 'Selin Karaca',
        companyName: 'Karaca Otomotiv Yan Sanayi',
        phone: '+90 555 010 10 03',
        email: 'selin.karaca@example.com',
        createdAt: timestampFor(twoDaysAgo, 11),
        updatedAt: timestampFor(today, 13),
      },
      {
        id: 4,
        customerName: 'Nihat Uslu',
        companyName: 'Uslu Mobilya ve Bicak Bileme',
        phone: '+90 555 010 10 04',
        email: 'nihat.uslu@example.com',
        createdAt: timestampFor(twoDaysAgo, 14),
        updatedAt: timestampFor(twoDaysAgo, 14),
      },
      {
        id: 5,
        customerName: 'Ferhat Polat',
        companyName: 'Polat Endustriyel Hirdavat',
        phone: '+90 555 010 10 05',
        email: 'ferhat.polat@example.com',
        createdAt: timestampFor(yesterday, 16),
        updatedAt: timestampFor(today, 16),
      },
      {
        id: 6,
        customerName: 'Deniz Yalcin',
        companyName: 'Yalcin Mermer ve Metal Kesim',
        phone: '+90 555 010 10 06',
        email: 'deniz.yalcin@example.com',
        createdAt: timestampFor(today, 8),
        updatedAt: timestampFor(today, 8),
      },
    ],
    terms: [
      {
        id: 1,
        customerId: 1,
        productName: 'D8 karbur parmak freze Z4 TiAlN kaplamali - 20 adet',
        orderDate: twoDaysAgo,
        termDuration: '7 gun',
        expectedDate: inFiveDays,
        status: TERM_STATUS.ORDERED,
        arrivedAt: null,
        createdAt: timestampFor(twoDaysAgo, 12),
      },
      {
        id: 2,
        customerId: 2,
        productName: 'CNMG 120408 karbur torna ucu ve MCLNR kater seti',
        orderDate: lastWeek,
        termDuration: '10 gun',
        expectedDate: tomorrow,
        status: TERM_STATUS.PENDING,
        arrivedAt: null,
        createdAt: timestampFor(lastWeek, 11),
      },
      {
        id: 3,
        customerId: 3,
        productName: 'M6-M12 HSS-E spiral kilavuz seti',
        orderDate: lastWeek,
        termDuration: '5 gun',
        expectedDate: yesterday,
        status: TERM_STATUS.ARRIVED,
        arrivedAt: yesterday,
        createdAt: timestampFor(lastWeek, 13),
      },
      {
        id: 4,
        customerId: 4,
        productName: 'Kapak serisi icin karbur kanal bicagi numunesi',
        orderDate: yesterday,
        termDuration: '4 gun',
        expectedDate: inThreeDays,
        status: TERM_STATUS.ORDERED,
        arrivedAt: null,
        createdAt: timestampFor(yesterday, 10),
      },
      {
        id: 5,
        customerId: 5,
        productName: 'HSS matkap ucu karma kutu 1-13 mm',
        orderDate: today,
        termDuration: '12 gun',
        expectedDate: inTwelveDays,
        status: TERM_STATUS.PENDING,
        arrivedAt: null,
        createdAt: timestampFor(today, 15),
      },
      {
        id: 6,
        customerId: 6,
        productName: '125 mm flap disk ve elmas kesici tas sevkiyati',
        orderDate: today,
        termDuration: '9 gun',
        expectedDate: inNineDays,
        status: TERM_STATUS.ORDERED,
        arrivedAt: null,
        createdAt: timestampFor(today, 9),
      },
      {
        id: 7,
        customerId: 1,
        productName: 'BT40 takim tutucu, ER32 pens ve salgi kontrol raporu',
        orderDate: today,
        termDuration: '16 gun',
        expectedDate: inSixteenDays,
        status: TERM_STATUS.PENDING,
        arrivedAt: null,
        createdAt: timestampFor(today, 17),
      },
    ],
    activities: [
      {
        id: 1,
        customerId: 1,
        date: lastWeek,
        type: ACTIVITY_TYPE.CALL,
        note: 'Paslanmaz islerde isinma ve capak sorunu konusuldu; TiAlN kaplamali freze onerildi.',
        relatedTermId: null,
        createdAt: timestampFor(lastWeek, 9),
      },
      {
        id: 2,
        customerId: 2,
        date: twoDaysAgo,
        type: ACTIVITY_TYPE.OFFER_SENT,
        note: 'Torna ucu, kater, yedek vida ve anahtar icin toplu teklif gonderildi.',
        relatedTermId: 2,
        createdAt: timestampFor(twoDaysAgo, 14),
      },
      {
        id: 3,
        customerId: 3,
        date: yesterday,
        type: ACTIVITY_TYPE.PRODUCT_ARRIVED,
        note: 'Kilavuz seti depoya ulasti; seri uretim oncesi deneme icin teslim bilgisi paylasildi.',
        relatedTermId: 3,
        createdAt: timestampFor(yesterday, 11),
      },
      {
        id: 4,
        customerId: 4,
        date: today,
        type: ACTIVITY_TYPE.VISIT,
        note: 'Mobilya hattinda kanal bicagi olculeri alindi, bileme yerine yeni takim denemesi planlandi.',
        relatedTermId: 4,
        createdAt: timestampFor(today, 10),
      },
      {
        id: 5,
        customerId: 5,
        date: today,
        type: ACTIVITY_TYPE.ORDER_CREATED,
        note: 'Tezgah arkasi hizli satilan matkap kutusu icin bayi siparisi acildi.',
        relatedTermId: 5,
        createdAt: timestampFor(today, 15),
      },
      {
        id: 6,
        customerId: 6,
        date: tomorrow,
        type: ACTIVITY_TYPE.CALL,
        note: 'Mermer ve metal kesim icin flap disk stok adedi ve elmas tas olcusu teyit edilecek.',
        relatedTermId: 6,
        createdAt: timestampFor(today, 16),
      },
      {
        id: 7,
        customerId: 1,
        date: inThreeDays,
        type: ACTIVITY_TYPE.NOTE,
        note: 'BT40 tutucuda salgi toleransi icin teknik sayfa ve teslim alternatifi hazirlanacak.',
        relatedTermId: 7,
        createdAt: timestampFor(today, 17),
      },
      {
        id: 8,
        customerId: 2,
        date: tomorrow,
        type: ACTIVITY_TYPE.CALL,
        note: 'Karbur uclarin kargo durumunu arayip haber ver; haftalik sarf planini sor.',
        relatedTermId: 2,
        createdAt: timestampFor(today, 18),
      },
    ],
  };
}

export function appendDemoData(baseDate = new Date()): void {
  const payload = createDemoBackupPayload(baseDate);
  const db = getDB();
  const customerIdMap = new Map<number, number>();
  const termIdMap = new Map<number, number>();

  db.execute('BEGIN');

  try {
    removeDemoDataInTransaction(db, payload);

    payload.customers.forEach(customer => {
      db.execute(
        `
          INSERT INTO customers (
            customerName,
            companyName,
            phone,
            email,
            createdAt,
            updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          customer.customerName,
          customer.companyName,
          customer.phone,
          customer.email,
          customer.createdAt,
          customer.updatedAt,
        ],
      );

      const insertedId = getLastInsertId(db);
      customerIdMap.set(customer.id, insertedId);
      trackDemoRow(db, DEMO_RECORD_TYPES.CUSTOMER, insertedId);
    });

    payload.terms.forEach(term => {
      const customerId = customerIdMap.get(term.customerId);

      if (!customerId) {
        throw new Error('Demo customer mapping is missing.');
      }

      db.execute(
        `
          INSERT INTO terms (
            customerId,
            productName,
            orderDate,
            termDuration,
            expectedDate,
            status,
            arrivedAt,
            createdAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          customerId,
          term.productName,
          term.orderDate,
          term.termDuration,
          term.expectedDate,
          term.status,
          term.arrivedAt,
          term.createdAt,
        ],
      );

      const insertedId = getLastInsertId(db);
      termIdMap.set(term.id, insertedId);
      trackDemoRow(db, DEMO_RECORD_TYPES.TERM, insertedId);
    });

    payload.activities.forEach(activity => {
      const customerId = customerIdMap.get(activity.customerId);
      const relatedTermId = activity.relatedTermId
        ? termIdMap.get(activity.relatedTermId)
        : null;

      if (!customerId || (activity.relatedTermId && !relatedTermId)) {
        throw new Error('Demo activity mapping is missing.');
      }

      db.execute(
        `
          INSERT INTO activities (
            customerId,
            date,
            type,
            note,
            relatedTermId,
            createdAt
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          customerId,
          activity.date,
          activity.type,
          activity.note,
          relatedTermId,
          activity.createdAt,
        ],
      );

      trackDemoRow(db, DEMO_RECORD_TYPES.ACTIVITY, getLastInsertId(db));
    });

    db.execute('COMMIT');
  } catch (error) {
    db.execute('ROLLBACK');
    throw error;
  }
}

export function removeDemoData(): void {
  const db = getDB();

  db.execute('BEGIN');

  try {
    removeDemoDataInTransaction(db, createDemoBackupPayload());
    db.execute('COMMIT');
  } catch (error) {
    db.execute('ROLLBACK');
    throw error;
  }
}

export function getDemoDataSummary(): DemoDataSummary {
  try {
    const db = getDB();

    return getSummaryFromScope(
      getDemoDataScope(db, createDemoBackupPayload()),
    );
  } catch {
    return getEmptyDemoSummary();
  }
}
