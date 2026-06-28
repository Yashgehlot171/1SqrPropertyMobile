import {Alert} from 'react-native';

export function showToast(message: string): void {
  Alert.alert('UrbanKart', message);
  console.log(`[toast] ${message}`);
}
