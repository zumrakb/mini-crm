import type { QueryResult } from 'react-native-quick-sqlite';
import { TERM_STATUS } from '../constants/termStatus';
import { ACTIVITY_TYPE } from '../constants/activityTypes';
import { getDB } from '../db/client';
import type { Term } from '../constants/term.types';
import { todayISO } from '../utils/dateUtils';

export type TermWriteInput = Omit<Term, 'id' | 'createdAt'>;

function getRows<T>(result: QueryResult): T[] {
  return (result.rows?._array ?? []) as T[];
}

export function getAllTerms(): Term[] {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM terms ORDER BY expectedDate ASC, id DESC',
  );

  return getRows<Term>(result);
}

export function getTermsByCustomer(customerId: number): Term[] {
  const db = getDB();
  const result = db.execute(
    `
      SELECT *
      FROM terms
      WHERE customerId = ?
      ORDER BY expectedDate ASC, id DESC
    `,
    [customerId],
  );

  return getRows<Term>(result);
}

export function insertTerm(data: TermWriteInput): number {
  const db = getDB();
  const result = db.execute(
    `
      INSERT INTO terms (
        customerId,
        productName,
        orderDate,
        termDuration,
        expectedDate,
        status,
        arrivedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.customerId,
      data.productName,
      data.orderDate,
      data.termDuration,
      data.expectedDate,
      data.status,
      data.arrivedAt,
    ],
  );

  return result.insertId ?? 0;
}

export function markTermAsArrived(termId: number, customerId: number): void {
  const db = getDB();
  const today = todayISO();
  const existingResult = db.execute(
    'SELECT status FROM terms WHERE id = ? LIMIT 1',
    [termId],
  );
  const existingTerm = getRows<Pick<Term, 'status'>>(existingResult)[0];

  if (!existingTerm || existingTerm.status === TERM_STATUS.ARRIVED) {
    return;
  }

  db.execute(
    'UPDATE terms SET status = ?, arrivedAt = ? WHERE id = ?',
    [TERM_STATUS.ARRIVED, today, termId],
  );

  db.execute(
    `
      INSERT INTO activities (customerId, date, type, note, relatedTermId)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      customerId,
      today,
      ACTIVITY_TYPE.PRODUCT_ARRIVED,
      null,
      termId,
    ],
  );
}
