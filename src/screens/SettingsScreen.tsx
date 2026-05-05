import React, { useCallback, useEffect, useState } from 'react';
import {
  useFocusEffect,
} from '@react-navigation/native';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import AppTopBar, {
  AvatarCircle,
  BrandWordmark,
  SearchGlyph,
} from '../components/ui/AppTopBar';
import BottomSheetModal from '../components/ui/BottomSheetModal';
import InlineGlobalSearch from '../components/ui/InlineGlobalSearch';
import SurfaceCard from '../components/ui/SurfaceCard';
import { FLOATING_TAB_BAR, SMART_PDF_DARK, uiStyles, useAppTheme, type AppThemePreference } from '../components/ui/theme';
import {
  exportBackupExcelFile,
  exportBackupJsonFile,
  type BackupExportFile,
} from '../utils/backupUtils';
import {
  appendDemoData,
  getDemoDataSummary,
  removeDemoData,
  type DemoDataSummary,
} from '../utils/demoData';
import {
  getNotificationDebugSummary,
  requestNotificationPermission,
  showTestNotification,
  syncTermReminders,
  type NotificationDebugSummary,
} from '../services/termNotifications';
import { useCustomerStore } from '../store/customer.store';
import { useTermStore } from '../store/term.store';

const APP_VERSION = '0.0.1';

