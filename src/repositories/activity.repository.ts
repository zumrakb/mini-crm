import type { QueryResult } from 'react-native-quick-sqlite';
import { getDB } from '../db/client';
import type { Activity } from '../constants/activity.types';

export type ActivityWriteInput = Omit<Activity, 'id' | 'createdAt'>;

function getRows<T>(result: QueryResult): T[] {
  return (result.rows?._array ?? []) as T[];
}

export function insertActivity(data: ActivityWriteInput): number {
  const db = getDB();
  const result = db.execute(
    `
      INSERT INTO activities (customerId, date, type, note, relatedTermId)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.customerId,
      data.date,
      data.type,
      data.note,
      data.relatedTermId,
    ],
  );

  return result.insertId ?? 0;
}

export function getActivitiesByCustomer(customerId: number): Activity[] {
  const db = getDB();
  const result = db.execute(
    `
      SELECT *
      FROM activities
      WHERE customerId = ?
      ORDER BY date DESC, id DESC
    `,
    [customerId],
  );

  return getRows<Activity>(result);
}

export function getAllActivities(): Activity[] {
  const db = getDB();
  const result = db.execute(
    `
      SELECT *
      FROM activities
      ORDER BY date DESC, id DESC
    `,
  );

  return getRows<Activity>(result);
}

export function getActivitiesByDate(date: string): Activity[] {
  const db = getDB();
  const result = db.execute(
    `
      SELECT *
      FROM activities
      WHERE date = ?
      ORDER BY createdAt DESC, id DESC
    `,
    [date],
  );

  return getRows<Activity>(result);
}

export function getActivityDatesInRange(startDate: string, endDate: string): string[] {
  const db = getDB();
  const result = db.execute(
    `
      SELECT DISTINCT date
      FROM activities
      WHERE date BETWEEN ? AND ?
      ORDER BY date ASC
    `,
    [startDate, endDate],
  );

  return getRows<{ date: string }>(result).map(row => row.date);
}

export function getLastActivityByCustomer(customerId: number): Activity | null {
  const db = getDB();
  const result = db.execute(
    `
      SELECT *
      FROM activities
      WHERE customerId = ?
      ORDER BY date DESC, id DESC
      LIMIT 1
    `,
    [customerId],
  );

  return getRows<Activity>(result)[0] ?? null;
}
