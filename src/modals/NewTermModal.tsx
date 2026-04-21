import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod/v3';
import AppButton from '../components/ui/AppButton';
import AppDateField, {
  type AppDateFieldHandle,
} from '../components/ui/AppDateField';
import {
  SMART_PDF_DARK,
  TEXT_INPUT_CLASSNAME,
  uiStyles,
} from '../components/ui/theme';
import { ACTIVITY_TYPE } from '../constants/activityTypes';
import { TERM_STATUS } from '../constants/termStatus';
import type { Term } from '../constants/term.types';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import { createZodResolver } from '../utils/createZodResolver';
import { parseISODate, todayISO } from '../utils/dateUtils';

interface NewTermModalProps {
  visible: boolean;
  customerId?: number;
  term?: Term | null;
  onClose: () => void;
}

interface FormValues {
  customerId: number;
  productName: string;
  orderDate: string;
  expectedDate: string;
  note: string;
}

function getDefaultValues(customerId?: number, term?: Term | null): FormValues {
  const today = todayISO();

  return {
    customerId: term?.customerId ?? customerId ?? 0,
    productName: term?.productName ?? '',
    orderDate: term?.orderDate ?? today,
    expectedDate: term?.expectedDate ?? today,
    note: '',
  };
}

function getTermDurationLabel(
  orderDate: string,
  expectedDate: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const order = parseISODate(orderDate);
  const expected = parseISODate(expectedDate);
  const dayDiff = Math.max(
    0,
    Math.round((expected.getTime() - order.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (dayDiff === 0) {
    return t('newTerm.duration.sameDay');
  }

  if (dayDiff === 1) {
    return t('newTerm.duration.oneDay');
  }

  return t('newTerm.duration.multipleDays', { count: dayDiff });
}

const NewTermModal: React.FC<NewTermModalProps> = ({
  visible,
  customerId,
  term = null,
  onClose,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const addTerm = useTermStore(state => state.add);
  const updateTerm = useTermStore(state => state.update);
  const addActivity = useActivityStore(state => state.add);
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const orderDateFieldRef = useRef<AppDateFieldHandle | null>(null);
  const expectedDateFieldRef = useRef<AppDateFieldHandle | null>(null);
  const noteInputRef = useRef<TextInput | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          customerId: z
            .number({
              required_error: t('newTerm.validation.customerId'),
              invalid_type_error: t('newTerm.validation.customerId'),
            })
            .int()
            .positive(t('newTerm.validation.customerId')),
          productName: z.string().trim().min(1, t('newTerm.validation.productName')),
          orderDate: z
            .string()
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, t('newTerm.validation.orderDate')),
          expectedDate: z
            .string()
            .trim()
            .regex(/^\d{4}-\d{2}-\d{2}$/, t('newTerm.validation.expectedDate')),
          note: z.string().trim(),
        })
        .refine(
          values =>
            parseISODate(values.expectedDate).getTime() >=
            parseISODate(values.orderDate).getTime(),
          {
            message: t('newTerm.validation.expectedDateAfterOrder'),
            path: ['expectedDate'],
          },
        ),
    [t],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: getDefaultValues(customerId, term),
    resolver: createZodResolver(schema),
  });

  const orderDate = watch('orderDate');
  const selectedCustomerId = watch('customerId');

  useEffect(() => {
    if (visible && customerId === undefined) {
      loadCustomers();
    }
  }, [customerId, loadCustomers, visible]);

  useEffect(() => {
    reset(getDefaultValues(customerId, term));
  }, [customerId, reset, term, visible]);

  const closeModal = () => {
    reset(getDefaultValues(customerId, term));
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null);

    if (values.customerId <= 0) {
      setSubmitError(t('newTerm.submitError'));
      return;
    }

    const payload = {
      customerId: values.customerId,
      productName: values.productName.trim(),
      orderDate: values.orderDate.trim(),
      termDuration: getTermDurationLabel(
        values.orderDate.trim(),
        values.expectedDate.trim(),
        t,
      ),
      expectedDate: values.expectedDate.trim(),
      status: term?.status ?? TERM_STATUS.PENDING,
      arrivedAt: term?.status === TERM_STATUS.ARRIVED ? term.arrivedAt : null,
    };

    if (term) {
      const isUpdated = updateTerm(term.id, payload);

      if (!isUpdated) {
        setSubmitError(t('newTerm.submitError'));
        return;
      }
    } else {
      const termId = addTerm(payload);

      if (!termId) {
        setSubmitError(t('newTerm.submitError'));
        return;
      }

      addActivity({
        customerId: values.customerId,
        date: values.orderDate.trim(),
        type: ACTIVITY_TYPE.TERM_ADDED,
        note: values.note.trim() || values.productName.trim(),
        relatedTermId: termId,
      });
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
                  {term ? t('newTerm.editTitle') : t('newTerm.title')}
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
                  {customerId === undefined ? (
                    <View className="flex-col gap-2">
                      <Text
                        className="text-sm font-semibold"
                        style={uiStyles.titleText}
                      >
                        {t('newTerm.fields.customer')}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {customers.map(customer => {
                          const isSelected = selectedCustomerId === customer.id;

                          return (
                            <TouchableOpacity
                              key={customer.id}
                              onPress={() => setValue('customerId', customer.id, {
                                shouldValidate: true,
                              })}
                              activeOpacity={0.85}
                              className="rounded-full px-4 py-2.5"
                              style={
                                isSelected
                                  ? uiStyles.accentSurface
                                  : uiStyles.mutedSurface
                              }
                            >
                              <Text
                                className="text-sm font-medium"
                                style={
                                  isSelected
                                    ? uiStyles.titleText
                                    : uiStyles.bodyText
                                }
                              >
                                {customer.companyName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {errors.customerId ? (
                        <Text className="text-sm" style={uiStyles.errorText}>
                          {errors.customerId.message}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <Controller
                    control={control}
                    name="productName"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <View className="flex-col gap-2">
                        <Text
                          className="text-sm font-semibold"
                          style={uiStyles.titleText}
                        >
                          {t('newTerm.fields.productName')}
                        </Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          returnKeyType="next"
                          onSubmitEditing={() => orderDateFieldRef.current?.openPicker()}
                          placeholder={t('newTerm.placeholders.productName')}
                          placeholderTextColor={SMART_PDF_DARK.muted}
                          underlineColorAndroid="transparent"
                          selectionColor={SMART_PDF_DARK.accent}
                          className={TEXT_INPUT_CLASSNAME}
                          style={[
                            uiStyles.inputBase,
                            errors.productName ? uiStyles.inputError : null,
                          ]}
                        />
                        {errors.productName ? (
                          <Text className="text-sm" style={uiStyles.errorText}>
                            {errors.productName.message}
                          </Text>
                        ) : null}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="orderDate"
                    render={({ field: { onChange, value } }) => (
                      <AppDateField
                        ref={orderDateFieldRef}
                        label={t('newTerm.fields.orderDate')}
                        value={value}
                        onChange={onChange}
                        onChangeComplete={() => expectedDateFieldRef.current?.openPicker()}
                        maximumDate={new Date()}
                        error={errors.orderDate?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="expectedDate"
                    render={({ field: { onChange, value } }) => (
                      <AppDateField
                        ref={expectedDateFieldRef}
                        label={t('newTerm.fields.expectedDate')}
                        value={value}
                        onChange={onChange}
                        onChangeComplete={() => noteInputRef.current?.focus()}
                        minimumDate={parseISODate(orderDate)}
                        error={errors.expectedDate?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="note"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <View className="flex-col gap-2">
                        <Text
                          className="text-sm font-semibold"
                          style={uiStyles.titleText}
                        >
                          {t('newTerm.fields.note')}
                        </Text>
                        <TextInput
                          ref={noteInputRef}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          returnKeyType="done"
                          onSubmitEditing={() => {
                            void onSubmit();
                          }}
                          placeholder={t('newTerm.placeholders.note')}
                          placeholderTextColor={SMART_PDF_DARK.muted}
                          multiline
                          textAlignVertical="top"
                          underlineColorAndroid="transparent"
                          selectionColor={SMART_PDF_DARK.accent}
                          className={TEXT_INPUT_CLASSNAME}
                          style={uiStyles.textArea}
                        />
                      </View>
                    )}
                  />

                  {submitError ? (
                    <Text className="text-sm" style={uiStyles.errorText}>
                      {submitError}
                    </Text>
                  ) : null}
                </View>
              </ScrollView>

              <AppButton
                label={
                  isSubmitting
                    ? t('newTerm.submitting')
                    : term
                      ? t('newTerm.editSubmit')
                      : t('newTerm.submit')
                }
                onPress={onSubmit}
                variant="primary"
                disabled={isSubmitting}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default NewTermModal;
