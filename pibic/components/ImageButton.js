import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/style';

const ImageButton = ({ label, onPress, color }) => (
  <TouchableOpacity style={[styles.button, styles[color]]} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default ImageButton;
