import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Activity } from '../../constants/activity.types';
import { formatDate } from '../../utils/dateUtils';
import { SMART_PDF_DARK, uiStyles } from '../ui/theme';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const { t } = useTranslation();

  return (
    <View className="rounded-[20px] px-4 py-4" style={uiStyles.mutedSurface}>
      <View className="flex-col gap-2.5">
        <View className="flex-row items-start justify-between gap-3">
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: SMART_PDF_DARK.accent }}
          >
            <Text className="text-xs font-semibold text-white">
              {activity.type}
            </Text>
          </View>

          <Text
            className="text-sm"
            style={{ color: SMART_PDF_DARK.muted }}
          >
            {formatDate(activity.date)}
          </Text>
        </View>

        <Text
          className="text-sm leading-6"
          style={{ color: SMART_PDF_DARK.text }}
        >
          {activity.note?.trim() || t('activityItem.emptyNote')}
        </Text>
      </View>
    </View>
  );
};

export default ActivityItem;
