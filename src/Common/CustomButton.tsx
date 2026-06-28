import React from 'react';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';

import {AppButton} from '@/components/common/AppButton';

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function CustomButton({
  title,
  onPress,
  disabled,
  style,
}: CustomButtonProps) {
  return (
    <AppButton
      disabled={disabled}
      label={title}
      onPress={onPress}
      style={style as ViewStyle}
    />
  );
}
