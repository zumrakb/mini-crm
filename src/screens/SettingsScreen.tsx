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
import SurfaceCard from '../components/ui/SurfaceCard';
import { FLOATING_TAB_BAR, uiStyles, useAppTheme, type AppThemePreference } from '../components/ui/theme';
import {
  exportBackupExcelFile,
  exportBackupJsonFile,
  type BackupExportFile,
} from '../utils/backupUtils';

const APP_VERSION = '0.0.1';

type ExportKind = 'json' | 'excel' | null;

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useAppTheme();
  const [isJsonBusy, setIsJsonBusy] = useState(false);
  const [isExcelBusy, setIsExcelBusy] = useState(false);
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
      void handleJsonDownload();
      return;
    }

    if (pendingExport === 'excel') {
      void handleExcelExport();
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

          <SurfaceCard tone="soft">
            <View className="flex-col gap-3">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.appInfoTitle')}
              </Text>
              <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                {t('settingsDashboard.appInfoBody')}
              </Text>
            </View>
          </SurfaceCard>

          <SurfaceCard tone="soft">
            <View className="flex-col gap-3">
              <Text className="text-base font-semibold" style={uiStyles.titleText}>
                {t('settingsDashboard.securityTitle')}
              </Text>
              <Text className="text-sm leading-6" style={uiStyles.bodyText}>
                {t('settingsDashboard.securityBody')}
              </Text>
            </View>
          </SurfaceCard>
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

            <SurfaceCard>
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
                        onPress={() => {
                          void i18n.changeLanguage(button.code);
                        }}
                        variant={isActive ? 'primary' : 'secondary'}
                        style={{ flex: 1 }}
                      />
                    );
                  })}
                </View>
              </View>
            </SurfaceCard>

            <SurfaceCard>
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
                        onPress={() => {
                          void setPreference(button.code);
                        }}
                        variant={isActive ? 'primary' : 'secondary'}
                        style={{ flex: 1 }}
                      />
                    );
                  })}
                </View>
              </View>
            </SurfaceCard>

            <SurfaceCard>
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
            </SurfaceCard>

            <SurfaceCard tone="soft">
              <View className="flex-col gap-4">
                <View className="flex-row items-center justify-between gap-4">
                  <View className="gap-1">
                    <Text className="text-base font-semibold" style={uiStyles.titleText}>
                      {t('settingsDashboard.versionTitle')}
                    </Text>
                    <Text className="text-sm" style={uiStyles.bodyText}>
                      {t('settingsDashboard.versionLabel', { version: APP_VERSION })}
                    </Text>
                  </View>

                  <AppButton
                    label={t('settingsDashboard.versionAction')}
                    onPress={() => setIsAboutVisible(true)}
                    variant="pill"
                    iconName="information-circle-outline"
                  />
                </View>
              </View>
            </SurfaceCard>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default SettingsScreen;
