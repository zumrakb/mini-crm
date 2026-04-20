import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';

const TermListScreen: React.FC = () => {
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
              title={t('phaseZero.termsScreenTitle')}
              subtitle={t('phaseZero.termsScreenBody')}
            />

            <SurfaceCard>
              <View className="flex-col gap-3">
                <Text className="text-lg font-semibold text-white">
                  {t('common.terms')}
                </Text>
                <Text className="text-sm leading-6 text-slate-300">
                  {t('phaseZero.termsScreenHint')}
                </Text>
              </View>
            </SurfaceCard>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default TermListScreen;
