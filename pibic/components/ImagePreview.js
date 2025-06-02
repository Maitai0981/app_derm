import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../styles/style.js';
import { useTheme } from '../context/ThemeContext';

const ImagePreview = ({ uri }) => {
  const { text } = useTheme(); // Pegando a cor do texto do tema

  return (
    <View style={styles.previewContainer}>
      <Text style={[styles.previewText, { color: text }]}>
        Pré-visualização da Imagem
      </Text>
      <Image source={{ uri }} style={styles.imagePreview} />
    </View>
  );
};

export default ImagePreview;
