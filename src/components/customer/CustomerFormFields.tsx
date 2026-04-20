import React from 'react';
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
}

const CustomerFormFields: React.FC<CustomerFormFieldsProps> = ({
  control,
  errors,
}) => {
  const { t } = useTranslation();

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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
