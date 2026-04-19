import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0e27' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e27" />

      <View className="flex-1 px-6 pt-10">
        <View className="mb-6">
          <Text className="text-white text-3xl font-bold">{t('about.title')}</Text>
          <Text className="text-slate-300 text-sm mt-2">
            {t('common.navBody')}
          </Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-white/10">
              <Text className="text-white text-lg">✅</Text>
            </View>
            <Text className="text-white text-lg font-semibold ml-3">
              {t('common.navTitle')}
            </Text>
          </View>
          <Text className="text-slate-200 text-base leading-6">
            {t('common.navBody')}
          </Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-white/10">
              <Text className="text-white text-lg">🌐</Text>
            </View>
            <Text className="text-white text-lg font-semibold ml-3">
              {t('common.languageTitle')}
            </Text>
          </View>
          <Text className="text-slate-200 text-base leading-6">
            {t('common.languageBody')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AboutScreen;
