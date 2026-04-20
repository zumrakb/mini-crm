import type { TFunction } from 'i18next';
import { z } from 'zod/v3';
import type { Customer } from '../constants/customer.types';

export interface CustomerFormValues {
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
}

type CustomerFormSource = Pick<
  Customer,
  'customerName' | 'companyName' | 'phone' | 'email'
>;

export function createCustomerSchema(t: TFunction) {
  return z.object({
    customerName: z
      .string()
      .trim()
      .min(1, t('newCustomer.validation.customerName')),
    companyName: z
      .string()
      .trim()
      .min(1, t('newCustomer.validation.companyName')),
    phone: z.string().trim(),
    email: z
      .string()
      .trim()
      .refine(
        value =>
          value.length === 0 || z.string().email().safeParse(value).success,
        t('newCustomer.validation.email'),
      ),
  });
}

export function getCustomerFormValues(
  customer?: CustomerFormSource | null,
): CustomerFormValues {
  return {
    customerName: customer?.customerName ?? '',
    companyName: customer?.companyName ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
  };
}
