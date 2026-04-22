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
import { uiStyles } from '../components/ui/theme';
import { useCustomerStore } from '../store/customer.store';
import CustomerFormFields from '../components/customer/CustomerFormFields';
import { createZodResolver } from '../utils/createZodResolver';
import {
  createCustomerSchema,
  getCustomerFormValues,
  type CustomerFormValues,
} from '../utils/customerForm';

interface NewCustomerModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const addCustomer = useCustomerStore(state => state.add);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => createCustomerSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    defaultValues: getCustomerFormValues(),
    resolver: createZodResolver(schema),
  });

  const closeModal = () => {
    reset(getCustomerFormValues());
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null);

    const customerId = addCustomer({
      customerName: values.customerName.trim(),
      companyName: values.companyName.trim(),
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
    });

    if (!customerId) {
      setSubmitError(t('newCustomer.submitError'));
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
            {t('newCustomer.title')}
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
            label={t('newCustomer.submit')}
            onPress={() => {
              void onSubmit();
            }}
            disabled={isSubmitting}
            variant="primary"
            iconName="checkmark"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default NewCustomerModal;
