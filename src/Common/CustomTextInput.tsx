import React from 'react';
import {TextInputProps} from 'react-native';

import {AppInput} from '@/components/common/AppInput';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  length?: number;
  readOnly?: boolean;
}

export default function CustomTextInput({
  error,
  length,
  readOnly,
  ...rest
}: CustomTextInputProps) {
  return (
    <AppInput
      editable={!readOnly}
      errorMessage={error}
      maxLength={length}
      {...rest}
    />
  );
}
