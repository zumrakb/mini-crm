import React from 'react';
import { Text, View } from 'react-native';
import { SMART_PDF_DARK } from './theme';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <View className="py-2">
      <Text
        className="text-[15px] font-semibold"
        style={{ color: SMART_PDF_DARK.text }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className="mt-1 text-[13px] leading-6"
          style={{ color: SMART_PDF_DARK.muted }}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
};

export default EmptyState;