type DataActionKind = 'json' | 'excel' | 'demo' | 'demoRemove' | null;

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useAppTheme();
  const [isJsonBusy, setIsJsonBusy] = useState(false);
  const [isExcelBusy, setIsExcelBusy] = useState(false);
  const [isDemoBusy, setIsDemoBusy] = useState(false);
  const [demoSummary, setDemoSummary] = useState<DemoDataSummary | null>(null);
  const [isNotificationBusy, setIsNotificationBusy] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState<NotificationDebugSummary | null>(null);
  const [pendingDataAction, setPendingDataAction] = useState<DataActionKind>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const loadCustomers = useCustomerStore(state => state.load);
  const loadTerms = useTermStore(state => state.load);

  const currentLanguage = (i18n.language || 'en').slice(0, 2);
  const languageButtons = [
    { code: 'en', label: t('languages.english'), icon: 'language-outline' as const },
    { code: 'tr', label: t('languages.turkish'), icon: 'globe-outline' as const },
  ];
  const themeButtons: Array<{
    code: AppThemePreference;
    label: string;
    iconName: React.ComponentProps<typeof Ionicons>['name'];
  }> = [
    { code: 'light', label: t('settingsDashboard.themeOptions.light'), iconName: 'sunny-outline' },
    { code: 'dark', label: t('settingsDashboard.themeOptions.dark'), iconName: 'moon-outline' },
  ];
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');
  const hasDemoData = demoSummary?.hasDemoData ?? false;
  const isDataActionBusy = isJsonBusy || isExcelBusy || isDemoBusy;
  const demoPrimaryActionLabel = isDemoBusy && pendingDataAction === 'demo'
    ? t('settingsDashboard.demoWorkingAction')
    : hasDemoData
      ? t('settingsDashboard.demoRefreshAction')
      : t('settingsDashboard.demoShowAction');
  const demoRemoveActionLabel = isDemoBusy && pendingDataAction === 'demoRemove'
    ? t('settingsDashboard.demoRemoveWorkingAction')
    : t('settingsDashboard.demoRemoveAction');
  const demoStatusText = hasDemoData && demoSummary
    ? t('settingsDashboard.demoActiveSummary', {
      customers: demoSummary.customers,
      terms: demoSummary.terms,
      activities: demoSummary.activities,
    })
    : t('settingsDashboard.demoEmptySummary');
  const confirmDataActionLabel = pendingDataAction === 'demo'
    ? t('settingsDashboard.confirmDemoAction')
    : pendingDataAction === 'demoRemove'
      ? t('settingsDashboard.confirmDemoRemoveAction')
      : t('settingsDashboard.confirmExportAction');

  const refreshDemoSummary = useCallback(() => {
    setDemoSummary(getDemoDataSummary());
  }, []);

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

  useEffect(() => {
    refreshNotificationSummary().catch(() => undefined);
    refreshDemoSummary();
  }, [refreshDemoSummary, refreshNotificationSummary]);

  useFocusEffect(
    useCallback(() => {
      refreshDemoSummary();

      return () => {
        setIsSearchVisible(false);
        setSearchQuery('');
      };
    }, [refreshDemoSummary]),
  );

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
      setPendingDataAction(null);
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
      setPendingDataAction(null);
    }
  }, [deliverFile, t]);

  const handleDemoImport = useCallback(async () => {
    setIsDemoBusy(true);

    try {
      appendDemoData();
      loadCustomers();
      loadTerms();
      refreshDemoSummary();
      await syncTermReminders();
      await refreshNotificationSummary();

      Alert.alert(
        t('settingsDashboard.demoImportSuccessTitle'),
        t('settingsDashboard.demoImportSuccessBody'),
      );
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.demoImportErrorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.demoImportErrorBody'),
      );
    } finally {
      setIsDemoBusy(false);
      setPendingDataAction(null);
    }
  }, [loadCustomers, loadTerms, refreshDemoSummary, refreshNotificationSummary, t]);

  const handleDemoRemove = useCallback(async () => {
    setIsDemoBusy(true);

    try {
      removeDemoData();
      loadCustomers();
      loadTerms();
      refreshDemoSummary();
      await syncTermReminders();
      await refreshNotificationSummary();

      Alert.alert(
        t('settingsDashboard.demoRemoveSuccessTitle'),
        t('settingsDashboard.demoRemoveSuccessBody'),
      );
    } catch (error) {
      Alert.alert(
        t('settingsDashboard.demoRemoveErrorTitle'),
        error instanceof Error ? error.message : t('settingsDashboard.demoRemoveErrorBody'),
      );
    } finally {
      setIsDemoBusy(false);
      setPendingDataAction(null);
    }
  }, [loadCustomers, loadTerms, refreshDemoSummary, refreshNotificationSummary, t]);

  const handleConfirmDataAction = useCallback(() => {
    if (pendingDataAction === 'json') {
      handleJsonDownload().catch(() => undefined);
      return;
    }

    if (pendingDataAction === 'excel') {
      handleExcelExport().catch(() => undefined);
      return;
    }

    if (pendingDataAction === 'demo') {
      handleDemoImport().catch(() => undefined);
      return;
    }

    if (pendingDataAction === 'demoRemove') {
      handleDemoRemove().catch(() => undefined);
    }
  }, [handleDemoImport, handleDemoRemove, handleExcelExport, handleJsonDownload, pendingDataAction]);

  const showThemeSection = !normalizedSearchQuery || [
    t('settingsDashboard.themeTitle'),
    ...themeButtons.map(button => button.label),
  ].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedSearchQuery);

  const showLanguageSection = !normalizedSearchQuery || [
    t('settingsDashboard.languageTitle'),
    ...languageButtons.map(button => button.label),
  ].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedSearchQuery);

  const showNotificationSection = !normalizedSearchQuery || [
    t('settingsDashboard.notifications.title'),
    t('settingsDashboard.notifications.permissionAction'),
    t('settingsDashboard.notifications.syncAction'),
  ].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedSearchQuery);

  const showDataSection = !normalizedSearchQuery || [
    t('settingsDashboard.dataTitle'),
    t('settingsDashboard.shortJsonAction'),
    t('settingsDashboard.shortExcelAction'),
    t('settingsDashboard.demoImportAction'),
    t('settingsDashboard.demoShowAction'),
    t('settingsDashboard.demoRefreshAction'),
    t('settingsDashboard.demoRemoveAction'),
  ].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedSearchQuery);

  const showAboutAction = !normalizedSearchQuery || [
    t('settingsDashboard.versionAction'),
    t('settingsDashboard.versionInfoTitle'),
  ].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedSearchQuery);
  const hasSearchResults = (
    showThemeSection
    || showLanguageSection
    || showNotificationSection
    || showDataSection
    || showAboutAction
  );

  return (
    <AppScreen>
      <BottomSheetModal
        visible={pendingDataAction !== null}
        onClose={() => {
          if (!isDataActionBusy) {
            setPendingDataAction(null);
          }
        }}
      >
        <View className="flex-col gap-4">
          <Text className="text-[22px] font-semibold tracking-[-0.4px]" style={uiStyles.titleText}>
            {pendingDataAction === 'json'
              ? t('settingsDashboard.confirmJsonBody')
              : pendingDataAction === 'excel'
                ? t('settingsDashboard.confirmExcelBody')
                : pendingDataAction === 'demoRemove'
                  ? t('settingsDashboard.confirmDemoRemoveBody')
                  : t('settingsDashboard.confirmDemoBody')}
          </Text>

          <View className="flex-row gap-3">
            <AppButton
              label={t('common.cancel')}
              onPress={() => setPendingDataAction(null)}
              disabled={isDataActionBusy}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <AppButton
              label={confirmDataActionLabel}
              onPress={handleConfirmDataAction}
              disabled={isDataActionBusy}
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
              <Text className="text-[20px] font-semibold tracking-[-0.3px]" style={uiStyles.titleText}>
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
          <Text className="text-[14px] leading-6" style={uiStyles.bodyText}>
            {t('settingsDashboard.aboutPrivacyLineOne')}
          </Text>
          <Text className="text-[14px] leading-6" style={uiStyles.bodyText}>
            {t('settingsDashboard.aboutPrivacyLineTwo')}
          </Text>
          <Text className="text-[14px] leading-6" style={uiStyles.bodyText}>
            {t('settingsDashboard.aboutPrivacyLineThree')}
          </Text>
        </View>
      </BottomSheetModal>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR.contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-6 pt-6">
          <View className="flex-col gap-6">
            <View style={{ minHeight: 40, position: 'relative' }}>
              <AppTopBar
                left={(
                  <>
                    <AvatarCircle image="profile" size={34} />
                    <BrandWordmark label={t('settingsDashboard.title')} />
                  </>
                )}
                right={<SearchGlyph onPress={() => setIsSearchVisible(current => !current)} />}
              />

              <InlineGlobalSearch
                visible={isSearchVisible}
                query={searchQuery}
                onChangeText={setSearchQuery}
                onClose={() => setIsSearchVisible(false)}
                placeholder={t('common.pageSearchPlaceholder')}
                showNoResults={Boolean(normalizedSearchQuery) && !hasSearchResults}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20 }}
              />
            </View>

            {showThemeSection ? (
              <SurfaceCard>
              <View className="flex-col gap-4">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="color-palette-outline" size={22} color={SMART_PDF_DARK.accent} />
                  <Text className="text-[18px] font-semibold tracking-[-0.4px]" style={uiStyles.titleText}>
                    {t('settingsDashboard.themeTitle')}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  {themeButtons.map(button => {
                    const isActive = preference === button.code;

                    return (
                      <AppButton
                        key={button.code}
                        label={button.label}
                        onPress={() => setPreference(button.code).catch(() => undefined)}
                        variant={isActive ? 'soft' : 'secondary'}
                        style={{
                          flex: 1,
                        }}
                        iconName={button.iconName}
                      />
                    );
                  })}
                </View>
              </View>
              </SurfaceCard>
            ) : null}

            {showLanguageSection ? (
              <SurfaceCard>
              <View className="flex-col gap-4">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="language-outline" size={22} color={SMART_PDF_DARK.secondaryText} />
                  <Text className="text-[18px] font-semibold tracking-[-0.4px]" style={uiStyles.titleText}>
                    {t('settingsDashboard.languageTitle')}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  {languageButtons.map(button => {
                    const isActive = currentLanguage === button.code;

                    return (
                      <AppButton
                        key={button.code}
                        label={button.label}
                        onPress={() => i18n.changeLanguage(button.code).catch(() => undefined)}
                        variant={isActive ? 'soft' : 'secondary'}
                        iconName={button.icon}
                        style={{ flex: 1 }}
                      />
                    );
                  })}
                </View>
              </View>
              </SurfaceCard>
            ) : null}

            {showNotificationSection ? (
              <SurfaceCard>
              <View className="flex-col gap-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="notifications-outline" size={22} color={SMART_PDF_DARK.accent} />
                    <Text className="text-[18px] font-semibold tracking-[-0.4px]" style={uiStyles.titleText}>
                      {t('settingsDashboard.notifications.title')}
                    </Text>
                  </View>

                  <AppButton
                    label={t('settingsDashboard.notifications.testInlineAction')}
                    onPress={() => handleTestNotification().catch(() => undefined)}
                    variant="pill"
                    compact
                  />
                </View>

                {notificationSummary ? (
                  <Text className="text-[13px] leading-5" style={uiStyles.bodyText}>
                    {t('settingsDashboard.notifications.summary', {
                      permission: t(`settingsDashboard.notifications.permissionStates.${notificationSummary.permission}`),
                      count: notificationSummary.scheduledCount,
                    })}
                  </Text>
                ) : null}

                <View className="flex-row gap-2">
                  <AppButton
                    label={t('settingsDashboard.notifications.permissionAction')}
                    onPress={() => handleNotificationPermission().catch(() => undefined)}
                    disabled={isNotificationBusy}
                    variant="primary"
                    iconName="notifications-outline"
                    style={{ flex: 1 }}
                  />

                  <AppButton
                    label={t('settingsDashboard.notifications.syncAction')}
                    onPress={() => handleReminderSync().catch(() => undefined)}
                    disabled={isNotificationBusy}
                    variant="secondary"
                    iconName="refresh-outline"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              </SurfaceCard>
            ) : null}

            {showDataSection ? (
              <SurfaceCard>
              <View className="flex-col gap-4">
                <Text className="text-[18px] font-semibold tracking-[-0.4px]" style={uiStyles.titleText}>
                  {t('settingsDashboard.dataTitle')}
                </Text>

                <Text className="text-[13px] leading-5" style={uiStyles.bodyText}>
                  {demoStatusText}
                </Text>

                <AppButton
                  label={demoPrimaryActionLabel}
                  onPress={() => setPendingDataAction('demo')}
                  disabled={isDemoBusy}
                  variant="primary"
                  iconName={hasDemoData ? 'refresh-outline' : 'sparkles-outline'}
                />

                <AppButton
                  label={demoRemoveActionLabel}
                  onPress={() => setPendingDataAction('demoRemove')}
                  disabled={isDemoBusy || !hasDemoData}
                  variant="secondary"
                  iconName="trash-outline"
                />

                <View className="flex-row gap-2">
                  <AppButton
                    label={t('settingsDashboard.shortJsonAction')}
                    onPress={() => setPendingDataAction('json')}
                    disabled={isJsonBusy}
                    variant="secondary"
                    iconName="download-outline"
                    style={{ flex: 1 }}
                  />

                  <AppButton
                    label={t('settingsDashboard.shortExcelAction')}
                    onPress={() => setPendingDataAction('excel')}
                    disabled={isExcelBusy}
                    variant="soft"
                    iconName="download-outline"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              </SurfaceCard>
            ) : null}

            {showAboutAction ? (
              <AppButton
                label={t('settingsDashboard.versionAction')}
                onPress={() => setIsAboutVisible(true)}
                variant="pill"
                iconName="information-circle-outline"
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default SettingsScreen;
