import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { StackScreenProps } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActivityItem from '../components/activity/ActivityItem';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import {
  SMART_PDF_DARK,
  uiStyles,
} from '../components/ui/theme';
import { TERM_STATUS } from '../constants/termStatus';
import type { Customer } from '../constants/customer.types';
import CustomerEditModal from '../modals/CustomerEditModal';
import NewActivityModal from '../modals/NewActivityModal';
import { getTermsByCustomer } from '../repositories/term.repository';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import type { CustomerStackParamList } from '../types/navigation';
import { formatDate } from '../utils/dateUtils';

type Props = StackScreenProps<CustomerStackParamList, 'CustomerDetail'>;

interface StatCardProps {
  label: string;
  value: string;
}

interface ContactInfoProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <View
      className="min-w-[31%] flex-1 rounded-[22px] px-4 py-4"
      style={uiStyles.mutedSurface}
    >
      <Text
        className="text-center text-[11px] font-semibold uppercase tracking-[0.8px]"
        style={uiStyles.bodyText}
      >
        {label}
      </Text>
      <Text
        className="mt-2 text-center text-sm font-semibold leading-5"
        style={uiStyles.titleText}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
};

const ContactInfo: React.FC<ContactInfoProps> = ({
  iconName,
  value,
}) => {
  return (
    <View className="min-w-0 flex-row items-center gap-2">
      <Ionicons name={iconName} size={16} color={SMART_PDF_DARK.accent} />
      <Text className="text-sm leading-5" style={uiStyles.titleText} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const CustomerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { t } = useTranslation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTermCount, setActiveTermCount] = useState(0);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNewestFirst, setIsNewestFirst] = useState(true);

  const activities = useActivityStore(state => state.activities);
  const isLoading = useActivityStore(state => state.isLoading);
  const error = useActivityStore(state => state.error);
  const loadByCustomer = useActivityStore(state => state.loadByCustomer);
  const getCustomerById = useCustomerStore(state => state.getById);

  useFocusEffect(
    useCallback(() => {
      setCustomer(getCustomerById(customerId));
      loadByCustomer(customerId);

      try {
        const activeTerms = getTermsByCustomer(customerId).filter(
          term => term.status === TERM_STATUS.PENDING,
        ).length;

        setActiveTermCount(activeTerms);
      } catch {
        setActiveTermCount(0);
      }
    }, [customerId, getCustomerById, loadByCustomer]),
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

  const lastActivity = sortedActivities[0] ?? null;
  const phoneValue = customer?.phone || t('customerDetail.notProvided');
  const emailValue = customer?.email || t('customerDetail.notProvided');
  const lastActivityTypeValue = lastActivity?.type || t('customerDetail.noActivity');
  const lastActivityDateValue = lastActivity
    ? formatDate(lastActivity.date)
    : t('customerDetail.notProvided');

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
    <AppScreen>
      <CustomerEditModal
        visible={isEditModalVisible}
        customer={customer}
        onClose={() => setIsEditModalVisible(false)}
      />

      <NewActivityModal
        visible={isActivityModalVisible}
        customerId={customer.id}
        customerName={customer.customerName}
        onClose={() => setIsActivityModalVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-6">
          <View className="flex-col gap-8">
            <View className="flex-col gap-6">
              <View className="flex-row items-start justify-between gap-4">
                <View className="min-w-0 flex-1 flex-row items-start gap-3">
                  <AppButton
                    label={t('common.back')}
                    onPress={() => navigation.goBack()}
                    variant="pill"
                    compact
                    iconOnly
                    iconName="chevron-back"
                    style={uiStyles.borderless}
                  />

                  <View className="min-w-0 flex-1 gap-1">
                    <Text
                      className="text-[12px] font-semibold uppercase tracking-[1.1px]"
                      style={uiStyles.titleText}
                      numberOfLines={1}
                    >
                      {customer.companyName.toUpperCase()}
                    </Text>
                    <Text
                      className="text-sm leading-6"
                      style={uiStyles.bodyText}
                      numberOfLines={2}
                    >
                      Iletisim kisisi: {customer.customerName}
                    </Text>
                  </View>
                </View>

                <AppButton
                  label={t('customerDetail.editCustomerButton')}
                  onPress={() => setIsEditModalVisible(true)}
                  variant="secondary"
                  compact
                  iconName="create-outline"
                  style={uiStyles.borderless}
                />
              </View>

              <View className="flex-row items-center justify-center gap-6">
                <ContactInfo
                  iconName="call-outline"
                  value={phoneValue}
                />
                <ContactInfo
                  iconName="mail-outline"
                  value={emailValue}
                />
              </View>

              <View className="flex-row flex-wrap gap-3">
                <StatCard
                  label={t('customerDetail.lastActionTypeLabel')}
                  value={lastActivityTypeValue}
                />
                <StatCard
                  label={t('customerDetail.lastActionDateLabel')}
                  value={lastActivityDateValue}
                />
                <StatCard
                  label={t('customerDetail.activeTermsLabel')}
                  value={String(activeTermCount)}
                />
              </View>

              <AppButton
                label={t('customerDetail.addActivityButton')}
                onPress={() => setIsActivityModalVisible(true)}
                variant="primary"
                iconName="add"
              />
            </View>

            <View className="flex-col gap-4">
              <View className="flex-row items-center justify-between gap-3">
                <Text
                  className="text-lg font-semibold tracking-[-0.3px]"
                  style={uiStyles.titleText}
                >
                  {t('customerDetail.activityHistoryTitle')}
                </Text>

                <TouchableOpacity
                  onPress={() => setIsNewestFirst(current => !current)}
                  className="flex-row items-center gap-2 rounded-full px-3 py-2"
                  style={uiStyles.mutedSurface}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={14}
                    color={SMART_PDF_DARK.accent}
                  />
                  <Text className="text-xs font-semibold text-white">
                    {isNewestFirst ? 'Yeniden Eskiye' : 'Eskiden Yeniye'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isLoading && sortedActivities.length === 0 ? (
                <View className="flex-col items-center gap-3 py-4">
                  <ActivityIndicator color={SMART_PDF_DARK.accent} />
                  <Text
                    className="text-center text-sm"
                    style={uiStyles.bodyText}
                  >
                    {t('customerDetail.loadingActivities')}
                  </Text>
                </View>
              ) : error ? (
                <Text
                  className="text-sm leading-6"
                  style={uiStyles.bodyText}
                >
                  {error}
                </Text>
              ) : sortedActivities.length === 0 ? (
                <Text
                  className="text-sm leading-6"
                  style={uiStyles.bodyText}
                >
                  {t('customerDetail.emptyActivitiesBody')}
                </Text>
              ) : (
                <View className="flex-col gap-2.5">
                  {sortedActivities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default CustomerDetailScreen;
