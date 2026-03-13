import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface AvatarProps {
  uri?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, size = 48 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D1D6',
  },
});
