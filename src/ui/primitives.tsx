import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, fonts } from './theme';

export function Type({ style, ...props }: TextProps & { children?: React.ReactNode }) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: fonts.body, color: colors.ink, fontSize: 14, lineHeight: 21 }, style]}
    />
  );
}
export function Eyebrow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextProps['style'];
}) {
  return (
    <Type
      style={[
        {
          fontFamily: fonts.bold,
          fontSize: 10,
          letterSpacing: 1.8,
          lineHeight: 16,
          color: colors.muted,
        },
        style,
      ]}
    >
      {children}
    </Type>
  );
}
export function Button({
  children,
  onPress,
  icon,
  secondary,
  disabled,
  accessibilityLabel,
  testID,
  style,
}: {
  children?: React.ReactNode;
  onPress: () => void;
  icon?: React.ReactNode;
  secondary?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {icon}
      <Type
        style={{
          color: secondary ? colors.ink : colors.paper,
          fontFamily: fonts.bold,
          fontSize: 13,
        }}
      >
        {children}
      </Type>
    </Pressable>
  );
}
export function Sheet({
  visible,
  title,
  eyebrow,
  children,
  onClose,
  wide = false,
}: {
  visible: boolean;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
        />
        <View
          accessibilityViewIsModal
          role="dialog"
          aria-modal={true}
          aria-label={title}
          style={[styles.sheet, { maxWidth: wide ? 680 : 500 }]}
        >
          <View style={styles.sheetTop}>
            <View style={{ flex: 1 }}>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <Type accessibilityRole="header" style={styles.sheetTitle}>
                {title}
              </Type>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={styles.close}
            >
              <X size={20} color={colors.secondary} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: colors.green,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
  },
  secondary: { backgroundColor: colors.paper, borderColor: colors.line },
  backdrop: {
    flex: 1,
    backgroundColor: '#26352D88',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    boxShadow: '0 12px 80px #17251D30',
    overflow: 'hidden',
  },
  sheetTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 26,
    paddingBottom: 18,
    gap: 10,
  },
  sheetTitle: { fontFamily: fonts.title, fontSize: 29, lineHeight: 36, marginTop: 5 },
  close: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
  },
});
