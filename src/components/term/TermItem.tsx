import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getTermStatusTranslationKey,
  isPendingTermStatus,
  TERM_STATUS,
} from '../../constants/termStatus';
import type { Term } from '../../constants/term.types';
import { SHADOWS, SMART_PDF_DARK, surfaceStyles, uiStyles } from '../ui/theme';
import { formatDate } from '../../utils/dateUtils';
import { useActivityStore } from '../../store/activity.store';
import { useTermStore } from '../../store/term.store';
import NewTermModal from '../../modals/NewTermModal';

interface TermItemProps {
  term: Term;
}

function normalizeLegacyTermDuration(value: string): string {
  return value
    .replace(/\bAyni\b/g, 'Aynı')
    .replace(/\bgun\b/g, 'gün');
}

const TermItem: React.FC<TermItemProps> = ({ term }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<React.ElementRef<typeof TouchableOpacity> | null>(null);
  const updateStatus = useTermStore(state => state.updateStatus);
  const loadActivitiesByCustomer = useActivityStore(
    state => state.loadByCustomer,
  );
  const statusOptions = [
    TERM_STATUS.ORDERED,
    TERM_STATUS.PENDING,
    TERM_STATUS.ARRIVED,
  ];
  const menuWidth = 170;
  const styles = createStyles();

  const openMenu = () => {
    menuButtonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const screenWidth = Dimensions.get('window').width;
      const maxLeft = screenWidth - menuWidth - 16;

      setMenuPosition({
        top: y + height + 8,
        left: Math.min(Math.max(x + width - menuWidth, 16), maxLeft),
      });
      setIsMenuOpen(true);
    });
  };

  return (
    <>
    <NewTermModal
      visible={isEditVisible}
      customerId={term.customerId}
      term={term}
      onClose={() => setIsEditVisible(false)}
    />
    <Modal
      visible={isMenuOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsMenuOpen(false)}
    >
      <Pressable style={styles.menuBackdrop} onPress={() => setIsMenuOpen(false)}>
        <Pressable style={[styles.menuPanel, menuPosition]}>
          {statusOptions.map(status => {
            const isSelected = term.status === status;

            return (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  updateStatus(term.id, term.customerId, status).catch(() => undefined);
                  loadActivitiesByCustomer(term.customerId);
                  setIsMenuOpen(false);
                }}
                activeOpacity={0.85}
                style={styles.menuItem}
              >
                <Text
                  className="text-sm"
                  style={[
                    styles.menuItemText,
                    isSelected ? styles.menuItemTextActive : null,
                  ]}
                >
                  {t(getTermStatusTranslationKey(status))}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.menuDivider} />

          <TouchableOpacity
            onPress={() => {
              setIsMenuOpen(false);
              setIsEditVisible(true);
            }}
            activeOpacity={0.85}
            style={styles.menuItem}
          >
            <Text className="text-sm" style={styles.menuItemText}>
              {t('termItem.edit')}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
    <View
      className="rounded-[20px] px-4 py-4"
      style={[
        surfaceStyles.card,
        {
          backgroundColor: SMART_PDF_DARK.surface,
        },
      ]}
    >
      <View className="flex-col gap-2.5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Text
                className="flex-shrink text-sm font-semibold leading-5"
                style={uiStyles.titleText}
                numberOfLines={1}
              >
                {term.productName}
              </Text>
              <Text className="text-xs leading-5" style={uiStyles.bodyText}>
                {normalizeLegacyTermDuration(term.termDuration)}
              </Text>
            </View>
          </View>

          <View className="items-end gap-2" style={styles.menuWrap}>
            <View className="flex-row items-center gap-2">
              <View
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: isPendingTermStatus(term.status)
                    ? SMART_PDF_DARK.accent
                    : SMART_PDF_DARK.surfaceMuted,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isPendingTermStatus(term.status)
                      ? '#FFFFFF'
                      : SMART_PDF_DARK.text,
                  }}
                >
                  {t(getTermStatusTranslationKey(term.status))}
                </Text>
              </View>

              <TouchableOpacity
                ref={menuButtonRef}
                onPress={openMenu}
                activeOpacity={0.85}
                style={styles.menuButton}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={16}
                  color={SMART_PDF_DARK.muted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-col gap-2" style={styles.metaBlock}>
          <View className="flex-row items-center gap-3">
            <Text className="flex-1 text-xs leading-5" style={styles.metaText}>
              {t('termItem.orderDateLabel')}:{' '}
              <Text style={styles.metaDateText}>{formatDate(term.orderDate)}</Text>
            </Text>
            <Text className="flex-1 text-xs leading-5" style={styles.metaText}>
              {t('termItem.expectedDateLabel')}:{' '}
              <Text style={styles.metaDateText}>{formatDate(term.expectedDate)}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
    </>
  );
};

function createStyles() {
  return {
    menuWrap: {
      position: 'relative' as const,
    },
    menuButton: {
      width: 16,
      height: 20,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: 'transparent',
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    menuPanel: {
      position: 'absolute' as const,
      width: 170,
      borderRadius: 16,
      padding: 4,
      backgroundColor: SMART_PDF_DARK.surface,
      borderWidth: 0,
      borderColor: 'transparent',
      zIndex: 20,
      ...SHADOWS.floatingCompact,
      elevation: SMART_PDF_DARK.statusBar === 'light-content' ? 6 : 0,
    },
    menuItem: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: 'transparent',
    },
    menuItemText: {
      color: SMART_PDF_DARK.muted,
    },
    menuItemTextActive: {
      color: SMART_PDF_DARK.accent,
    },
    metaBlock: {
      paddingTop: 2,
    },
    metaText: {
      color: SMART_PDF_DARK.text,
    },
    metaDateText: {
      color: SMART_PDF_DARK.text,
      fontWeight: '700' as const,
    },
    menuDivider: {
      height: 1,
      backgroundColor: SMART_PDF_DARK.divider,
      marginVertical: 3,
    },
  };
}

export default TermItem;
