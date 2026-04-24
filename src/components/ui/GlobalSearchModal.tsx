import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheetModal from './BottomSheetModal';
import AppButton from './AppButton';
import { SMART_PDF_DARK, uiStyles } from './theme';
import { getAllCustomers } from '../../repositories/customer.repository';
import { getAllTerms } from '../../repositories/term.repository';
import type { Customer } from '../../constants/customer.types';
import type { Term } from '../../constants/term.types';

interface GlobalSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

function includesQuery(parts: string[], query: string) {
  return parts
    .join(' ')
    .toLocaleLowerCase('tr-TR')
    .includes(query);
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      return;
    }

    setCustomers(getAllCustomers());
    setTerms(getAllTerms());
  }, [visible]);

  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');

  const filteredCustomers = useMemo(() => {
    const base = normalizedQuery
      ? customers.filter(customer =>
        includesQuery(
          [
            customer.customerName,
            customer.companyName,
            customer.phone ?? '',
            customer.email ?? '',
          ],
          normalizedQuery,
        ),
      )
      : customers;

    return base.slice(0, 6);
  }, [customers, normalizedQuery]);

  const filteredTerms = useMemo(() => {
    const base = normalizedQuery
      ? terms.filter(term => {
        const customer = customers.find(item => item.id === term.customerId);

        return includesQuery(
          [
            term.productName,
            term.termDuration,
            customer?.companyName ?? '',
            customer?.customerName ?? '',
          ],
          normalizedQuery,
        );
      })
      : terms;

    return base.slice(0, 6);
  }, [customers, normalizedQuery, terms]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View className="flex-col gap-4">
        <View className="flex-row justify-end">
          <AppButton
            label={t('common.cancel')}
            onPress={onClose}
            variant="pill"
            compact
            iconOnly
            iconName="close"
          />
        </View>

        <View
          className="flex-row items-center gap-3 rounded-[22px] px-4"
          style={uiStyles.searchContainer}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={SMART_PDF_DARK.muted}
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('customersScreen.searchPlaceholder')}
            placeholderTextColor={SMART_PDF_DARK.muted}
            className="flex-1 py-0 text-[14px]"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="search"
            underlineColorAndroid="transparent"
            selectionColor={SMART_PDF_DARK.accent}
            style={uiStyles.titleText}
          />

          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.85}>
              <Ionicons
                name="close-outline"
                size={18}
                color={SMART_PDF_DARK.muted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          <View className="flex-col gap-5">
            {filteredCustomers.length ? (
              <View className="flex-col gap-2">
                <Text className="text-[12px] font-semibold" style={uiStyles.bodyText}>
                  {t('common.customers')}
                </Text>

                {filteredCustomers.map(customer => (
                  <TouchableOpacity
                    key={`customer-${customer.id}`}
                    onPress={() => {
                      onClose();
                      navigation.navigate('Customers', {
                        screen: 'CustomerDetail',
                        params: { customerId: customer.id },
                      });
                    }}
                    activeOpacity={0.88}
                    className="rounded-[20px] px-4 py-4"
                    style={{ backgroundColor: SMART_PDF_DARK.surfaceAlt }}
                  >
                    <Text
                      className="text-[15px] font-semibold"
                      style={uiStyles.titleText}
                      numberOfLines={1}
                    >
                      {customer.companyName}
                    </Text>
                    <Text
                      className="mt-1 text-[13px]"
                      style={uiStyles.bodyText}
                      numberOfLines={1}
                    >
                      {customer.customerName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {filteredTerms.length ? (
              <View className="flex-col gap-2">
                <Text className="text-[12px] font-semibold" style={uiStyles.bodyText}>
                  {t('common.terms')}
                </Text>

                {filteredTerms.map(term => {
                  const customer = customers.find(item => item.id === term.customerId);

                  return (
                    <TouchableOpacity
                      key={`term-${term.id}`}
                      onPress={() => {
                        onClose();
                        navigation.navigate('Terms');
                      }}
                      activeOpacity={0.88}
                      className="rounded-[20px] px-4 py-4"
                      style={{ backgroundColor: SMART_PDF_DARK.surfaceAlt }}
                    >
                      <Text
                        className="text-[15px] font-semibold"
                        style={uiStyles.titleText}
                        numberOfLines={1}
                      >
                        {term.productName}
                      </Text>
                      <Text
                        className="mt-1 text-[13px]"
                        style={uiStyles.bodyText}
                        numberOfLines={1}
                      >
                        {customer?.companyName ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {!filteredCustomers.length && !filteredTerms.length ? (
              <View className="rounded-[20px] px-4 py-5" style={{ backgroundColor: SMART_PDF_DARK.surfaceAlt }}>
                <Text className="text-[14px]" style={uiStyles.bodyText}>
                  {t('customersScreen.searchEmptyTitle')}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
};

export default GlobalSearchModal;
