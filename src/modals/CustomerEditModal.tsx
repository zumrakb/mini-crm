import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/ui/AppButton';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import CustomerFormFields from '../components/customer/CustomerFormFields';
import {
  uiStyles,
} from '../components/ui/theme';
import type { Customer } from '../constants/customer.types';
import { useCustomerStore } from '../store/customer.store';
import { createZodResolver } from '../utils/createZodResolver';
import {
  createCustomerSchema,
  getCustomerFormValues,
  type CustomerFormValues,
} from '../utils/customerForm';

interface CustomerEditModalProps {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  visible,
  customer,
  onClose,
}) => {
  const { t } = useTranslation();
  const updateCustomer = useCustomerStore(state => state.update);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => createCustomerSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    defaultValues: getCustomerFormValues(customer),
    resolver: createZodResolver(schema),
    values: getCustomerFormValues(customer),
  });

  const closeModal = () => {
    reset(getCustomerFormValues(customer));
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async values => {
    if (!customer) {
      return;
    }

    setSubmitError(null);

    const updated = updateCustomer(customer.id, {
      customerName: values.customerName.trim(),
      companyName: values.companyName.trim(),
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
    });

    if (!updated) {
      setSubmitError(t('customerEdit.submitError'));
      return;
    }

    closeModal();
  });

  return (
    <BottomSheetModal
      visible={visible}
      onClose={closeModal}
    >
      <View className="flex-col gap-4" style={{ flexShrink: 1 }}>
        <View className="flex-row items-center justify-between gap-3">
          <Text
            className="text-[22px] font-semibold tracking-[-0.4px]"
            style={uiStyles.titleText}
          >
            {t('customerEdit.title')}
          </Text>

          <AppButton
            label={t('common.cancel')}
            onPress={closeModal}
            variant="pill"
            compact
            iconOnly
            iconName="close"
            style={uiStyles.borderless}
          />
        </View>

        {customer ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            <View className="flex-col gap-4">
              <CustomerFormFields
                control={control}
                errors={errors}
                onSubmitLastField={() => {
                  void onSubmit();
                }}
              />

              {submitError ? (
                <Text className="text-sm" style={uiStyles.errorText}>
                  {submitError}
                </Text>
              ) : null}
            </View>
          </ScrollView>
        ) : (
          <Text className="text-sm leading-6" style={uiStyles.bodyText}>
            {t('customerEdit.notFoundBody')}
          </Text>
        )}

        <View
          className="flex-row gap-3 border-t pt-4"
          style={{ borderTopColor: 'rgba(148, 163, 184, 0.16)' }}
        >
          <AppButton
            label={t('common.cancel')}
            onPress={closeModal}
            variant="secondary"
            style={{ flex: 1 }}
          />

          <AppButton
            label={t('customerEdit.submit')}
            onPress={() => {
              void onSubmit();
            }}
            disabled={isSubmitting || !customer}
            variant="primary"
            iconName="checkmark"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default CustomerEditModal;
