import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { surfaceStyles } from './theme';

type SurfaceTone = 'default' | 'soft';

interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
}

const toneClassNames: Record<SurfaceTone, string> = {
  default: 'rounded-[30px] p-6',
  soft: 'rounded-[28px] p-6',
};

const toneStyles: Record<SurfaceTone, StyleProp<ViewStyle>> = {
  default: surfaceStyles.card,
  soft: surfaceStyles.softCard,
};

const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className,
  style,
  tone = 'default',
}) => {
  return (
    <View
      className={[toneClassNames[tone], className].filter(Boolean).join(' ')}
      style={[toneStyles[tone], style]}
    >
      {children}
    </View>
  );
};

export default SurfaceCard;
