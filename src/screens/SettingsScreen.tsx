import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import PageHeader from '../components/ui/PageHeader';
import { FLOATING_TAB_BAR, uiStyles, useAppTheme, type AppThemePreference } from '../components/ui/theme';
import {
  exportBackupExcelFile,
  exportBackupJsonFile,
  type BackupExportFile,
} from '../utils/backupUtils';
import {
  getNotificationDebugSummary,
  requestNotificationPermission,
  showTestNotification,
  syncTermReminders,
  type NotificationDebugSummary,
} from '../services/termNotifications';

const APP_VERSION = '0.0.1';

type ExportKind = 'json' | 'excel' | null;

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useAppTheme();
  const [isJsonBusy, setIsJsonBusy] = useState(false);
  const [isExcelBusy, setIsExcelBusy] = useState(false);
  const [isNotificationBusy, setIsNotificationBusy] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState<NotificationDebugSummary | null>(null);
  const [pendingExport, setPendingExport] = useState<ExportKind>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  const currentLanguage = (i18n.language || 'en').slice(0, 2);

  const languageButtons = [
    { code: 'en', label: t('languages.english'), flag: '🇺🇸' },
    { code: 'tr', label: t('languages.turkish'), flag: '🇹🇷' },
  ];

  const themeButtons: Array<{ code: AppThemePreference; label: string }> = [
    { code: 'light', label: t('settingsDashboard.themeOptions.light') },
    { code: 'dark', label: t('settingsDashboard.themeOptions.dark') },
  ];

  const refreshNotificationSummary = useCallback(async () => {
    try {
      const summary = await getNotificationDebugSummary();
      setNotificationSummary(summary);
    } catch {
      setNotificationSummary(null);
    }
  }, []);

  const handleNotificationPermission = useCallback(async () => {
    setIsNotificationBusy(true);

    try {
      const permission = await requestNotificationPermission();
      await refreshNotificationSummary();

      Alert.alert(
        t('settingsDashboard.notifications.permissionResultTitle'),
        t(`settingsDashboard.notifications.permissionStates.${permission}`),
      );
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.notifications.errorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.notifications.errorBody'),
      );
    } finally {
      setIsNotificationBusy(false);
    }
  }, [refreshNotificationSummary, t]);

  const handleTestNotification = useCallback(async () => {
    setIsNotificationBusy(true);

    try {
      await showTestNotification();
      await refreshNotificationSummary();

      Alert.alert(
        t('settingsDashboard.notifications.testSuccessTitle'),
        t('settingsDashboard.notifications.testSuccessBody'),
      );
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.notifications.errorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.notifications.errorBody'),
      );
    } finally {
      setIsNotificationBusy(false);
    }
  }, [refreshNotificationSummary, t]);

  const handleReminderSync = useCallback(async () => {
    setIsNotificationBusy(true);

    try {
      await syncTermReminders();
      await refreshNotificationSummary();

      Alert.alert(
        t('settingsDashboard.notifications.syncSuccessTitle'),
        t('settingsDashboard.notifications.syncSuccessBody'),
      );
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.notifications.errorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.notifications.errorBody'),
      );
    } finally {
      setIsNotificationBusy(false);
    }
  }, [refreshNotificationSummary, t]);

  React.useEffect(() => {
    refreshNotificationSummary().catch(() => undefined);
  }, [refreshNotificationSummary]);

  const deliverFile = useCallback(async (file: BackupExportFile) => {
    if (Platform.OS === 'android') {
      await FileSystem.cpExternal(file.path, file.filename, 'downloads');
      Alert.alert(
        t('settingsDashboard.downloadSuccessTitle'),
        t('settingsDashboard.downloadSuccessBody', {
          filename: file.filename,
        }),
      );

      return;
    }

    await Share.open({
      url: `file://${file.path}`,
      type: file.mimeType,
      filename: file.filename,
      failOnCancel: false,
      saveToFiles: true,
      title: file.filename,
    });
  }, [t]);

  const handleJsonDownload = useCallback(async () => {
    setIsJsonBusy(true);

    try {
      const jsonFile = await exportBackupJsonFile();
      await deliverFile(jsonFile);
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.exportErrorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.exportErrorBody'),
      );
    } finally {
      setIsJsonBusy(false);
      setPendingExport(null);
    }
  }, [deliverFile, t]);

  const handleExcelExport = useCallback(async () => {
    setIsExcelBusy(true);

    try {
      const excelFile = await exportBackupExcelFile();
      await deliverFile(excelFile);
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.exportExcelErrorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.exportExcelErrorBody'),
      );
    } finally {
      setIsExcelBusy(false);
      setPendingExport(null);
    }
  }, [deliverFile, t]);

  const handleConfirmExport = useCallback(() => {
    if (pendingExport === 'json') {
      handleJsonDownload().catch(() => undefined);
      return;
    }

    if (pendingExport === 'excel') {
      handleExcelExport().catch(() => undefined);
    }
  }, [handleExcelExport, handleJsonDownload, pendingExport]);

  return (
    <AppScreen>
      <BottomSheetModal
        visible={pendingExport !== null}
        onClose={() => setPendingExport(null)}
      >
        <View className="flex-col gap-4">
          <Text className="text-[22px] font-semibold" style={uiStyles.titleText}>
            {pendingExport === 'json'
              ? t('settingsDashboard.confirmJsonBody')
              : t('settingsDashboard.confirmExcelBody')}
          </Text>

          <View className="flex-row gap-3">
            <AppButton
              label={t('common.cancel')}
              onPress={() => setPendingExport(null)}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <AppButton
              label={t('settingsDashboard.confirmExportAction')}
              onPress={handleConfirmExport}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        visible={isAboutVisible}
        onClose={() => setIsAboutVisible(false)}
      >
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-[22px] font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.versionInfoTitle')}
              </Text>
              <Text className="text-sm" style={uiStyles.bodyText}>
                {t('settingsDashboard.versionLabel', { version: APP_VERSION })}
              </Text>
            </View>

            <AppButton
              label={t('common.cancel')}
              onPress={() => setIsAboutVisible(false)}
              variant="pill"
              compact
              iconOnly
              iconName="close"
            />
          </View>

          <Text className="text-base font-semibold" style={uiStyles.titleText}>
            {t('settingsDashboard.appInfoTitle')}
          </Text>

          <Text className="text-base font-semibold" style={uiStyles.titleText}>
            {t('settingsDashboard.securityTitle')}
          </Text>
        </View>
      </BottomSheetModal>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-6">
          <View className="flex-col gap-4">
            <PageHeader title={t('settingsDashboard.title')} />

            <View className="flex-col gap-4">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.languageTitle')}
              </Text>

              <View className="flex-row gap-3">
                {languageButtons.map(button => {
                  const isActive = currentLanguage === button.code;

                  return (
                    <AppButton
                      key={button.code}
                      label={`${button.flag} ${button.label}`}
                      onPress={() => i18n.changeLanguage(button.code).catch(() => undefined)}
                      variant={isActive ? 'primary' : 'secondary'}
                      style={{ flex: 1 }}
                    />
                  );
                })}
              </View>
            </View>

            <View className="flex-col gap-4">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.themeTitle')}
              </Text>

              <View className="flex-row gap-3">
                {themeButtons.map(button => {
                  const isActive = preference === button.code;

                  return (
                    <AppButton
                      key={button.code}
                      label={button.label}
                      onPress={() => setPreference(button.code).catch(() => undefined)}
                      variant={isActive ? 'primary' : 'secondary'}
                      style={{ flex: 1 }}
                    />
                  );
                })}
              </View>
            </View>

            <View className="flex-col gap-4">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.notifications.title')}
              </Text>

              <Text className="text-sm" style={uiStyles.bodyText}>
                {notificationSummary
                  ? t('settingsDashboard.notifications.summary', {
                    permission: t(`settingsDashboard.notifications.permissionStates.${notificationSummary.permission}`),
                    count: notificationSummary.scheduledCount,
                  })
                  : t('settingsDashboard.notifications.summaryUnavailable')}
              </Text>

              <View className="flex-col gap-3">
                <AppButton
                  label={t('settingsDashboard.notifications.permissionAction')}
                  onPress={() => handleNotificationPermission().catch(() => undefined)}
                  disabled={isNotificationBusy}
                  variant="primary"
                  iconName="notifications-outline"
                />

                <AppButton
                  label={t('settingsDashboard.notifications.testAction')}
                  onPress={() => handleTestNotification().catch(() => undefined)}
                  disabled={isNotificationBusy}
                  variant="secondary"
                  iconName="flash-outline"
                />

                <AppButton
                  label={t('settingsDashboard.notifications.syncAction')}
                  onPress={() => handleReminderSync().catch(() => undefined)}
                  disabled={isNotificationBusy}
                  variant="secondary"
                  iconName="refresh-outline"
                />
              </View>
            </View>

            <View className="flex-col gap-4">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.dataTitle')}
              </Text>

              <View className="flex-row gap-3">
                <AppButton
                  label={t('settingsDashboard.shortJsonAction')}
                  onPress={() => setPendingExport('json')}
                  disabled={isJsonBusy}
                  variant="primary"
                  iconName="download-outline"
                  style={{ flex: 1 }}
                />

                <AppButton
                  label={t('settingsDashboard.shortExcelAction')}
                  onPress={() => setPendingExport('excel')}
                  disabled={isExcelBusy}
                  variant="secondary"
                  iconName="download-outline"
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <View className="flex-col gap-4">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.versionTitle')}
              </Text>

              <AppButton
                label={t('settingsDashboard.versionAction')}
                onPress={() => setIsAboutVisible(true)}
                variant="pill"
                iconName="information-circle-outline"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default SettingsScreen;
