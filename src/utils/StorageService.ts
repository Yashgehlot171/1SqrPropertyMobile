import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  static async setItem<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async getItem<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  static async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  }

  static async clear() {
    await AsyncStorage.clear();
  }
}

export default StorageService;
