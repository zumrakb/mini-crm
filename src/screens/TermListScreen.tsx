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
import AppTopBar, {
  AvatarCircle,
  BrandWordmark,
  SearchGlyph,
} from '../components/ui/AppTopBar';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import EmptyState from '../components/ui/EmptyState';
import InlineGlobalSearch from '../components/ui/InlineGlobalSearch';
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
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="rounded-full px-4 py-2.5"
    style={{
      backgroundColor: isActive ? SMART_PDF_DARK.accentSurface : SMART_PDF_DARK.surfaceAlt,
    }}
  >
    <Text
      className="text-[13px] font-semibold"
      style={{ color: isActive ? SMART_PDF_DARK.accent : SMART_PDF_DARK.text }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const TermListScreen: React.FC = () => {
  const { t } = useTranslation();
  const terms = useTermStore(state => state.terms);
  const isLoading = useTermStore(state => state.isLoading);
  const error = useTermStore(state => state.error);
  const loadTerms = useTermStore(state => state.load);
  const customers = useCustomerStore(state => state.customers);
  const loadCustomers = useCustomerStore(state => state.load);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [draftCompanyFilter, setDraftCompanyFilter] = useState<number | 'all'>('all');
  const [draftDateRange, setDraftDateRange] = useState<DateRange>('all');
  const [draftStatusFilter, setDraftStatusFilter] = useState<StatusFilter>('all');
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');

  useFocusEffect(
    useCallback(() => {
      loadTerms();
      loadCustomers();

      return () => {
        setIsSearchVisible(false);
        setSearchQuery('');
      };
    }, [loadCustomers, loadTerms]),
  );

  const customerMap = useMemo(
    () =>
      customers.reduce<Record<number, Customer>>((accumulator, customer) => {
        accumulator[customer.id] = customer;
        return accumulator;
      }, {}),
    [customers],
  );

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

  const filteredTerms = useMemo(
    () =>
      [...terms]
        .filter(term => {
          if (normalizedSearchQuery) {
            const customer = customerMap[term.customerId];
            const searchText = [
              term.productName,
              term.termDuration,
              customer?.companyName ?? '',
            ]
              .join(' ')
              .toLocaleLowerCase('tr-TR');

            if (!searchText.includes(normalizedSearchQuery)) {
              return false;
            }
          }

          if (companyFilter !== 'all' && term.customerId !== companyFilter) {
            return false;
          }

          if (!isWithinRange(term.orderDate, dateRange)) {
            return false;
          }

          if (statusFilter === 'pending' && !isPendingTermStatus(term.status)) {
            return false;
          }

          if (statusFilter === 'completed' && term.status !== TERM_STATUS.ARRIVED) {
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
        }),
    [companyFilter, customerMap, dateRange, normalizedSearchQuery, sortOrder, statusFilter, terms],
  );
  const showSearchNoResults = Boolean(normalizedSearchQuery) && filteredTerms.length === 0;

  const activeFilterCount = [
    companyFilter !== 'all',
    dateRange !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const openFilterModal = useCallback(() => {
    setDraftCompanyFilter(companyFilter);
    setDraftDateRange(dateRange);
    setDraftStatusFilter(statusFilter);
    setIsFilterVisible(true);
  }, [companyFilter, dateRange, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setDraftCompanyFilter('all');
    setDraftDateRange('all');
    setDraftStatusFilter('all');
  }, []);

  const handleApplyFilters = useCallback(() => {
    setCompanyFilter(draftCompanyFilter);
    setDateRange(draftDateRange);
    setStatusFilter(draftStatusFilter);
    setIsFilterVisible(false);
  }, [draftCompanyFilter, draftDateRange, draftStatusFilter]);

  return (
    <AppScreen>
      <NewTermModal
        visible={isTermModalVisible}
        onClose={() => setIsTermModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-6 pt-6">
          <View className="flex-col gap-5">
            <View style={{ minHeight: 40, position: 'relative' }}>
              <AppTopBar
                left={(
                  <>
                    <AvatarCircle image="profile" size={34} />
                    <BrandWordmark label={t('termsScreen.title')} />
                  </>
                )}
                right={(
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))}
                      activeOpacity={0.85}
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: SMART_PDF_DARK.surfaceAlt,
                      }}
                    >
                      <Ionicons
                        name="swap-vertical-outline"
                        size={18}
                        color={SMART_PDF_DARK.text}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={openFilterModal}
                      activeOpacity={0.85}
                      className="flex-row items-center gap-2 rounded-full px-3 py-2.5"
                      style={{
                        backgroundColor: SMART_PDF_DARK.surfaceAlt,
                      }}
                    >
                      <Ionicons
                        name="options-outline"
                        size={18}
                        color={SMART_PDF_DARK.text}
                      />
                      <Text className="text-[14px] font-semibold" style={uiStyles.titleText}>
                        {t('termsScreen.filters.title')}
                      </Text>
                      {activeFilterCount > 0 ? (
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: SMART_PDF_DARK.accentSurface }}
                        >
                          <Text
                            className="text-[12px] font-semibold"
                            style={{ color: SMART_PDF_DARK.accent }}
                          >
                            {activeFilterCount}
                          </Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>

                    <SearchGlyph onPress={() => setIsSearchVisible(current => !current)} />
                  </View>
                )}
              />

              <InlineGlobalSearch
                visible={isSearchVisible}
                query={searchQuery}
                onChangeText={setSearchQuery}
                onClose={() => setIsSearchVisible(false)}
                placeholder={t('common.pageSearchPlaceholder')}
                showNoResults={showSearchNoResults}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20 }}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-4">
                {statusOptions.map(option => (
                  <FilterChip
                    key={option.value}
                    isActive={statusFilter === option.value}
                    label={option.label}
                    onPress={() => setStatusFilter(option.value)}
                  />
                ))}
              </View>
            </ScrollView>

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
              <EmptyState
                title={showSearchNoResults ? t('common.searchNoResults') : t('termsScreen.title')}
              />
            ) : (
              <View className="flex-col gap-3">
                {filteredTerms.map(term => (
                  <TermItem
                    key={term.id}
                    term={term}
                    companyName={customerMap[term.customerId]?.companyName}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomSheetModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-col gap-5">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className="text-[18px] font-semibold tracking-[-0.35px]"
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
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-col gap-6">
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
                        (draftCompanyFilter === 'all' ? 'all' : `${draftCompanyFilter}`)
                      }
                      label={option.label}
                      onPress={() =>
                        setDraftCompanyFilter(
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
                      isActive={draftDateRange === option.value}
                      label={option.label}
                      onPress={() => setDraftDateRange(option.value)}
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
                      isActive={draftStatusFilter === option.value}
                      label={option.label}
                      onPress={() => setDraftStatusFilter(option.value)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3">
            <AppButton
              label={t('termsScreen.filters.reset')}
              onPress={handleResetFilters}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <AppButton
              label={t('termsScreen.filters.apply')}
              onPress={handleApplyFilters}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheetModal>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: 20,
          bottom: FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.offset + 18,
          alignItems: 'flex-end',
        }}
      >
        <AppButton
          label={t('customerDetail.addTermButton')}
          onPress={() => setIsTermModalVisible(true)}
          variant="primary"
          iconName="calendar-outline"
          style={{
            minHeight: 44,
            paddingHorizontal: 18,
            ...SHADOWS.floatingCompact,
          }}
        />
      </View>
    </AppScreen>
  );
};

export default TermListScreen;
