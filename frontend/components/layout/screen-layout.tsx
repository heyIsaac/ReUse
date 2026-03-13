import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  /**
   * If true, removes the default horizontal padding (px-6 / 24px).
   * Useful for screens with full-width images or custom edge-to-edge layouts.
   */
  noPadding?: boolean;
  /**
   * Customize the background color. Defaults to transparent so it inherits from Navigation.
   */
  className?: string;
  /**
   * Apply safe area insets. Default is true for the top inset.
   */
  applyTopInset?: boolean;
  /**
   * Apply bottom safe area inset. Default is false.
   */
  applyBottomInset?: boolean;
}

export function ScreenLayout({
  children,
  noPadding = false,
  className = '',
  applyTopInset = true,
  applyBottomInset = false,
  style,
  ...props
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 ${!noPadding ? 'px-6' : ''} ${className}`}
      style={[
        {
          paddingTop: applyTopInset ? insets.top : 0,
          paddingBottom: applyBottomInset ? insets.bottom : 0,
        },
        style,
      ]}
      {...props}
    >
      <StatusBar style="auto" translucent />
      {children}
    </View>
  );
}
