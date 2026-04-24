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
import { getTermStatusTranslationKey, TERM_STATUS } from '../../constants/termStatus';
import type { Term } from '../../constants/term.types';
import { formatDate } from '../../utils/dateUtils';
import { useActivityStore } from '../../store/activity.store';
import { useTermStore } from '../../store/term.store';
import NewTermModal from '../../modals/NewTermModal';
import { SHADOWS, SMART_PDF_DARK, surfaceStyles } from '../ui/theme';

interface TermItemProps {
  term: Term;
  companyName?: string;
}

function normalizeLegacyTermDuration(value: string): string {
  return value
    .replace(/\bAyni\b/g, 'Aynı')
    .replace(/\bgun\b/g, 'gün');
}

function getStatusStyles(status: Term['status']) {
  if (status === TERM_STATUS.ARRIVED) {
    return {
      badgeBackground: SMART_PDF_DARK.successSurface,
      badgeText: SMART_PDF_DARK.success,
    } as const;
  }

  return {
    badgeBackground: SMART_PDF_DARK.accentSurface,
    badgeText:
      SMART_PDF_DARK.statusBar === 'light-content'
        ? SMART_PDF_DARK.accentMuted
        : SMART_PDF_DARK.accent,
  } as const;
}

const TermItem: React.FC<TermItemProps> = ({ term, companyName }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<React.ElementRef<typeof TouchableOpacity> | null>(null);
  const updateStatus = useTermStore(state => state.updateStatus);
  const loadActivitiesByCustomer = useActivityStore(state => state.loadByCustomer);
  const statusOptions = [TERM_STATUS.ORDERED, TERM_STATUS.PENDING, TERM_STATUS.ARRIVED];
  const menuWidth = 152;
  const tone = getStatusStyles(term.status);
  const menuPanelStyle = {
    position: 'absolute' as const,
    width: menuWidth,
    borderRadius: 16,
    padding: 4,
    backgroundColor: SMART_PDF_DARK.surface,
    ...SHADOWS.floatingCompact,
  };
  const menuItemStyle = {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  };
  const menuItemActiveStyle = {
    backgroundColor: SMART_PDF_DARK.accentSurface,
  };
  const menuItemTextStyle = {
    color: SMART_PDF_DARK.muted,
  };
  const menuItemTextActiveStyle = {
    color: SMART_PDF_DARK.accent,
    fontWeight: '700' as const,
  };
  const menuDividerStyle = {
    height: 1,
    marginVertical: 4,
    backgroundColor: SMART_PDF_DARK.divider,
  };
  const detailRows = [
    { label: t('termItem.productLabel'), value: term.productName },
    {
      label: t('termItem.companyLabel'),
      value: companyName || t('termItem.companyFallback'),
    },
    {
      label: t('termItem.durationLabel'),
      value: normalizeLegacyTermDuration(term.termDuration),
    },
    {
      label: t('termItem.statusLabel'),
      value: t(getTermStatusTranslationKey(term.status)),
    },
    {
      label: t('termItem.orderDateLabel'),
      value: formatDate(term.orderDate),
    },
    {
      label: t('termItem.expectedDateLabel'),
      value: formatDate(term.expectedDate),
    },
  ];

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
        visible={isDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDetailVisible(false)}
      >
        <Pressable style={styles.detailBackdrop} onPress={() => setIsDetailVisible(false)}>
          <Pressable style={styles.detailModal}>
            <Text
              className="text-[18px] font-semibold tracking-[-0.3px]"
              style={{ color: SMART_PDF_DARK.text }}
            >
              {t('termItem.detailTitle')}
            </Text>

            <View className="mt-4 flex-col gap-3">
              {detailRows.map(row => (
                <View key={row.label} className="gap-1">
                  <Text
                    className="text-[11px] font-semibold"
                    style={{ color: SMART_PDF_DARK.muted }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    className="text-[14px] leading-5"
                    style={{ color: SMART_PDF_DARK.text }}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setIsMenuOpen(false)}>
          <Pressable style={[menuPanelStyle, menuPosition]}>
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
                  style={[
                    menuItemStyle,
                    isSelected ? menuItemActiveStyle : null,
                  ]}
                >
                  <Text
                    className="text-sm"
                    style={[
                      menuItemTextStyle,
                      isSelected ? menuItemTextActiveStyle : null,
                    ]}
                  >
                    {t(getTermStatusTranslationKey(status))}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={menuDividerStyle} />

            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                setIsEditVisible(true);
              }}
              activeOpacity={0.85}
              style={menuItemStyle}
            >
              <Text className="text-sm" style={menuItemTextStyle}>
                {t('termItem.edit')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <TouchableOpacity
        onPress={() => setIsDetailVisible(true)}
        activeOpacity={0.9}
        className="rounded-[22px] px-4 py-4"
        style={surfaceStyles.card}
      >
        <View className="flex-col gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text
                className="text-[15px] font-semibold leading-5 tracking-[-0.3px]"
                style={{ color: SMART_PDF_DARK.text }}
                numberOfLines={2}
              >
                {term.productName}
              </Text>
              <Text
                className="mt-0.5 text-[12px] leading-5"
                style={{ color: SMART_PDF_DARK.muted }}
                numberOfLines={1}
              >
                {companyName || normalizeLegacyTermDuration(term.termDuration)}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: tone.badgeBackground }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{ color: tone.badgeText }}
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

          <Text
            className="text-[12px] font-medium leading-5"
            style={{ color: SMART_PDF_DARK.muted }}
            numberOfLines={1}
          >
            {`${formatDate(term.orderDate)} - ${formatDate(term.expectedDate)}`}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = {
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  detailBackdrop: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: SMART_PDF_DARK.backdrop,
  },
  detailModal: {
    width: '100%' as const,
    maxWidth: 320,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: SMART_PDF_DARK.surface,
    ...SHADOWS.floatingCompact,
  },
};

export default TermItem;
