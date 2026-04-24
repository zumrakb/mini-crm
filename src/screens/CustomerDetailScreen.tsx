import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { StackScreenProps } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActivityItem from '../components/activity/ActivityItem';
import TermItem from '../components/term/TermItem';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import AppTopBar, {
  AvatarCircle,
  SearchGlyph,
} from '../components/ui/AppTopBar';
import InlineGlobalSearch from '../components/ui/InlineGlobalSearch';
import SurfaceCard from '../components/ui/SurfaceCard';
import { FLOATING_TAB_BAR, SHADOWS, SMART_PDF_DARK, uiStyles } from '../components/ui/theme';
import CustomerEditModal from '../modals/CustomerEditModal';
import NewActivityModal from '../modals/NewActivityModal';
import NewTermModal from '../modals/NewTermModal';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import type { CustomerStackParamList } from '../types/navigation';

type Props = StackScreenProps<CustomerStackParamList, 'CustomerDetail'>;

type ActiveSection = 'activities' | 'terms';

interface ContactRowProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

const ContactRow: React.FC<ContactRowProps> = ({ iconName, label, value }) => (
  <View className="flex-1 gap-2">
    <View className="flex-row items-center gap-2">
      <View
        className="h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: SMART_PDF_DARK.surfaceAlt }}
      >
        <Ionicons name={iconName} size={13} color={SMART_PDF_DARK.muted} />
      </View>
      <Text
        className="text-[12px] font-semibold"
        style={{ color: SMART_PDF_DARK.muted }}
      >
        {label}
      </Text>
    </View>
    <Text
      className="text-[15px] leading-5"
      style={{ color: SMART_PDF_DARK.text }}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const SectionToggle: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="flex-1 rounded-full px-3 py-2"
    style={{
      backgroundColor: isActive ? SMART_PDF_DARK.accentSurface : 'transparent',
    }}
  >
    <Text
      className="text-center text-[12px] font-semibold"
      style={{ color: isActive ? SMART_PDF_DARK.accent : SMART_PDF_DARK.muted }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const CustomerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [isNewestTermsFirst, setIsNewestTermsFirst] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('activities');
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');

  const customer = useCustomerStore(
    state => state.customers.find(item => item.id === customerId) ?? null,
  );
  const loadCustomers = useCustomerStore(state => state.load);
  const activities = useActivityStore(state => state.activities);
  const isLoading = useActivityStore(state => state.isLoading);
  const error = useActivityStore(state => state.error);
  const loadByCustomer = useActivityStore(state => state.loadByCustomer);
  const terms = useTermStore(state => state.terms);
  const isTermsLoading = useTermStore(state => state.isLoading);
  const termError = useTermStore(state => state.error);
  const loadTermsByCustomer = useTermStore(state => state.loadByCustomer);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
      loadByCustomer(customerId);
      loadTermsByCustomer(customerId);

      return () => {
        setIsSearchVisible(false);
        setSearchQuery('');
      };
    }, [customerId, loadByCustomer, loadCustomers, loadTermsByCustomer]),
  );

  const sortedActivities = useMemo(
    () =>
      [...activities]
        .filter(activity => {
          if (!normalizedSearchQuery) {
            return true;
          }

          return [
            activity.type,
            activity.note ?? '',
            customer?.companyName ?? '',
            customer?.customerName ?? '',
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR')
            .includes(normalizedSearchQuery);
        })
        .sort((left, right) => {
          const dateComparison = isNewestFirst
            ? right.date.localeCompare(left.date)
            : left.date.localeCompare(right.date);

          if (dateComparison !== 0) {
            return dateComparison;
          }

          return isNewestFirst ? right.id - left.id : left.id - right.id;
        }),
    [activities, customer?.companyName, customer?.customerName, isNewestFirst, normalizedSearchQuery],
  );

  const sortedTerms = useMemo(
    () =>
      [...terms]
        .filter(term => {
          if (!normalizedSearchQuery) {
            return true;
          }

          return [
            term.productName,
            term.termDuration,
            customer?.companyName ?? '',
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR')
            .includes(normalizedSearchQuery);
        })
        .sort((left, right) => {
          const dateComparison = isNewestTermsFirst
            ? right.expectedDate.localeCompare(left.expectedDate)
            : left.expectedDate.localeCompare(right.expectedDate);

          if (dateComparison !== 0) {
            return dateComparison;
          }

          return isNewestTermsFirst ? right.id - left.id : left.id - right.id;
        }),
    [customer?.companyName, isNewestTermsFirst, normalizedSearchQuery, terms],
  );
  const showSearchNoResults = Boolean(normalizedSearchQuery) && (
    activeSection === 'activities'
      ? sortedActivities.length === 0
      : sortedTerms.length === 0
  );

  const phoneValue = customer?.phone || t('customerDetail.notProvided');
  const emailValue = customer?.email || t('customerDetail.notProvided');

  if (!customer) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm leading-6" style={uiStyles.bodyText}>
            {t('customerDetail.notFoundBody')}
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <CustomerEditModal
        visible={isEditModalVisible}
        customer={customer}
        onClose={() => setIsEditModalVisible(false)}
      />

      <NewActivityModal
        visible={isActivityModalVisible}
        customerId={customer.id}
        onClose={() => setIsActivityModalVisible(false)}
      />

      <NewTermModal
        visible={isTermModalVisible}
        customerId={customer.id}
        onClose={() => setIsTermModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-6" style={{ paddingTop: insets.top + 8 }}>
          <View className="flex-col gap-5">
            <View style={{ minHeight: 40, position: 'relative' }}>
              <AppTopBar
                left={(
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.85}
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: SMART_PDF_DARK.surfaceAlt }}
                  >
                    <Ionicons name="chevron-back" size={18} color={SMART_PDF_DARK.text} />
                  </TouchableOpacity>
                )}
                right={<SearchGlyph onPress={() => setIsSearchVisible(current => !current)} />}
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

            <SurfaceCard>
              <View className="flex-col gap-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row items-center gap-3">
                    <AvatarCircle label={customer.companyName.slice(0, 2).toUpperCase()} tone="emerald" size={46} />
                    <View className="min-w-0 flex-1 items-start">
                      <Text
                        className="text-[17px] font-semibold tracking-[-0.4px]"
                        style={uiStyles.titleText}
                        numberOfLines={1}
                      >
                        {customer.companyName}
                      </Text>
                      <Text
                        className="mt-0.5 text-[13px]"
                        style={uiStyles.bodyText}
                        numberOfLines={1}
                      >
                        {customer.customerName}
                      </Text>
                    </View>
                  </View>

                  <AppButton
                    label={t('common.edit')}
                    onPress={() => setIsEditModalVisible(true)}
                    variant="soft"
                    compact
                    textStyle={{ fontSize: 12 }}
                    style={{ minHeight: 34, paddingHorizontal: 12 }}
                  />
                </View>

                <View className="flex-row gap-4">
                  <ContactRow
                    iconName="call"
                    label={t('customerDetail.phoneLabel')}
                    value={phoneValue}
                  />
                  <ContactRow
                    iconName="mail"
                    label={t('customerDetail.emailLabel')}
                    value={emailValue}
                  />
                </View>
              </View>
            </SurfaceCard>

            <View className="flex-row items-center gap-2">
              <View
                className="flex-1 flex-row items-center gap-1 rounded-full p-1"
                style={{
                  backgroundColor: SMART_PDF_DARK.surfaceAlt,
                }}
              >
                <SectionToggle
                  label={t('customerDetail.activityHistoryTitle')}
                  isActive={activeSection === 'activities'}
                  onPress={() => setActiveSection('activities')}
                />
                <SectionToggle
                  label={t('common.terms')}
                  isActive={activeSection === 'terms'}
                  onPress={() => setActiveSection('terms')}
                />
              </View>

              <AppButton
                label={t('common.edit')}
                onPress={() => {
                  if (activeSection === 'activities') {
                    setIsNewestFirst(current => !current);
                  } else {
                    setIsNewestTermsFirst(current => !current);
                  }
                }}
                variant="pill"
                compact
                iconOnly
                iconName="swap-vertical-outline"
              />
            </View>

            {activeSection === 'activities' ? (
              isLoading && sortedActivities.length === 0 ? (
                <SurfaceCard tone="soft">
                  <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                    {t('customerDetail.loadingActivities')}
                  </Text>
                </SurfaceCard>
              ) : error ? (
                <SurfaceCard tone="soft">
                  <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                    {error}
                  </Text>
                </SurfaceCard>
              ) : sortedActivities.length === 0 ? (
                <Text className="text-[14px]" style={uiStyles.bodyText}>
                  {normalizedSearchQuery ? t('common.searchNoResults') : t('customerDetail.emptyActivitiesTitle')}
                </Text>
              ) : (
                <View className="flex-col gap-4">
                  {sortedActivities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </View>
              )
            ) : (
              isTermsLoading && terms.length === 0 ? (
                <SurfaceCard tone="soft">
                  <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                    {t('customerDetail.loadingTerms')}
                  </Text>
                </SurfaceCard>
              ) : termError ? (
                <SurfaceCard tone="soft">
                  <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                    {termError}
                  </Text>
                </SurfaceCard>
              ) : sortedTerms.length === 0 ? (
                <Text className="text-[14px]" style={uiStyles.bodyText}>
                  {normalizedSearchQuery ? t('common.searchNoResults') : t('customerDetail.emptyTermsBody')}
                </Text>
              ) : (
                <View className="flex-col gap-4">
                  {sortedTerms.map(term => (
                    <TermItem
                      key={term.id}
                      term={term}
                      companyName={customer.companyName}
                    />
                  ))}
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: 20,
          bottom: FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.offset + 18,
          gap: 10,
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
        <AppButton
          label={t('customerDetail.addActivityButton')}
          onPress={() => setIsActivityModalVisible(true)}
          variant="soft"
          iconName="add"
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

export default CustomerDetailScreen;
