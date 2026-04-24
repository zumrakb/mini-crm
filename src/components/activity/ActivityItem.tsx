import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Activity } from '../../constants/activity.types';
import { formatDate } from '../../utils/dateUtils';
import { SMART_PDF_DARK, surfaceStyles } from '../ui/theme';

interface ActivityItemProps {
  activity: Activity;
}

function getActivityTone(activityType: string) {
  const normalizedType = activityType.toLocaleLowerCase('tr-TR');

  if (normalizedType.includes('call') || normalizedType.includes('arama')) {
    return {
      icon: 'call',
      background: SMART_PDF_DARK.accentSurface,
      iconColor: SMART_PDF_DARK.accent,
    } as const;
  }

  if (normalizedType.includes('mail') || normalizedType.includes('email')) {
    return {
      icon: 'mail',
      background: SMART_PDF_DARK.secondarySurface,
      iconColor: SMART_PDF_DARK.secondaryText,
    } as const;
  }

  return {
    icon: 'document-text',
    background: SMART_PDF_DARK.surfaceMuted,
    iconColor: SMART_PDF_DARK.text,
  } as const;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const { t } = useTranslation();
  const tone = getActivityTone(activity.type);

  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: tone.background }}
        >
          <Ionicons name={tone.icon} size={16} color={tone.iconColor} />
        </View>
        <View
          className="mt-2 w-px flex-1"
          style={{ backgroundColor: 'rgba(225, 227, 224, 0.9)' }}
        />
      </View>

      <View className="flex-1 rounded-[24px] px-5 py-5" style={surfaceStyles.card}>
        <View className="flex-col gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <Text
              className="flex-1 text-[16px] font-semibold leading-5 tracking-[-0.35px]"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {activity.type}
            </Text>
            <Text
              className="text-[12px] leading-5"
              style={{ color: SMART_PDF_DARK.muted }}
            >
              {formatDate(activity.date)}
            </Text>
          </View>

          <Text
            className="text-[14px] leading-6"
            style={{ color: SMART_PDF_DARK.muted }}
          >
            {activity.note?.trim() || t('activityItem.emptyNote')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ActivityItem;
