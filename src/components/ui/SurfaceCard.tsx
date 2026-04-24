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
  default: 'rounded-[24px] p-5',
  soft: 'rounded-[24px] p-5',
};

const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className,
  style,
  tone = 'default',
}) => {
  const toneStyle = tone === 'soft' ? surfaceStyles.softCard : surfaceStyles.card;

  return (
    <View
      className={[toneClassNames[tone], className].filter(Boolean).join(' ')}
      style={[toneStyle, style]}
    >
      {children}
    </View>
  );
};

export default SurfaceCard;
