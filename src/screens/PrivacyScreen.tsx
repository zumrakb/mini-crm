import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';

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
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Text className="text-white text-lg">🔒</Text>
                  </View>
                  <Text className="text-white text-lg font-semibold">
                    {t('common.navTitle')}
                  </Text>
                </View>
                <Text className="text-slate-200 text-base leading-6">
                  {t('common.navBody')}
                </Text>
              </View>
            </SurfaceCard>

            <SurfaceCard tone="soft">
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Text className="text-white text-lg">🌐</Text>
                  </View>
                  <Text className="text-white text-lg font-semibold">
                    {t('common.languageTitle')}
                  </Text>
                </View>
                <Text className="text-slate-200 text-base leading-6">
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
