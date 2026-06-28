import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import Colors from '@/Themes/Colors';

export default function Loader() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator color={Colors.secondary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.overlaySoft,
  },
});
