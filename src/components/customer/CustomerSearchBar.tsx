import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SMART_PDF_DARK, uiStyles } from '../ui/theme';

interface CustomerSearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
}) => {
  const showClear = value.trim().length > 0 && typeof onClear === 'function';

  return (
    <View
      className="flex-row items-center gap-3 rounded-[20px] px-4"
      style={uiStyles.searchContainer}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={SMART_PDF_DARK.muted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={SMART_PDF_DARK.muted}
        className="flex-1 py-0 text-[15px]"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        underlineColorAndroid="transparent"
        selectionColor={SMART_PDF_DARK.accent}
        style={uiStyles.titleText}
      />

      {showClear ? (
        <TouchableOpacity
          onPress={onClear}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={uiStyles.mutedSurface}
          activeOpacity={0.85}
        >
          <Ionicons
            name="close-outline"
            size={18}
            color={SMART_PDF_DARK.muted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default CustomerSearchBar;
