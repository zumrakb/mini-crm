import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TermItem from '../components/term/TermItem';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import SurfaceCard from '../components/ui/SurfaceCard';
import { FLOATING_TAB_BAR, SHADOWS, SMART_PDF_DARK, uiStyles } from '../components/ui/theme';
import { isPendingTermStatus, TERM_STATUS } from '../constants/termStatus';
import type { Customer } from '../constants/customer.types';
import NewTermModal from '../modals/NewTermModal';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import { parseISODate } from '../utils/dateUtils';

type SortOrder = 'asc' | 'desc';
type DateRange = 'all' | 'week' | 'month' | '3months' | '6months' | 'year';
type StatusFilter = 'all' | 'pending' | 'completed';

interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

function subtractMonths(baseDate: Date, months: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() - months);
  return nextDate;
}

function isWithinRange(dateValue: string, range: DateRange): boolean {
  if (range === 'all') {
    return true;
  }

  const targetDate = parseISODate(dateValue);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  if (range === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (range === '3months') {
    return targetDate >= subtractMonths(today, 3) && targetDate <= today;
  } else if (range === '6months') {
    return targetDate >= subtractMonths(today, 6) && targetDate <= today;
  } else if (range === 'year') {
    return targetDate >= subtractMonths(today, 12) && targetDate <= today;
  }

  return targetDate >= startDate && targetDate <= today;
}

const FilterChip = ({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) => {
  const styles = createStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="rounded-full px-4 py-2.5"
      style={isActive ? styles.activeChip : styles.inactiveChip}
    >
      <Text
        className="text-sm font-semibold"
        style={isActive ? styles.activeChipText : styles.inactiveChipText}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const TermListScreen: React.FC = () => {
  const { t } = useTranslation();
  const terms = useTermStore(state => state.terms);
  const isLoading = useTermStore(state => state.isLoading);
  const error = useTermStore(state => state.error);
  const loadTerms = useTermStore(state => state.load);
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);

  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useFocusEffect(
    useCallback(() => {
      loadTerms();
      loadCustomers();
    }, [loadCustomers, loadTerms]),
  );

  const customerMap = useMemo(() => {
    return customers.reduce<Record<number, Customer>>((accumulator, customer) => {
      accumulator[customer.id] = customer;
      return accumulator;
    }, {});
  }, [customers]);

  const companyOptions = useMemo<FilterChipOption<string>[]>(() => {
    const uniqueCustomers = terms
      .map(term => customerMap[term.customerId])
      .filter((customer): customer is Customer => Boolean(customer))
      .filter(
        (customer, index, array) =>
          array.findIndex(item => item.id === customer.id) === index,
      )
      .sort((left, right) => left.companyName.localeCompare(right.companyName, 'tr'));

    return [
      { value: 'all', label: t('termsScreen.filters.allCompanies') },
      ...uniqueCustomers.map(customer => ({
        value: `${customer.id}`,
        label: customer.companyName,
      })),
    ];
  }, [customerMap, t, terms]);

  const dateOptions = useMemo<FilterChipOption<DateRange>[]>(
    () => [
      { value: 'all', label: t('termsScreen.filters.allDates') },
      { value: 'week', label: t('termsScreen.filters.lastWeek') },
      { value: 'month', label: t('termsScreen.filters.lastMonth') },
      { value: '3months', label: t('termsScreen.filters.last3Months') },
      { value: '6months', label: t('termsScreen.filters.last6Months') },
      { value: 'year', label: t('termsScreen.filters.lastYear') },
    ],
    [t],
  );

  const statusOptions = useMemo<FilterChipOption<StatusFilter>[]>(
    () => [
      { value: 'all', label: t('termsScreen.filters.allStatuses') },
      { value: 'pending', label: t('termsScreen.filters.pending') },
      { value: 'completed', label: t('termsScreen.filters.completed') },
    ],
    [t],
  );

  const filteredTerms = useMemo(() => {
    return [...terms]
      .filter(term => {
        if (companyFilter !== 'all' && term.customerId !== companyFilter) {
          return false;
        }

        if (!isWithinRange(term.orderDate, dateRange)) {
          return false;
        }

        if (statusFilter === 'pending' && !isPendingTermStatus(term.status)) {
          return false;
        }

        if (
          statusFilter === 'completed' &&
          term.status !== TERM_STATUS.ARRIVED
        ) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const dateComparison = sortOrder === 'asc'
          ? left.expectedDate.localeCompare(right.expectedDate)
          : right.expectedDate.localeCompare(left.expectedDate);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return sortOrder === 'asc' ? left.id - right.id : right.id - left.id;
      });
  }, [companyFilter, dateRange, sortOrder, statusFilter, terms]);

  const activeFilterCount = [
    companyFilter !== 'all',
    dateRange !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;
  const styles = createStyles();

  return (
    <AppScreen>
      <NewTermModal
        visible={isTermModalVisible}
        onClose={() => setIsTermModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-6">
          <View className="flex-col gap-6">
            <View className="flex-row items-start justify-between gap-4">
              <Text
                className="flex-1 text-[24px] font-semibold tracking-[-0.5px]"
                style={uiStyles.titleText}
              >
                {t('termsScreen.title')}
              </Text>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() =>
                    setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))
                  }
                  activeOpacity={0.85}
                  className="items-center justify-center rounded-full"
                  style={styles.headerIconButton}
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={18}
                    color={SMART_PDF_DARK.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsFilterVisible(true)}
                  activeOpacity={0.85}
                  className="items-center justify-center rounded-full"
                  style={styles.headerIconButton}
                >
                  <Ionicons
                    name="options-outline"
                    size={18}
                    color={SMART_PDF_DARK.text}
                  />
                  {activeFilterCount > 0 ? (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {activeFilterCount}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>

            {isLoading && terms.length === 0 ? (
              <SurfaceCard tone="soft">
                <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                  {t('customerDetail.loadingTerms')}
                </Text>
              </SurfaceCard>
            ) : error ? (
              <SurfaceCard tone="soft">
                <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                  {error}
                </Text>
              </SurfaceCard>
            ) : filteredTerms.length === 0 ? (
              <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                {terms.length === 0
                  ? t('termsScreen.emptyBody')
                  : t('termsScreen.emptyFilteredBody')}
              </Text>
            ) : (
              <View className="flex-col gap-3">
                {filteredTerms.map(term => (
                  <TermItem key={term.id} term={term} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.floatingActionWrap}>
        <AppButton
          label={t('customerDetail.addTermButton')}
          onPress={() => setIsTermModalVisible(true)}
          variant="primary"
          iconName="calendar-outline"
          style={styles.floatingActionButton}
        />
      </View>

      <BottomSheetModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className="text-[22px] font-semibold tracking-[-0.4px]"
              style={uiStyles.titleText}
            >
              {t('termsScreen.filters.title')}
            </Text>

            <AppButton
              label={t('common.cancel')}
              onPress={() => setIsFilterVisible(false)}
              variant="pill"
              compact
              iconOnly
              iconName="close"
              style={uiStyles.borderless}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-col gap-5">
              <View className="flex-col gap-3">
                <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                  {t('termsScreen.filters.company')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {companyOptions.map(option => (
                    <FilterChip
                      key={option.value}
                      isActive={
                        option.value ===
                        (companyFilter === 'all' ? 'all' : `${companyFilter}`)
                      }
                      label={option.label}
                      onPress={() =>
                        setCompanyFilter(
                          option.value === 'all' ? 'all' : Number(option.value),
                        )
                      }
                    />
                  ))}
                </View>
              </View>

              <View className="flex-col gap-3">
                <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                  {t('termsScreen.filters.dateRange')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {dateOptions.map(option => (
                    <FilterChip
                      key={option.value}
                      isActive={dateRange === option.value}
                      label={option.label}
                      onPress={() => setDateRange(option.value)}
                    />
                  ))}
                </View>
              </View>

              <View className="flex-col gap-3">
                <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                  {t('termsScreen.filters.status')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {statusOptions.map(option => (
                    <FilterChip
                      key={option.value}
                      isActive={statusFilter === option.value}
                      label={option.label}
                      onPress={() => setStatusFilter(option.value)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3">
            <AppButton
              label={t('termsScreen.filters.reset')}
              onPress={() => {
                setCompanyFilter('all');
                setDateRange('all');
                setStatusFilter('all');
              }}
              variant="secondary"
              style={styles.modalAction}
            />
            <AppButton
              label={t('termsScreen.filters.apply')}
              onPress={() => setIsFilterVisible(false)}
              variant="primary"
              style={styles.modalAction}
            />
          </View>
        </View>
      </BottomSheetModal>
    </AppScreen>
  );
};

function createStyles() {
  return {
    scrollContent: {
      paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      backgroundColor: SMART_PDF_DARK.surface,
    },
    filterBadge: {
      position: 'absolute' as const,
      top: -3,
      right: -2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 4,
      backgroundColor: SMART_PDF_DARK.accent,
    },
    filterBadgeText: {
      color: SMART_PDF_DARK.text,
      fontSize: 10,
      fontWeight: '700' as const,
    },
    activeChip: {
      backgroundColor: SMART_PDF_DARK.accentSurface,
    },
    inactiveChip: {
      backgroundColor: SMART_PDF_DARK.surfaceMuted,
    },
    activeChipText: {
      color: SMART_PDF_DARK.text,
    },
    inactiveChipText: {
      color: SMART_PDF_DARK.muted,
    },
    modalAction: {
      flex: 1,
    },
    floatingActionWrap: {
      position: 'absolute' as const,
      right: 24,
      bottom: FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.offset + 20,
      alignItems: 'flex-end' as const,
    },
    floatingActionButton: {
      minHeight: 40,
      paddingHorizontal: 18,
      borderRadius: 22,
      ...SHADOWS.floatingCompact,
    },
  };
}

export default TermListScreen;
