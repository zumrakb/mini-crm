import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Activity } from '../../constants/activity.types';
import type { Customer } from '../../constants/customer.types';
import { formatDate } from '../../utils/dateUtils';
import { SMART_PDF_DARK, surfaceStyles } from '../ui/theme';

interface CustomerCardProps {
  customer: Customer;
  lastActivity: Activity | null;
  onPress: () => void;
}

interface ContactItem {
  key: 'phone' | 'email';
  icon: 'call-outline' | 'mail-outline';
  value: string;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  lastActivity,
  onPress,
}) => {
  const { t } = useTranslation();

  const contactItems: ContactItem[] = [
    ...(customer.phone
      ? [
          {
            key: 'phone' as const,
            icon: 'call-outline' as const,
            value: customer.phone,
          },
        ]
      : []),
    ...(customer.email
      ? [
          {
            key: 'email' as const,
            icon: 'mail-outline' as const,
            value: customer.email,
          },
        ]
      : []),
  ];

  const lastActionLabel = lastActivity?.type || t('customerCard.noActivity');
  const lastActionDate = lastActivity
    ? formatDate(lastActivity.date)
    : t('customerCard.noActivityDate');
  const initials = getInitials(customer.companyName || customer.customerName);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="overflow-hidden rounded-[32px] px-4 py-4"
      style={[
        surfaceStyles.card,
        {
          backgroundColor: SMART_PDF_DARK.surface,
          borderWidth: 0,
          borderColor: 'transparent',
        },
      ]}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1 flex-col gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-start gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
            >
              <Text
                className="text-sm font-semibold tracking-[0.2px]"
                style={{ color: SMART_PDF_DARK.accent }}
              >
                {initials || 'C'}
              </Text>
            </View>

            <View className="min-w-0 flex-1 flex-col gap-1">
              <Text
                className="text-lg font-semibold leading-6"
                style={{ color: SMART_PDF_DARK.text }}
                numberOfLines={1}
              >
                {customer.companyName}
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: SMART_PDF_DARK.muted }}
                numberOfLines={1}
              >
                {customer.customerName}
              </Text>
            </View>
            </View>

            {contactItems.length > 0 ? (
              <View className="items-end gap-1.5 pt-0.5">
                {contactItems.map(item => (
                  <View
                    key={item.key}
                    className="flex-row items-center gap-1.5"
                  >
                    <Ionicons
                      name={item.icon}
                      size={12}
                      color={SMART_PDF_DARK.muted}
                    />
                    <Text
                      className="text-[11px] leading-4"
                      style={{ color: SMART_PDF_DARK.muted }}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View
            className="h-px"
            style={{ backgroundColor: SMART_PDF_DARK.divider }}
          />

          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 flex-col gap-1">
              <Text
                className="text-[11px] font-semibold tracking-[0.6px]"
                style={{ color: SMART_PDF_DARK.muted }}
              >
                {t('customerCard.lastActionLabel')}
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: SMART_PDF_DARK.text }}
                numberOfLines={2}
              >
                {lastActionLabel}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Ionicons
                name="time-outline"
                size={14}
                color={SMART_PDF_DARK.accent}
              />
              <Text
                className="text-xs leading-5"
                style={{ color: SMART_PDF_DARK.muted }}
                numberOfLines={1}
              >
                {lastActionDate}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomerCard;
