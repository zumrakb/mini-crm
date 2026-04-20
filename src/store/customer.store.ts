import { create } from 'zustand';
import type { Customer } from '../constants/customer.types';
import {
  getAllCustomers,
  getCustomerById,
  insertCustomer,
  updateCustomer,
  type CustomerWriteInput,
} from '../repositories/customer.repository';

interface CustomerStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  load: () => void;
  add: (data: CustomerWriteInput) => number | null;
  update: (customerId: number, data: CustomerWriteInput) => boolean;
  getById: (customerId: number) => Customer | null;
}

export const useCustomerStore = create<CustomerStore>(set => ({
  customers: [],
  isLoading: false,
  error: null,
  load: () => {
    set({ isLoading: true, error: null });

    try {
      const customers = getAllCustomers();
      set({ customers, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load customers.',
      });
    }
  },
  add: data => {
    try {
      const customerId = insertCustomer(data);
      set({
        customers: getAllCustomers(),
        error: null,
      });

      return customerId;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add customer.',
      });

      return null;
    }
  },
  update: (customerId, data) => {
    try {
      updateCustomer(customerId, data);
      set({
        customers: getAllCustomers(),
        error: null,
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update customer.',
      });

      return false;
    }
  },
  getById: customerId => {
    try {
      return getCustomerById(customerId);
    } catch {
      return null;
    }
  },
}));
