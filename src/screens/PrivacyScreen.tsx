import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';
import { SMART_PDF_DARK, uiStyles } from '../components/ui/theme';

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-6 pt-6">
          <View className="flex-col gap-6">
            <PageHeader title={t('privacy.title')} />

            <SurfaceCard>
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={SMART_PDF_DARK.accent} />
                </View>
                <Text className="text-[17px] font-semibold" style={uiStyles.titleText}>
                  {t('common.navTitle')}
                </Text>
              </View>
            </SurfaceCard>

            <SurfaceCard tone="soft">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: SMART_PDF_DARK.secondarySurface }}
                >
                  <Ionicons name="language-outline" size={18} color={SMART_PDF_DARK.secondaryText} />
                </View>
                <Text className="text-[17px] font-semibold" style={uiStyles.titleText}>
                  {t('common.languageTitle')}
                </Text>
              </View>
            </SurfaceCard>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default PrivacyScreen;
