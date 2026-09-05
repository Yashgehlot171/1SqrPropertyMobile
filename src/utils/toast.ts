import {Alert} from 'react-native';

export function showToast(message: string): void {
  Alert.alert('1Square Property', message);
}
