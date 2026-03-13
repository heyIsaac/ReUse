import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export interface ToastProps {
  message: string;
  type?: 'error' | 'warning' | 'success';
  visible: boolean;
  topOffset: number;
}

export function Toast({ message, type = 'error', visible, topOffset }: ToastProps) {
  if (!visible) return null;

  const bgColors = {
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
  };

  return (
    <View
      className={`absolute left-6 right-6 ${bgColors[type]} rounded-2xl p-4 shadow-lg z-50 flex-row items-center`}
      style={{ top: topOffset }}
    >
      <Text className="text-white font-bold text-base">
        {message}
      </Text>
    </View>
  );
}
