import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/ui/AppButton';
import { SMART_PDF_DARK, uiStyles } from '../components/ui/theme';
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
  const insets = useSafeAreaInsets();
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
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={closeModal}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: SMART_PDF_DARK.backdrop }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            className="rounded-t-[32px] px-6 pt-6"
            style={[
              uiStyles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 18) + 14 },
            ]}
          >
            <View
              className="mb-5 h-1.5 w-14 self-center rounded-full"
              style={uiStyles.modalHandle}
            />

            <View className="flex-col gap-5">
              <View className="flex-row items-center justify-between gap-3">
                <Text
                  className="text-[24px] font-semibold tracking-[-0.5px]"
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

              <View className="flex-row gap-3">
                <AppButton
                  label={t('common.cancel')}
                  onPress={closeModal}
                  variant="secondary"
                  style={[uiStyles.borderless, { flex: 1 }]}
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default NewCustomerModal;
