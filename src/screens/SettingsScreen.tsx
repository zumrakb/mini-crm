import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';

const SettingsScreen: React.FC = () => {
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
              title={t('phaseZero.settingsScreenTitle')}
              subtitle={t('phaseZero.settingsScreenBody')}
            />

            <SurfaceCard>
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(56, 189, 248, 0.18)' }}
                  >
                    <Text className="text-lg text-white">↥</Text>
                  </View>
                  <Text className="text-lg font-semibold text-white">
                    {t('phaseZero.settingsBackupTitle')}
                  </Text>
                </View>
                <Text className="text-sm leading-6 text-slate-300">
                  {t('phaseZero.settingsBackupBody')}
                </Text>

                <View className="flex-col gap-3 pt-2">
                  <AppButton
                    label={t('phaseZero.settingsExportLabel')}
                    description={t('phaseZero.settingsComingSoon')}
                    disabled
                    iconName="download-outline"
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    }}
                  />

                  <AppButton
                    label={t('phaseZero.settingsImportLabel')}
                    description={t('phaseZero.settingsComingSoon')}
                    disabled
                    iconName="cloud-upload-outline"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    }}
                  />
                </View>
              </View>
            </SurfaceCard>

            <SurfaceCard tone="soft" className="p-5">
              <View className="flex-col gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.18)' }}
                  >
                    <Text className="text-lg text-white">⚙</Text>
                  </View>
                  <Text className="text-lg font-semibold text-white">
                    {t('common.settings')}
                  </Text>
                </View>
                <Text className="text-sm leading-6 text-slate-300">
                  {t('phaseZero.settingsScreenHint')}
                </Text>
              </View>
            </SurfaceCard>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default SettingsScreen;
