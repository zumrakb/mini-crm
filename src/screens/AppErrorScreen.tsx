import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import { surfaceStyles, useAppTheme } from '../components/ui/theme';

interface AppErrorScreenProps {
  onRetry?: () => void;
  showDetails?: boolean;
  details?: string;
}

const RETRY_BUTTON_STYLE = {
  marginTop: 24,
};

const AppErrorScreen: React.FC<AppErrorScreenProps> = ({
  onRetry,
  showDetails = false,
  details,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <AppScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-5 py-10"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="items-center rounded-[28px] px-5 py-8"
          style={surfaceStyles.card}
        >
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.dangerSurface }}
          >
            <Ionicons name="alert-circle-outline" size={34} color={colors.danger} />
          </View>

          <Text
            className="mt-5 text-center text-[24px] font-bold leading-8"
            style={{ color: colors.text }}
          >
            {t('errorScreen.title')}
          </Text>

          <Text
            className="mt-3 text-center text-[15px] leading-6"
            style={{ color: colors.muted }}
          >
            {t('errorScreen.body')}
          </Text>

          {onRetry ? (
            <AppButton
              label={t('errorScreen.retry')}
              variant="primary"
              iconName="refresh-outline"
              onPress={onRetry}
              style={RETRY_BUTTON_STYLE}
            />
          ) : null}

          {showDetails && details ? (
            <View
              className="mt-6 w-full rounded-[18px] px-4 py-3"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              <Text
                className="text-[12px] leading-5"
                style={{ color: colors.muted }}
              >
                {details}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default AppErrorScreen;
