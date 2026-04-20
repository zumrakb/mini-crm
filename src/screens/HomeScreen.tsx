import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en').slice(0, 2);

  const languageButtons = [
    { code: 'en', label: t('languages.english'), flag: '🇺🇸' },
    { code: 'tr', label: t('languages.turkish'), flag: '🇹🇷' },
  ];

  const moduleCards = [
    {
      key: 'home',
      icon: '⌂',
      title: t('phaseZero.homeCardTitle'),
      description: t('phaseZero.homeCardBody'),
      accentColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      key: 'customers',
      icon: '◎',
      title: t('phaseZero.customersCardTitle'),
      description: t('phaseZero.customersCardBody'),
      accentColor: 'rgba(34, 197, 94, 0.18)',
    },
    {
      key: 'terms',
      icon: '◌',
      title: t('phaseZero.termsCardTitle'),
      description: t('phaseZero.termsCardBody'),
      accentColor: 'rgba(250, 204, 21, 0.18)',
    },
  ];

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
              title={t('home.welcome')}
              subtitle={t('phaseZero.projectSubtitle')}
              badge={
                <View
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Text className="text-xs font-semibold uppercase tracking-widest text-slate-200">
                    {t('phaseZero.badge')}
                  </Text>
                </View>
              }
            />

            <SurfaceCard>
              <View className="flex-col gap-3">
                <Text className="text-xl font-semibold text-white">
                  {t('phaseZero.projectTitle')}
                </Text>
                <Text className="text-sm leading-6 text-slate-300">
                  {t('phaseZero.projectBody')}
                </Text>
              </View>
            </SurfaceCard>

            <SurfaceCard>
              <View className="flex-col gap-4">
                <View className="flex-col gap-2">
                  <Text className="text-xl font-semibold text-white">
                    {t('phaseZero.languageTitle')}
                  </Text>
                  <Text className="text-sm leading-6 text-slate-300">
                    {t('phaseZero.languageBody')}
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {languageButtons.map(button => {
                    const isActive = currentLanguage === button.code;
                    return (
                      <AppButton
                        key={button.code}
                        label={`${button.flag} ${button.label}`}
                        onPress={() => i18n.changeLanguage(button.code)}
                        variant="secondary"
                        style={{
                          width: '48%',
                          backgroundColor: isActive
                            ? 'rgba(56, 189, 248, 0.18)'
                            : 'rgba(255, 255, 255, 0.06)',
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            </SurfaceCard>

            <View className="flex-col gap-4">
              {moduleCards.map(card => (
                <SurfaceCard
                  key={card.key}
                  tone="soft"
                  className="p-5"
                >
                  <View className="flex-col gap-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: card.accentColor }}
                      >
                        <Text className="text-xl text-white">{card.icon}</Text>
                      </View>
                      <Text className="flex-1 text-lg font-semibold text-white">
                        {card.title}
                      </Text>
                    </View>
                    <Text className="text-sm leading-6 text-slate-300">
                      {card.description}
                    </Text>
                  </View>
                </SurfaceCard>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default HomeScreen;
