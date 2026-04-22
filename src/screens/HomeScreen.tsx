import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import AppButton from '../components/ui/AppButton';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import AppScreen from '../components/ui/AppScreen';
import SurfaceCard from '../components/ui/SurfaceCard';
import TermItem from '../components/term/TermItem';
import NewActivityModal from '../modals/NewActivityModal';
import NewTermModal from '../modals/NewTermModal';
import { FLOATING_TAB_BAR, SMART_PDF_DARK, uiStyles, useAppTheme } from '../components/ui/theme';
import { getActivityDatesInRange, getActivitiesByDate } from '../repositories/activity.repository';
import { isPendingTermStatus } from '../constants/termStatus';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import { formatDate, formatISODate, parseISODate, todayISO } from '../utils/dateUtils';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatMonthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

function formatMonthDate(year: number, month: number): string {
  return `${formatMonthKey(year, month)}-01`;
}

function getMonthDayKeys(monthKey: string): string[] {
  const [year, month] = monthKey.split('-').map(Number);
  const monthStart = parseISODate(formatMonthDate(year, month));
  const monthEnd = new Date(year, month, 0, 12, 0, 0, 0);
  const days: string[] = [];
  const cursor = new Date(monthStart);

  while (cursor <= monthEnd) {
    days.push(formatISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function getDayDifference(fromDate: string, toDate: string): number {
  const from = parseISODate(fromDate);
  const to = parseISODate(toDate);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function getDelayUntilNextDay(): number {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 0);

  return Math.max(nextDay.getTime() - now.getTime(), 1000);
}

LocaleConfig.locales.tr = {
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün',
};

LocaleConfig.locales.en = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);
  const terms = useTermStore(state => state.terms);
  const loadTerms = useTermStore(state => state.load);
  const activities = useActivityStore(state => state.activities);
  const isActivitiesLoading = useActivityStore(state => state.isLoading);
  const activeActivityDate = useActivityStore(state => state.activeDate);
  const loadActivitiesByDate = useActivityStore(state => state.loadByDate);

  const [today, setToday] = useState(() => todayISO());
  const locale = (i18n.language || 'en').startsWith('tr') ? 'tr-TR' : 'en-US';
  const calendarLocale = (i18n.language || 'en').startsWith('tr') ? 'tr' : 'en';
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => today.slice(0, 7));
  const [monthActivityDatesByMonth, setMonthActivityDatesByMonth] = useState<Record<string, string[]>>(
    {},
  );
  const [isAgendaVisible, setIsAgendaVisible] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const previousTodayRef = useRef(today);
  const isAgendaLoading = isActivitiesLoading || activeActivityDate !== selectedDate;

  const loadDashboardLists = useCallback(() => {
    loadCustomers();
    loadTerms();
  }, [loadCustomers, loadTerms]);

  const refreshMonthActivityDates = useCallback((monthKey: string) => {
    if (Object.prototype.hasOwnProperty.call(monthActivityDatesByMonth, monthKey)) {
      return;
    }

    const [year, month] = monthKey.split('-').map(Number);
    const monthStart = parseISODate(formatMonthDate(year, month));
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12, 0, 0, 0);
    const nextDates = getActivityDatesInRange(
      formatISODate(monthStart),
      formatISODate(monthEnd),
    );

    setMonthActivityDatesByMonth(current => ({
      ...current,
      [monthKey]: nextDates,
    }));
  }, [monthActivityDatesByMonth]);

  const handleVisibleMonthChange = useCallback((monthData: DateData) => {
    const nextVisibleMonth = formatMonthKey(monthData.year, monthData.month);

    setVisibleMonth(currentMonth => (
      currentMonth === nextVisibleMonth ? currentMonth : nextVisibleMonth
    ));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardLists();
      loadActivitiesByDate(selectedDate);
      refreshMonthActivityDates(visibleMonth);
    }, [loadActivitiesByDate, loadDashboardLists, refreshMonthActivityDates, selectedDate, visibleMonth]),
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      setToday(todayISO());
    }, getDelayUntilNextDay());

    return () => clearTimeout(timerId);
  }, [today]);

  useEffect(() => {
    loadDashboardLists();
  }, [loadDashboardLists]);

  useEffect(() => {
    loadActivitiesByDate(selectedDate);
  }, [loadActivitiesByDate, selectedDate]);

  useEffect(() => {
    refreshMonthActivityDates(visibleMonth);
  }, [refreshMonthActivityDates, visibleMonth]);

  useEffect(() => {
    const previousToday = previousTodayRef.current;

    if (selectedDate === previousToday && today !== previousToday) {
      setSelectedDate(today);
      setVisibleMonth(today.slice(0, 7));
    }

    previousTodayRef.current = today;
  }, [selectedDate, today]);

  useEffect(() => {
    LocaleConfig.defaultLocale = calendarLocale;
  }, [calendarLocale]);

  const customerMap = useMemo(
    () =>
      new Map(customers.map(customer => [customer.id, customer])),
    [customers],
  );

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

  const todayActivities = useMemo(
    () => getActivitiesByDate(today).slice(0, 3),
    [today],
  );

  const markedDates = useMemo(() => {
    const monthDates = monthActivityDatesByMonth[visibleMonth] ?? [];
    const isMonthLoaded = Object.prototype.hasOwnProperty.call(
      monthActivityDatesByMonth,
      visibleMonth,
    );
    const nextMarkedDates = (isMonthLoaded ? getMonthDayKeys(visibleMonth) : []).reduce<Record<string, {
      marked?: boolean;
      dotColor?: string;
      selected?: boolean;
      selectedColor?: string;
      selectedTextColor?: string;
    }>>((result, date) => {
      result[date] = {};
      return result;
    }, {});

    monthDates.forEach(date => {
      nextMarkedDates[date] = {
        ...nextMarkedDates[date],
        marked: true,
        dotColor: colors.accent,
      };
    });

    if (selectedDate in nextMarkedDates) {
      nextMarkedDates[selectedDate] = {
        ...nextMarkedDates[selectedDate],
        selected: true,
        selectedColor: colors.accentSurface,
        selectedTextColor: colors.accent,
      };
    }

    return nextMarkedDates;
  }, [colors.accent, colors.accentSurface, monthActivityDatesByMonth, selectedDate, visibleMonth]);

  const goToTerms = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const openAgenda = useCallback((date: string) => {
    setSelectedDate(date);
    loadActivitiesByDate(date);
    setIsAgendaVisible(true);
  }, [loadActivitiesByDate]);

  const openActivityModal = useCallback((date: string) => {
    setSelectedDate(date);
    setIsActivityModalVisible(true);
  }, []);

  const openTermModal = useCallback((date: string) => {
    setSelectedDate(date);
    setIsTermModalVisible(true);
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
      <NewTermModal
        visible={isTermModalVisible}
        initialDate={selectedDate}
        onClose={() => setIsTermModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
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
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color:
                      SMART_PDF_DARK.statusBar === 'light-content'
                        ? SMART_PDF_DARK.accent
                        : SMART_PDF_DARK.accentMuted,
                  }}
                >
                  {formatDate(selectedDate, locale)}
                </Text>
              </View>
            </View>

            <SurfaceCard
              style={{
                backgroundColor: colors.surface,
                borderWidth: 0,
                borderColor: 'transparent',
              }}
            >
              <View className="overflow-hidden rounded-[24px]">
                <Calendar
                  key={`${calendarLocale}-${colors.statusBar}`}
                  current={`${visibleMonth}-01`}
                  markedDates={markedDates}
                  markingType="dot"
                  displayLoadingIndicator={!Object.prototype.hasOwnProperty.call(
                    monthActivityDatesByMonth,
                    visibleMonth,
                  )}
                  enableSwipeMonths
                  firstDay={1}
                  onDayPress={day => handleDayPress(day.dateString)}
                  onMonthChange={handleVisibleMonthChange}
                  theme={{
                    calendarBackground: colors.surface,
                    textSectionTitleColor: colors.muted,
                    monthTextColor: colors.text,
                    dayTextColor: colors.text,
                    todayTextColor: colors.accent,
                    selectedDayBackgroundColor: colors.accentSurface,
                    selectedDayTextColor: colors.accent,
                    textDisabledColor: colors.muted,
                    arrowColor: colors.accent,
                    indicatorColor: colors.accent,
                    dotColor: colors.accent,
                    selectedDotColor: colors.accent,
                    textMonthFontSize: 18,
                    textMonthFontWeight: '700',
                    textDayFontSize: 15,
                    textDayHeaderFontSize: 12,
                    textDayHeaderFontWeight: '700',
                  }}
                  style={{
                    borderWidth: 0,
                    borderColor: 'transparent',
                  }}
                />
              </View>
            </SurfaceCard>

            <View className="flex-col gap-4">
              <View className="flex-col gap-4">
                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold" style={uiStyles.titleText}>
                      {t('homeDashboard.todayTasksTitle')}
                    </Text>
                  </View>
                </View>

                {todayActivities.length ? (
                  <View className="flex-col gap-3">
                    {todayActivities.map(activity => {
                      const customer = customerMap.get(activity.customerId);

                      return (
                        <TouchableOpacity
                          key={activity.id}
                          onPress={() =>
                            navigation.navigate('Customers', {
                              screen: 'CustomerDetail',
                              params: { customerId: activity.customerId },
                            })
                          }
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
                                <Text
                                  className="text-xs font-semibold"
                                  style={{
                                    color:
                                      SMART_PDF_DARK.statusBar === 'light-content'
                                        ? SMART_PDF_DARK.accent
                                        : SMART_PDF_DARK.accentMuted,
                                  }}
                                >
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
                  <SurfaceCard tone="soft">
                    <Text className="text-sm" style={uiStyles.bodyText}>
                      {t('homeDashboard.emptyTodayTasks')}
                    </Text>
                  </SurfaceCard>
                )}
              </View>

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
                  <SurfaceCard tone="soft">
                    <Text className="text-sm" style={uiStyles.bodyText}>
                      {t('homeDashboard.emptyTermsTitle')}
                    </Text>
                  </SurfaceCard>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomSheetModal
        visible={isAgendaVisible}
        onClose={() => setIsAgendaVisible(false)}
      >
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-[22px] font-semibold tracking-[-0.4px]"
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

          <View className="flex-row gap-3">
            <AppButton
              label={t('homeDashboard.addActivity')}
              onPress={() => {
                setIsAgendaVisible(false);
                openActivityModal(selectedDate);
              }}
              variant="primary"
              iconName="add"
              style={{ flex: 1 }}
            />
            <AppButton
              label={t('homeDashboard.actions.terms')}
              onPress={() => {
                setIsAgendaVisible(false);
                openTermModal(selectedDate);
              }}
              variant="secondary"
              iconName="calendar-outline"
              style={{ flex: 1 }}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {isAgendaLoading ? (
              <View className="items-center gap-3 rounded-[24px] px-5 py-8">
                <ActivityIndicator color={SMART_PDF_DARK.accent} />
                <Text className="text-center text-sm leading-6" style={uiStyles.bodyText}>
                  {t('customerDetail.loadingActivities')}
                </Text>
              </View>
            ) : activities.length ? (
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
                            <Text
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  SMART_PDF_DARK.statusBar === 'light-content'
                                    ? SMART_PDF_DARK.accent
                                    : SMART_PDF_DARK.accentMuted,
                              }}
                            >
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
              <SurfaceCard tone="soft">
                <Text className="text-sm" style={uiStyles.bodyText}>
                  {t('homeDashboard.emptyAgendaTitle')}
                </Text>
              </SurfaceCard>
            )}
          </ScrollView>
        </View>
      </BottomSheetModal>
    </AppScreen>
  );
};

export default HomeScreen;
