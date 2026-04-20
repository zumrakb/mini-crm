import { create } from 'zustand';
import type { Term } from '../constants/term.types';
import {
  getAllTerms,
  getTermsByCustomer,
  insertTerm,
  markTermAsArrived,
  type TermWriteInput,
} from '../repositories/term.repository';

interface TermStore {
  terms: Term[];
  isLoading: boolean;
  error: string | null;
  activeCustomerId: number | null;
  load: () => void;
  loadByCustomer: (customerId: number) => void;
  add: (data: TermWriteInput) => number | null;
  markAsArrived: (termId: number, customerId: number) => void;
}

export const useTermStore = create<TermStore>(set => ({
  terms: [],
  isLoading: false,
  error: null,
  activeCustomerId: null,
  load: () => {
    set({
      isLoading: true,
      error: null,
      activeCustomerId: null,
    });

    try {
      const terms = getAllTerms();
      set({ terms, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load terms.',
      });
    }
  },
  loadByCustomer: customerId => {
    set({
      isLoading: true,
      error: null,
      activeCustomerId: customerId,
    });

    try {
      const terms = getTermsByCustomer(customerId);
      set({ terms, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load terms.',
      });
    }
  },
  add: data => {
    try {
      const termId = insertTerm(data);

      set(state => {
        const terms = state.activeCustomerId !== null
          ? getTermsByCustomer(state.activeCustomerId)
          : getAllTerms();

        return {
          terms,
          error: null,
        };
      });

      return termId;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add term.',
      });

      return null;
    }
  },
  markAsArrived: (termId, customerId) => {
    try {
      markTermAsArrived(termId, customerId);

      set(state => {
        const terms = state.activeCustomerId !== null
          ? getTermsByCustomer(state.activeCustomerId)
          : getAllTerms();

        return {
          terms,
          error: null,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update term.',
      });
    }
  },
}));
