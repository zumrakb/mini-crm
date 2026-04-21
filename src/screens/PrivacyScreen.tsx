import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
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
        <View className="px-6 pt-6 pb-6">
          <View className="flex-col gap-6">
            <PageHeader
              title={t('privacy.title')}
              subtitle={t('common.navBody')}
            />

            <SurfaceCard>
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
                  >
                    <Text className="text-lg" style={{ color: SMART_PDF_DARK.accent }}>
                      🔒
                    </Text>
                  </View>
                  <Text className="text-lg font-semibold" style={uiStyles.titleText}>
                    {t('common.navTitle')}
                  </Text>
                </View>
                <Text className="text-base leading-6" style={uiStyles.bodyText}>
                  {t('common.navBody')}
                </Text>
              </View>
            </SurfaceCard>

            <SurfaceCard tone="soft">
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
                  >
                    <Text className="text-lg" style={{ color: SMART_PDF_DARK.accent }}>
                      🌐
                    </Text>
                  </View>
                  <Text className="text-lg font-semibold" style={uiStyles.titleText}>
                    {t('common.languageTitle')}
                  </Text>
                </View>
                <Text className="text-base leading-6" style={uiStyles.bodyText}>
                  {t('common.languageBody')}
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
