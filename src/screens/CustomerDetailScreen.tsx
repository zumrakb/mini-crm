import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
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
import { SHADOWS, SMART_PDF_DARK, uiStyles } from '../components/ui/theme';
import type { Customer } from '../constants/customer.types';
import CustomerEditModal from '../modals/CustomerEditModal';
import NewActivityModal from '../modals/NewActivityModal';
import NewTermModal from '../modals/NewTermModal';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';
import type { CustomerStackParamList } from '../types/navigation';

type Props = StackScreenProps<CustomerStackParamList, 'CustomerDetail'>;

interface ContactInfoProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ iconName, value }) => {
  return (
    <View
      className="min-w-0 flex-1 flex-row items-center gap-2 rounded-[18px] px-4 py-3"
      style={styles.infoBlock}
    >
      <Ionicons name={iconName} size={15} color={SMART_PDF_DARK.accent} />
      <Text
        className="flex-1 text-sm leading-5"
        style={uiStyles.titleText}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

interface SectionTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  trailingIconName?: React.ComponentProps<typeof Ionicons>['name'];
  onTrailingPress?: () => void;
}

const SectionTab: React.FC<SectionTabProps> = ({
  label,
  isActive,
  onPress,
  trailingIconName,
  onTrailingPress,
}) => {
  return (
    <View
      className="flex-1 flex-row items-center gap-2 rounded-full px-4 py-3"
      style={isActive ? styles.activeTab : styles.inactiveTab}
    >
      <TouchableOpacity
        className="min-w-0 flex-1"
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text
          className="text-center text-[14px] font-semibold"
          style={{ color: isActive ? SMART_PDF_DARK.text : SMART_PDF_DARK.muted }}
        >
          {label}
        </Text>
      </TouchableOpacity>

      {trailingIconName && onTrailingPress ? (
        <TouchableOpacity
          onPress={onTrailingPress}
          activeOpacity={0.85}
          style={styles.tabInlineIconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={trailingIconName}
            size={16}
            color={isActive ? SMART_PDF_DARK.text : SMART_PDF_DARK.muted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

interface SectionStateProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  message: string;
  accent?: boolean;
}

const SectionState: React.FC<SectionStateProps> = ({
  iconName,
  message,
  accent = false,
}) => {
  return (
    <View
      className="items-center gap-3 rounded-[24px] px-5 py-8"
      style={styles.sectionState}
    >
      <View
        className="rounded-full p-3"
        style={accent ? styles.stateIconAccent : styles.stateIconMuted}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={accent ? SMART_PDF_DARK.accent : SMART_PDF_DARK.muted}
        />
      </View>
      <Text className="text-center text-sm leading-6" style={uiStyles.bodyText}>
        {message}
      </Text>
    </View>
  );
};

const CustomerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isTermModalVisible, setIsTermModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [isNewestTermsFirst, setIsNewestTermsFirst] = useState(true);
  const [activeSection, setActiveSection] = useState<'activities' | 'terms'>(
    'activities',
  );
  const [pagerWidth, setPagerWidth] = useState(0);
  const pagerRef = useRef<ScrollView | null>(null);

  const activities = useActivityStore(state => state.activities);
  const isLoading = useActivityStore(state => state.isLoading);
  const error = useActivityStore(state => state.error);
  const loadByCustomer = useActivityStore(state => state.loadByCustomer);
  const getCustomerById = useCustomerStore(state => state.getById);
  const terms = useTermStore(state => state.terms);
  const isTermsLoading = useTermStore(state => state.isLoading);
  const termError = useTermStore(state => state.error);
  const loadTermsByCustomer = useTermStore(state => state.loadByCustomer);

  useFocusEffect(
    useCallback(() => {
      setCustomer(getCustomerById(customerId));
      loadByCustomer(customerId);
      loadTermsByCustomer(customerId);
    }, [customerId, getCustomerById, loadByCustomer, loadTermsByCustomer]),
  );

  const sortedActivities = useMemo(
    () =>
      [...activities].sort((left, right) => {
        const dateComparison = isNewestFirst
          ? right.date.localeCompare(left.date)
          : left.date.localeCompare(right.date);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return isNewestFirst ? right.id - left.id : left.id - right.id;
      }),
    [activities, isNewestFirst],
  );

  const sortedTerms = useMemo(
    () =>
      [...terms].sort((left, right) => {
        const dateComparison = isNewestTermsFirst
          ? right.expectedDate.localeCompare(left.expectedDate)
          : left.expectedDate.localeCompare(right.expectedDate);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return isNewestTermsFirst ? right.id - left.id : left.id - right.id;
      }),
    [isNewestTermsFirst, terms],
  );

  const phoneValue = customer?.phone || t('customerDetail.notProvided');
  const emailValue = customer?.email || t('customerDetail.notProvided');

  const handleSectionPress = useCallback(
    (section: 'activities' | 'terms') => {
      if (!pagerWidth) {
        setActiveSection(section);
        return;
      }

      setActiveSection(section);
      pagerRef.current?.scrollTo({
        x: section === 'activities' ? 0 : pagerWidth,
        animated: true,
      });
    },
    [pagerWidth],
  );

  const handlePagerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;

      if (width > 0 && width !== pagerWidth) {
        setPagerWidth(width);
      }
    },
    [pagerWidth],
  );

  if (!customer) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-center text-sm leading-6"
            style={uiStyles.bodyText}
          >
            {t('customerDetail.notFoundBody')}
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      backgroundColor={SMART_PDF_DARK.background}
      edges={['left', 'right', 'bottom']}
    >
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

      <View className="flex-1" style={styles.screenBody}>
        <View pointerEvents="none" style={styles.topBackdrop} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            className="flex-row items-center gap-2"
            style={[styles.backLink, { marginTop: insets.top + 12 }]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={SMART_PDF_DARK.text}
            />
            <Text className="text-[14px]" style={uiStyles.titleText}>
              {t('customerDetail.backToCustomerList')}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View className="flex-row items-start justify-between">
              <View className="min-w-0 flex-1 flex-col gap-0.5">
                <Text
                  className="text-[20px] font-semibold uppercase leading-6 tracking-[1px]"
                  style={uiStyles.titleText}
                  numberOfLines={1}
                >
                  {customer.companyName}
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={uiStyles.bodyText}
                  numberOfLines={2}
                >
                  {t('customerDetail.contactPersonLabel', {
                    customerName: customer.customerName,
                  })}
                </Text>
              </View>

              <AppButton
                label={t('common.edit')}
                onPress={() => setIsEditModalVisible(true)}
                variant="soft"
                compact
                style={styles.editButton}
                textStyle={styles.editButtonText}
              />
            </View>

            <View className="mt-4 flex-row gap-3">
              <ContactInfo iconName="call-outline" value={phoneValue} />
              <ContactInfo iconName="mail-outline" value={emailValue} />
            </View>
          </View>

          <View style={styles.contentSection}>
            <View onLayout={handlePagerLayout}>
              <View
                className="mb-5 rounded-full p-1"
                style={styles.tabsContainer}
              >
                <View className="flex-row gap-1">
                  <SectionTab
                    label={t('customerDetail.activityHistoryTitle')}
                    isActive={activeSection === 'activities'}
                    onPress={() => handleSectionPress('activities')}
                    trailingIconName="swap-vertical-outline"
                    onTrailingPress={() => setIsNewestFirst(current => !current)}
                  />
                  <SectionTab
                    label={t('common.terms')}
                    isActive={activeSection === 'terms'}
                    onPress={() => handleSectionPress('terms')}
                    trailingIconName="swap-vertical-outline"
                    onTrailingPress={() =>
                      setIsNewestTermsFirst(current => !current)
                    }
                  />
                </View>
              </View>

              <ScrollView
                ref={pagerRef}
                horizontal
                pagingEnabled
                bounces={false}
                directionalLockEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={event => {
                  const nextSection =
                    event.nativeEvent.contentOffset.x >= pagerWidth / 2
                      ? 'terms'
                      : 'activities';
                  setActiveSection(nextSection);
                }}
              >
                <View style={[styles.page, { width: pagerWidth || undefined }]}>
                  <View className="flex-col gap-4">
                    {isLoading && sortedActivities.length === 0 ? (
                      <SectionState
                        iconName="time-outline"
                        message={t('customerDetail.loadingActivities')}
                        accent
                      />
                    ) : error ? (
                      <SectionState
                        iconName="alert-circle-outline"
                        message={error}
                      />
                    ) : sortedActivities.length === 0 ? (
                      <SectionState
                        iconName="document-text-outline"
                        message={t('customerDetail.emptyActivitiesBody')}
                      />
                    ) : (
                      <View className="flex-col gap-3">
                        {sortedActivities.map(activity => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={[styles.page, { width: pagerWidth || undefined }]}>
                  <View className="flex-col gap-3">
                    {isTermsLoading && terms.length === 0 ? (
                      <SectionState
                        iconName="cube-outline"
                        message={t('customerDetail.loadingTerms')}
                        accent
                      />
                    ) : termError ? (
                      <SectionState
                        iconName="alert-circle-outline"
                        message={termError}
                      />
                    ) : terms.length === 0 ? (
                      <SectionState
                        iconName="cube-outline"
                        message={t('customerDetail.emptyTermsBody')}
                      />
                    ) : (
                      <View className="flex-col gap-3">
                        {sortedTerms.map(term => (
                          <TermItem key={term.id} term={term} />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
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
          <AppButton
            label={t('customerDetail.addActivityButton')}
            onPress={() => setIsActivityModalVisible(true)}
            variant="primary"
            iconName="add"
            style={styles.floatingActionButton}
          />
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  backLink: {
    marginHorizontal: 24,
    alignSelf: 'flex-start',
  },
  editButton: {
    minHeight: 38,
    paddingHorizontal: 18,
    backgroundColor: SMART_PDF_DARK.accentSurface,
    borderWidth: 0,
    borderColor: 'transparent',
    marginTop: -4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  editButtonText: {
    color: SMART_PDF_DARK.text,
    fontWeight: '400',
  },
  floatingActionButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 24,
    ...SHADOWS.floatingCompact,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  scrollView: {
    backgroundColor: SMART_PDF_DARK.background,
  },
  screenBody: {
    backgroundColor: SMART_PDF_DARK.background,
  },
  infoBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabsContainer: {
    backgroundColor: SMART_PDF_DARK.surface,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tabInlineIconButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: SMART_PDF_DARK.accentSurface,
  },
  inactiveTab: {
    backgroundColor: SMART_PDF_DARK.surface,
  },
  sectionState: {
    backgroundColor: SMART_PDF_DARK.surface,
  },
  stateIconMuted: {
    backgroundColor: SMART_PDF_DARK.surfaceMuted,
  },
  stateIconAccent: {
    backgroundColor: SMART_PDF_DARK.accentSurface,
  },
  topBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: SMART_PDF_DARK.surfaceAlt,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: SMART_PDF_DARK.surface,
    borderRadius: 28,
    borderWidth: 0,
    borderColor: 'transparent',
    zIndex: 2,
    ...SHADOWS.soft,
  },
  contentSection: {
    flex: 1,
    flexGrow: 1,
    marginTop: -8,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: SMART_PDF_DARK.background,
    zIndex: 1,
    minHeight: 520,
  },
  page: {
    paddingBottom: 12,
  },
  floatingActionWrap: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    gap: 10,
    alignItems: 'flex-end',
  },
});

export default CustomerDetailScreen;
