import React from 'react';
import { Text, View } from 'react-native';
import SurfaceCard from './SurfaceCard';
import { SMART_PDF_DARK } from './theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <SurfaceCard tone="soft">
      <View className="flex-col gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
        >
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: SMART_PDF_DARK.accent }}
          />
        </View>
        <Text
          className="text-lg font-semibold"
          style={{ color: SMART_PDF_DARK.text }}
        >
          {title}
        </Text>
        <Text
          className="text-sm leading-6"
          style={{ color: SMART_PDF_DARK.muted }}
        >
          {description}
        </Text>
      </View>
    </SurfaceCard>
  );
};

export default EmptyState;
