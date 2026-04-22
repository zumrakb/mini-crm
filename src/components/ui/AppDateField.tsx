import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDate, parseISODate } from '../../utils/dateUtils';
import AppButton from './AppButton';
import BottomSheetModal from './BottomSheetModal';
import {
  SMART_PDF_DARK,
  uiStyles,
} from './theme';

interface AppDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  error?: string;
  onChangeComplete?: () => void;
}

export interface AppDateFieldHandle {
  openPicker: () => void;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const AppDateField = forwardRef<AppDateFieldHandle, AppDateFieldProps>(({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  error,
  onChangeComplete,
}, ref) => {
  const { t, i18n } = useTranslation();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseISODate(value));

  const locale = useMemo(
    () => (i18n.language || 'tr').replace('_', '-'),
    [i18n.language],
  );
  const selectedDate = useMemo(() => parseISODate(value), [value]);

  const openAndroidPicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: 'date',
      display: 'calendar',
      maximumDate,
      minimumDate,
      onChange: (event, nextDate) => {
        if (event.type !== 'set' || !nextDate) {
          return;
        }

        onChange(formatDateKey(nextDate));
        onChangeComplete?.();
      },
    });
  }, [maximumDate, minimumDate, onChange, onChangeComplete, selectedDate]);

  const openPicker = useCallback(() => {
    if (Platform.OS === 'android') {
      openAndroidPicker();
      return;
    }

    setDraftDate(selectedDate);
    setIsPickerVisible(true);
  }, [openAndroidPicker, selectedDate]);

  const handleIOSPickerChange = useCallback(
    (_event: DateTimePickerEvent, nextDate?: Date) => {
      if (!nextDate) {
        return;
      }

      setDraftDate(nextDate);
    },
    [],
  );

  const handleApply = useCallback(() => {
    onChange(formatDateKey(draftDate));
    setIsPickerVisible(false);
    onChangeComplete?.();
  }, [draftDate, onChange, onChangeComplete]);

  useImperativeHandle(ref, () => ({
    openPicker,
  }), [openPicker]);

  return (
    <View className="flex-col gap-2">
      <Text className="text-sm font-semibold" style={uiStyles.titleText}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={openPicker}
        className="flex-row items-center justify-between rounded-[20px] px-4 py-3"
        style={uiStyles.inputBase}
        activeOpacity={0.85}
      >
        <View className="flex-row items-center gap-3">
          <Ionicons
            name="calendar-outline"
            size={18}
            color={SMART_PDF_DARK.accent}
          />
          <Text className="text-[15px]" style={uiStyles.titleText}>
            {formatDate(value, locale)}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={18}
          color={SMART_PDF_DARK.muted}
        />
      </TouchableOpacity>

      {error ? (
        <Text className="text-sm" style={uiStyles.errorText}>
          {error}
        </Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <BottomSheetModal
          visible={isPickerVisible}
          onClose={() => setIsPickerVisible(false)}
        >
          <View className="flex-col gap-4">
            <View className="flex-col gap-1">
              <Text
                className="text-[22px] font-semibold tracking-[-0.4px]"
                style={uiStyles.titleText}
              >
                {label}
              </Text>
              <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                {formatDate(formatDateKey(draftDate), locale)}
              </Text>
            </View>

            <View className="overflow-hidden rounded-[24px]" style={uiStyles.mutedSurface}>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={handleIOSPickerChange}
                themeVariant={
                  SMART_PDF_DARK.statusBar === 'light-content'
                    ? 'dark'
                    : 'light'
                }
                textColor={SMART_PDF_DARK.text}
              />
            </View>

            <View className="flex-row gap-3">
              <AppButton
                label={t('common.cancel')}
                onPress={() => setIsPickerVisible(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />

              <AppButton
                label={t('common.select')}
                onPress={handleApply}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </BottomSheetModal>
      ) : null}
    </View>
  );
});

export default AppDateField;
