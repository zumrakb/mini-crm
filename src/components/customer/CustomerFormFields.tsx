import React, { useRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { CustomerFormValues } from '../../utils/customerForm';
import { SMART_PDF_DARK, TEXT_INPUT_CLASSNAME, uiStyles } from '../ui/theme';

interface CustomerFormFieldsProps {
  control: Control<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  onSubmitLastField?: () => void;
}

const CustomerFormFields: React.FC<CustomerFormFieldsProps> = ({
  control,
  errors,
  onSubmitLastField,
}) => {
  const { t } = useTranslation();
  const companyNameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);

  return (
    <View className="flex-col gap-4">
      <Controller
        control={control}
        name="customerName"
        render={({ field: { onBlur, onChange, value } }) => (
          <View className="flex-col gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {t('newCustomer.fields.customerName')}
            </Text>
            <TextInput
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => companyNameRef.current?.focus()}
              placeholder={t('newCustomer.placeholders.customerName')}
              placeholderTextColor={SMART_PDF_DARK.muted}
              underlineColorAndroid="transparent"
              selectionColor={SMART_PDF_DARK.accent}
              className={TEXT_INPUT_CLASSNAME}
              style={[
                uiStyles.inputBase,
                errors.customerName ? uiStyles.inputError : null,
              ]}
            />
            {errors.customerName ? (
              <Text className="text-sm" style={uiStyles.errorText}>
                {errors.customerName.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="companyName"
        render={({ field: { onBlur, onChange, value } }) => (
          <View className="flex-col gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {t('newCustomer.fields.companyName')}
            </Text>
            <TextInput
              ref={companyNameRef}
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => phoneRef.current?.focus()}
              placeholder={t('newCustomer.placeholders.companyName')}
              placeholderTextColor={SMART_PDF_DARK.muted}
              underlineColorAndroid="transparent"
              selectionColor={SMART_PDF_DARK.accent}
              className={TEXT_INPUT_CLASSNAME}
              style={[
                uiStyles.inputBase,
                errors.companyName ? uiStyles.inputError : null,
              ]}
            />
            {errors.companyName ? (
              <Text className="text-sm" style={uiStyles.errorText}>
                {errors.companyName.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onBlur, onChange, value } }) => (
          <View className="flex-col gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {t('newCustomer.fields.phone')}
            </Text>
            <TextInput
              ref={phoneRef}
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => emailRef.current?.focus()}
              placeholder={t('newCustomer.placeholders.phone')}
              placeholderTextColor={SMART_PDF_DARK.muted}
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
              selectionColor={SMART_PDF_DARK.accent}
              className={TEXT_INPUT_CLASSNAME}
              style={uiStyles.inputBase}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <View className="flex-col gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {t('newCustomer.fields.email')}
            </Text>
            <TextInput
              ref={emailRef}
              returnKeyType="done"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={onSubmitLastField}
              placeholder={t('newCustomer.placeholders.email')}
              placeholderTextColor={SMART_PDF_DARK.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              selectionColor={SMART_PDF_DARK.accent}
              className={TEXT_INPUT_CLASSNAME}
              style={[
                uiStyles.inputBase,
                errors.email ? uiStyles.inputError : null,
              ]}
            />
            {errors.email ? (
              <Text className="text-sm" style={uiStyles.errorText}>
                {errors.email.message}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

export default CustomerFormFields;
