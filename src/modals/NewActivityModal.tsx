import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v3';
import AppButton from '../components/ui/AppButton';
import AppDateField, {
  type AppDateFieldHandle,
} from '../components/ui/AppDateField';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import {
  TEXT_INPUT_CLASSNAME,
  uiStyles,
  SMART_PDF_DARK,
} from '../components/ui/theme';
import { ACTIVITY_TYPES } from '../constants/activityTypes';
import type { ActivityType } from '../constants/activityTypes';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { createZodResolver } from '../utils/createZodResolver';
import { todayISO } from '../utils/dateUtils';

interface NewActivityModalProps {
  visible: boolean;
  customerId?: number;
  initialDate?: string;
  onClose: () => void;
}

interface FormValues {
  customerId: number;
  date: string;
  type: ActivityType;
  note: string;
}

function getDefaultValues(customerId?: number, initialDate?: string): FormValues {
  return {
    customerId: customerId ?? 0,
    date: initialDate ?? todayISO(),
    type: ACTIVITY_TYPES[0],
    note: '',
  };
}

const NewActivityModal: React.FC<NewActivityModalProps> = ({
  visible,
  customerId,
  initialDate,
  onClose,
}) => {
  const { t } = useTranslation();
  const addActivity = useActivityStore(state => state.add);
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const noteInputRef = useRef<TextInput | null>(null);
  const dateFieldRef = useRef<AppDateFieldHandle | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        customerId: z
          .number({
            required_error: t('newActivity.validation.customerId'),
            invalid_type_error: t('newActivity.validation.customerId'),
          })
          .int()
          .positive(t('newActivity.validation.customerId')),
        date: z
          .string()
          .trim()
          .regex(/^\d{4}-\d{2}-\d{2}$/, t('newActivity.validation.date')),
        type: z.custom<ActivityType>(
          value => ACTIVITY_TYPES.includes(value as ActivityType),
          {
            message: t('newActivity.validation.type'),
          },
        ),
        note: z.string().trim(),
      }),
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
    defaultValues: getDefaultValues(customerId, initialDate),
    resolver: createZodResolver(schema),
  });

  const selectedCustomerId = watch('customerId');

  useEffect(() => {
    if (visible && customerId === undefined) {
      loadCustomers();
    }
  }, [customerId, loadCustomers, visible]);

  useEffect(() => {
    reset(getDefaultValues(customerId, initialDate));
  }, [customerId, initialDate, reset, visible]);

  const closeModal = () => {
    reset(getDefaultValues(customerId, initialDate));
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null);

    if (values.customerId <= 0) {
      setSubmitError(t('newActivity.validation.customerId'));
      return;
    }

    const activityId = addActivity({
      customerId: values.customerId,
      date: values.date.trim(),
      type: values.type,
      note: values.note.trim() || null,
      relatedTermId: null,
    });

    if (!activityId) {
      setSubmitError(t('newActivity.submitError'));
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
            {t('newActivity.title')}
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
            {customerId === undefined ? (
              <View className="flex-col gap-2">
                <Text
                  className="text-sm font-semibold"
                  style={uiStyles.titleText}
                >
                  {t('newActivity.fields.customer')}
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
                        className="rounded-full px-4 py-2.5"
                        style={
                          isSelected
                            ? uiStyles.accentSurface
                            : uiStyles.mutedSurface
                        }
                        activeOpacity={0.85}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={isSelected ? uiStyles.titleText : uiStyles.bodyText}
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
                    name="date"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-col gap-2">
                        <AppDateField
                          ref={dateFieldRef}
                          label={t('newActivity.fields.date')}
                          value={value}
                          onChange={onChange}
                          onChangeComplete={() => noteInputRef.current?.focus()}
                          maximumDate={new Date()}
                          error={errors.date?.message}
                        />
                      </View>
                    )}
                  />

            <Controller
                    control={control}
                    name="type"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-col gap-2">
                        <Text
                          className="text-sm font-semibold"
                          style={uiStyles.titleText}
                        >
                          {t('newActivity.fields.type')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {ACTIVITY_TYPES.map(activityType => {
                            const isActive = value === activityType;

                            return (
                              <TouchableOpacity
                                key={activityType}
                                onPress={() => onChange(activityType)}
                                className="items-center justify-center rounded-full px-4"
                                style={[
                                  isActive
                                    ? uiStyles.mutedSurface
                                    : uiStyles.accentSurface,
                                  { minHeight: 34 },
                                ]}
                                activeOpacity={0.85}
                              >
                                <Text
                                  className="text-[12px] font-semibold"
                                  style={{
                                    color: isActive
                                      ? SMART_PDF_DARK.text
                                      : SMART_PDF_DARK.accent,
                                  }}
                                >
                                  {activityType}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        {errors.type ? (
                          <Text className="text-sm" style={uiStyles.errorText}>
                            {errors.type.message}
                          </Text>
                        ) : null}
                      </View>
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
                          {t('newActivity.fields.note')}
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
                          placeholder={t('newActivity.placeholders.note')}
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

        <View className="flex-row gap-3 pt-4">
          <AppButton
            label={t('common.cancel')}
            onPress={closeModal}
            variant="secondary"
            style={{ flex: 1 }}
          />

          <AppButton
            label={t('newActivity.submit')}
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

export default NewActivityModal;
