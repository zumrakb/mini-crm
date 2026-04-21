import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dirs, FileSystem } from 'react-native-file-access';
import Share from 'react-native-share';
import AppButton from '../components/ui/AppButton';
import AppScreen from '../components/ui/AppScreen';
import PageHeader from '../components/ui/PageHeader';
import { uiStyles } from '../components/ui/theme';
import {
  exportBackupExcelFile,
  exportBackupJsonFile,
  type BackupExportFile,
} from '../utils/backupUtils';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isJsonBusy, setIsJsonBusy] = useState(false);
  const [isExcelBusy, setIsExcelBusy] = useState(false);

  const currentLanguage = (i18n.language || 'en').slice(0, 2);

  const languageButtons = [
    { code: 'en', label: t('languages.english'), flag: '🇺🇸' },
    { code: 'tr', label: t('languages.turkish'), flag: '🇹🇷' },
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
    }
  }, [deliverFile, t]);

  return (
    <AppScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-6 pt-6">
          <View className="flex-col gap-6">
            <PageHeader title={t('settingsDashboard.title')} />

            <View className="flex-col gap-3">
              <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                Dil Yönetimi
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

            <View className="flex-col gap-3">
              <Text className="text-sm font-semibold" style={uiStyles.titleText}>
                Veriler
              </Text>

              <AppButton
                label={t('settingsDashboard.downloadJsonAction')}
                onPress={() => {
                  void handleJsonDownload();
                }}
                disabled={isJsonBusy}
                variant="primary"
                iconName="download-outline"
              />

              <AppButton
                label={t('settingsDashboard.downloadExcelAction')}
                onPress={() => {
                  void handleExcelExport();
                }}
                disabled={isExcelBusy}
                variant="secondary"
                iconName="download-outline"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default SettingsScreen;
