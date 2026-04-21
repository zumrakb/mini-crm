import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import SurfaceCard from '../components/ui/SurfaceCard';
import TermItem from '../components/term/TermItem';
import NewActivityModal from '../modals/NewActivityModal';
import { SMART_PDF_DARK, uiStyles } from '../components/ui/theme';
import { getActivitiesByDate, getActivityDatesInRange } from '../repositories/activity.repository';
import { isPendingTermStatus } from '../constants/termStatus';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import { formatDate, formatISODate, parseISODate, todayISO } from '../utils/dateUtils';

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getCalendarDays(monthDate: Date): Date[] {
  const monthStart = getMonthStart(monthDate);
  const firstGridDay = addDays(monthStart, -monthStart.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(firstGridDay, index));
}

function getDayDifference(fromDate: string, toDate: string): number {
  const from = parseISODate(fromDate);
  const to = parseISODate(toDate);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

  const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);
  const terms = useTermStore(state => state.terms);
  const loadTerms = useTermStore(state => state.load);
  const activities = useActivityStore(state => state.activities);
  const loadActivitiesByDate = useActivityStore(state => state.loadByDate);

  const today = todayISO();
  const locale = (i18n.language || 'en').startsWith('tr') ? 'tr-TR' : 'en-US';
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(parseISODate(today)));
  const [monthActivityDates, setMonthActivityDates] = useState<string[]>([]);
  const [isAgendaVisible, setIsAgendaVisible] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const refreshDashboard = useCallback(() => {
    loadCustomers();
    loadTerms();
    loadActivitiesByDate(selectedDate);

    const monthStart = getMonthStart(visibleMonth);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12, 0, 0, 0);
    setMonthActivityDates(
      getActivityDatesInRange(
        formatISODate(monthStart),
        formatISODate(monthEnd),
      ),
    );
  }, [loadActivitiesByDate, loadCustomers, loadTerms, selectedDate, visibleMonth]);

  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
    }, [refreshDashboard]),
  );

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const customerMap = useMemo(
    () =>
      new Map(customers.map(customer => [customer.id, customer])),
    [customers],
  );

  const todayActivities = useMemo(() => getActivitiesByDate(today), [customers, terms, today]);
  const pendingTerms = useMemo(
    () => terms.filter(term => isPendingTermStatus(term.status)),
    [terms],
  );
  const upcomingTerms = useMemo(
    () =>
      [...pendingTerms]
        .filter(term => {
          const daysUntilDue = getDayDifference(today, term.expectedDate);
          return daysUntilDue >= 0 && daysUntilDue <= 3;
        })
        .sort((left, right) => left.expectedDate.localeCompare(right.expectedDate))
        .slice(0, 3),
    [pendingTerms, today],
  );
  const markedDates = useMemo(() => new Set(monthActivityDates), [monthActivityDates]);
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  const goToTerms = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const openAgenda = useCallback((date: string) => {
    setSelectedDate(date);
    setIsAgendaVisible(true);
  }, []);

  const openActivityModal = useCallback((date: string) => {
    setSelectedDate(date);
    setIsActivityModalVisible(true);
  }, []);

  const handleDayPress = useCallback((date: string) => {
    openAgenda(date);
  }, [openAgenda]);

  return (
    <AppScreen>
      <NewActivityModal
        visible={isActivityModalVisible}
        initialDate={selectedDate}
        onClose={() => setIsActivityModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-6">
          <View className="flex-col gap-6">
            <View className="flex-row items-center justify-between gap-4">
              <Text
                className="flex-1 text-[24px] font-semibold tracking-[-0.5px]"
                style={uiStyles.titleText}
              >
                {t('homeDashboard.title')}
              </Text>

              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
              >
                <Text className="text-xs font-semibold" style={{ color: SMART_PDF_DARK.accent }}>
                  {formatDate(selectedDate, locale)}
                </Text>
              </View>
            </View>

            <SurfaceCard
              style={{
                borderWidth: 0,
                borderColor: 'transparent',
              }}
            >
              <View className="flex-col gap-5">
                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold" style={uiStyles.titleText}>
                      {visibleMonth.toLocaleDateString(locale, {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <AppButton
                      label={t('common.back')}
                      onPress={() => setVisibleMonth(current => addMonths(current, -1))}
                      variant="pill"
                      compact
                      iconOnly
                      iconName="chevron-back"
                    />
                    <AppButton
                      label={t('common.open')}
                      onPress={() => setVisibleMonth(current => addMonths(current, 1))}
                      variant="pill"
                      compact
                      iconOnly
                      iconName="chevron-forward"
                    />
                  </View>
                </View>

                <View className="flex-row justify-between">
                  {Array.from({ length: 7 }, (_, index) => {
                    const dayName = new Date(2026, 3, index + 19).toLocaleDateString(locale, {
                      weekday: 'short',
                    });

                    return (
                      <Text
                        key={dayName}
                        className="w-9 text-center text-xs font-semibold uppercase"
                        style={uiStyles.bodyText}
                      >
                        {dayName.slice(0, 2)}
                      </Text>
                    );
                  })}
                </View>

                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {calendarDays.map(day => {
                    const dayIso = formatISODate(day);
                    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                    const hasActivity = markedDates.has(dayIso);

                    return (
                      <TouchableOpacity
                        key={dayIso}
                        onPress={() => handleDayPress(dayIso)}
                        activeOpacity={0.85}
                        className="items-center justify-center"
                        style={{
                          width: 42,
                          height: 42,
                          opacity: isCurrentMonth ? 1 : 0.45,
                        }}
                      >
                        <View
                          className="items-center justify-center"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            overflow: 'hidden',
                            backgroundColor: hasActivity
                              ? SMART_PDF_DARK.accentSurface
                              : 'transparent',
                          }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{
                              lineHeight: 18,
                              color: hasActivity
                                ? SMART_PDF_DARK.accent
                                : SMART_PDF_DARK.text,
                            }}
                          >
                            {day.getDate()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </SurfaceCard>

            <View className="flex-col gap-4">
              <View className="flex-col gap-4">
                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold" style={uiStyles.titleText}>
                      {t('homeDashboard.upcomingTermsTitle')}
                    </Text>
                  </View>

                  <AppButton
                    label={t('homeDashboard.actions.terms')}
                    onPress={goToTerms}
                    variant="pill"
                    compact
                    iconName="arrow-forward"
                  />
                </View>

                {upcomingTerms.length ? (
                  <View className="flex-col gap-3">
                    {upcomingTerms.map(term => (
                      <TermItem key={term.id} term={term} />
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm" style={uiStyles.bodyText}>
                    {t('homeDashboard.emptyTermsTitle')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        visible={isAgendaVisible}
        transparent
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setIsAgendaVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: SMART_PDF_DARK.backdrop }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              className="rounded-t-[32px] px-6 pt-6"
              style={[
                uiStyles.modalSheet,
                { paddingBottom: Math.max(insets.bottom, 18) + 14 },
              ]}
            >
              <View
                className="mb-5 h-1.5 w-14 self-center rounded-full"
                style={uiStyles.modalHandle}
              />

              <View className="flex-col gap-5">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="min-w-0 flex-1 gap-1">
                    <Text
                      className="text-[24px] font-semibold tracking-[-0.5px]"
                      style={uiStyles.titleText}
                    >
                      {t('homeDashboard.dayAgendaTitle')}
                    </Text>
                    <Text className="text-sm" style={uiStyles.bodyText}>
                      {formatDate(selectedDate, locale)}
                    </Text>
                  </View>

                  <AppButton
                    label={t('common.cancel')}
                    onPress={() => setIsAgendaVisible(false)}
                    variant="pill"
                    compact
                    iconOnly
                    iconName="close"
                  />
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 8 }}
                >
                  {activities.length ? (
                    <View className="flex-col gap-3">
                      {activities.map(activity => {
                        const customer = customerMap.get(activity.customerId);

                        return (
                          <TouchableOpacity
                            key={activity.id}
                            onPress={() => {
                              setIsAgendaVisible(false);
                              navigation.navigate('Customers', {
                                screen: 'CustomerDetail',
                                params: { customerId: activity.customerId },
                              });
                            }}
                            activeOpacity={0.88}
                            className="rounded-[22px] px-4 py-4"
                            style={uiStyles.mutedSurface}
                          >
                            <View className="flex-col gap-2">
                              <View className="flex-row items-start justify-between gap-3">
                                <View className="min-w-0 flex-1 gap-1">
                                  <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                                    {customer?.customerName ?? t('homeDashboard.unknownCustomer')}
                                  </Text>
                                  <Text className="text-xs" style={uiStyles.bodyText}>
                                    {customer?.companyName ?? t('homeDashboard.missingCompany')}
                                  </Text>
                                </View>

                                <View
                                  className="rounded-full px-3 py-1.5"
                                  style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
                                >
                                  <Text className="text-xs font-semibold" style={{ color: SMART_PDF_DARK.accent }}>
                                    {activity.type}
                                  </Text>
                                </View>
                              </View>

                              <Text className="text-sm leading-6" style={uiStyles.titleText}>
                                {activity.note?.trim() || t('activityItem.emptyNote')}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View className="flex-col gap-3">
                      <Text className="text-sm" style={uiStyles.bodyText}>
                        {t('homeDashboard.emptyAgendaTitle')}
                      </Text>
                      <AppButton
                        label={t('homeDashboard.addActivity')}
                        onPress={() => {
                          setIsAgendaVisible(false);
                          openActivityModal(selectedDate);
                        }}
                        variant="primary"
                        iconName="add"
                      />
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </AppScreen>
  );
};

export default HomeScreen;
