import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { StackNavigationProp } from '@react-navigation/stack';
import CustomerCard from '../components/customer/CustomerCard';
import CustomerSearchBar from '../components/customer/CustomerSearchBar';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import SurfaceCard from '../components/ui/SurfaceCard';
import { FLOATING_TAB_BAR, SMART_PDF_DARK } from '../components/ui/theme';
import NewCustomerModal from '../modals/NewCustomerModal';
import { useActivityStore } from '../store/activity.store';
import { useCustomerStore } from '../store/customer.store';
import type { CustomerStackParamList } from '../types/navigation';

const CustomerListScreen: React.FC = () => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<StackNavigationProp<CustomerStackParamList>>();
  const customers = useCustomerStore(state => state.customers);
  const isLoading = useCustomerStore(state => state.isLoading);
  const error = useCustomerStore(state => state.error);
  const load = useCustomerStore(state => state.load);
  const getLastByCustomer = useActivityStore(state => state.getLastByCustomer);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');

    if (!normalizedQuery) {
      return customers;
    }

    return customers.filter(customer => {
      const searchableText = [
        customer.customerName,
        customer.companyName,
        customer.phone ?? '',
        customer.email ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR');

      return searchableText.includes(normalizedQuery);
    });
  }, [customers, searchQuery]);

  const customerCards = useMemo(
    () =>
      filteredCustomers.map(customer => ({
        customer,
        lastActivity: getLastByCustomer(customer.id),
      })),
    [filteredCustomers, getLastByCustomer],
  );

  const visibleCustomerCount = customerCards.length;

  const listHeader = (
    <View className="px-6 pt-6">
      <View className="flex-col gap-6 pb-6">
        <PageHeader
          title={t('common.customers')}
          badge={
            <View
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: SMART_PDF_DARK.accentSurface,
              }}
            >
              <Text
                className="text-xs font-semibold tracking-[0.8px]"
                style={{
                  color:
                    SMART_PDF_DARK.statusBar === 'light-content'
                      ? SMART_PDF_DARK.accent
                      : SMART_PDF_DARK.accentMuted,
                }}
              >
                {visibleCustomerCount}
              </Text>
            </View>
          }
          trailing={
            <AppButton
              label={t('customersScreen.addButton')}
              onPress={() => setIsModalVisible(true)}
              variant="primary"
              compact
              iconName="add"
            />
          }
        />

        <CustomerSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('customersScreen.searchPlaceholder')}
          onClear={() => setSearchQuery('')}
        />
      </View>
    </View>
  );

  const loadingState = (
    <View className="px-6 pt-6">
      <SurfaceCard tone="soft">
        <View className="flex-col items-center gap-3">
          <ActivityIndicator color={SMART_PDF_DARK.accent} />
          <Text
            className="text-sm"
            style={{ color: SMART_PDF_DARK.muted }}
          >
            {t('customersScreen.loading')}
          </Text>
        </View>
      </SurfaceCard>
    </View>
  );

  return (
    <AppScreen>
      <NewCustomerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      {isLoading && customers.length === 0 ? (
        <View className="flex-1">
          {listHeader}
          {loadingState}
        </View>
      ) : (
        <FlatList
          data={customerCards}
          keyExtractor={item => item.customer.id.toString()}
          renderItem={({ item }) => (
            <View className="px-6">
              <CustomerCard
                customer={item.customer}
                lastActivity={item.lastActivity}
                onPress={() =>
                  navigation.navigate('CustomerDetail', {
                    customerId: item.customer.id,
                  })
                }
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
          showsVerticalScrollIndicator={false}
          onRefresh={load}
          refreshing={isLoading}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => <View className="h-5" />}
          ListEmptyComponent={
            <View className="px-6 pt-4">
              {error ? (
                <Text className="text-sm leading-6" style={{ color: SMART_PDF_DARK.muted }}>
                  {error}
                </Text>
              ) : (
                <Text className="text-sm leading-6" style={{ color: SMART_PDF_DARK.muted }}>
                  {searchQuery.trim()
                    ? t('customersScreen.searchEmptyBody')
                    : t('customersScreen.emptyBody')}
                </Text>
              )}
            </View>
          }
        />
      )}
    </AppScreen>
  );
};

export default CustomerListScreen;
