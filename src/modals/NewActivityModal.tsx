import React, { useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v3';
import AppButton from '../components/ui/AppButton';
import AppDateField from '../components/ui/AppDateField';
import {
  CONTROL_SIZES,
  SMART_PDF_DARK,
  TEXT_INPUT_CLASSNAME,
  uiStyles,
} from '../components/ui/theme';
import { ACTIVITY_TYPES } from '../constants/activityTypes';
import type { ActivityType } from '../constants/activityTypes';
import { useActivityStore } from '../store/activity.store';
import { createZodResolver } from '../utils/createZodResolver';
import { todayISO } from '../utils/dateUtils';

interface NewActivityModalProps {
  visible: boolean;
  customerId: number;
  customerName: string;
  onClose: () => void;
}

interface FormValues {
  date: string;
  type: ActivityType;
  note: string;
}

function getDefaultValues(): FormValues {
  return {
    date: todayISO(),
    type: ACTIVITY_TYPES[0],
    note: '',
  };
}

const NewActivityModal: React.FC<NewActivityModalProps> = ({
  visible,
  customerId,
  customerName,
  onClose,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const addActivity = useActivityStore(state => state.add);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: getDefaultValues(),
    resolver: createZodResolver(schema),
  });

  const closeModal = () => {
    reset(getDefaultValues());
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null);

    const activityId = addActivity({
      customerId,
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
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
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
              <View className="flex-col gap-2">
                <Text
                  className="text-[24px] font-semibold tracking-[-0.5px]"
                  style={uiStyles.titleText}
                >
                  {t('newActivity.title')}
                </Text>
                <Text
                  className="text-sm leading-6"
                  style={uiStyles.bodyText}
                >
                  {t('newActivity.subtitle', { customerName })}
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-col gap-4">
                  <Controller
                  control={control}
                  name="date"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-col gap-2">
                        <AppDateField
                          label={t('newActivity.fields.date')}
                          value={value}
                          onChange={onChange}
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
                                <Text className="text-[12px] font-semibold text-white">
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
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
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

              <View className="flex-row gap-3">
                <AppButton
                  label={t('common.cancel')}
                  onPress={closeModal}
                  variant="secondary"
                  style={[uiStyles.borderless, { flex: 1 }]}
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default NewActivityModal;
