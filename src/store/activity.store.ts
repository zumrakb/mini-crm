import { create } from 'zustand';
import type { Activity } from '../constants/activity.types';
import {
  getActivitiesByCustomer,
  getActivitiesByDate,
  getLastActivityByCustomer,
  insertActivity,
  type ActivityWriteInput,
} from '../repositories/activity.repository';

interface ActivityStore {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  activeCustomerId: number | null;
  activeDate: string | null;
  loadByCustomer: (customerId: number) => void;
  loadByDate: (date: string) => void;
  add: (data: ActivityWriteInput) => number | null;
  getLastByCustomer: (customerId: number) => Activity | null;
}

export const useActivityStore = create<ActivityStore>(set => ({
  activities: [],
  isLoading: false,
  error: null,
  activeCustomerId: null,
  activeDate: null,
  loadByCustomer: customerId => {
    set({
      activities: [],
      isLoading: true,
      error: null,
      activeCustomerId: customerId,
      activeDate: null,
    });

    try {
      const activities = getActivitiesByCustomer(customerId);
      set({ activities, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load activities.',
      });
    }
  },
  loadByDate: date => {
    set({
      activities: [],
      isLoading: true,
      error: null,
      activeCustomerId: null,
      activeDate: date,
    });

    try {
      const activities = getActivitiesByDate(date);
      set({ activities, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load activities.',
      });
    }
  },
  add: data => {
    try {
      const activityId = insertActivity(data);

      set(state => {
        const activities = state.activeCustomerId !== null
          ? getActivitiesByCustomer(state.activeCustomerId)
          : state.activeDate !== null
            ? getActivitiesByDate(state.activeDate)
            : state.activities;

        return {
          activities,
          error: null,
        };
      });

      return activityId;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add activity.',
      });

      return null;
    }
  },
  getLastByCustomer: customerId => {
    try {
      return getLastActivityByCustomer(customerId);
    } catch {
      return null;
    }
  },
}));
