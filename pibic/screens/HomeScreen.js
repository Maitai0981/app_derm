import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ImageButton from '../components/ImageButton';
import ImagePreview from '../components/ImagePreview';
import styles from '../styles/style';
import { useTheme } from '../context/ThemeContext'; // ajuste o caminho se necessário

const HomeScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const { isDark } = useTheme();

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraPermission.status !== 'granted' ||
      mediaPermission.status !== 'granted'
    ) {
      Alert.alert(
        'Permissões negadas',
        'Você precisa permitir o uso da câmera e da galeria.'
      );
      return false;
    }
    return true;
  };

  const handleCaptureImage = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSelectImage = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const response = await fetch('http://172.25.153.3:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#f3f4f6' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? '#f9fafb' : '#1f2937' },
        ]}
      >
        Captura e Seleção de Imagens
      </Text>

      <ImageButton
        label="Capturar Imagem"
        onPress={handleCaptureImage}
        color="primary"
      />

      <ImageButton
        label="Importar Imagem"
        onPress={handleSelectImage}
        color="secondary"
      />

      {imageUri && (
        <>
          <View style={{ position: 'relative' }}>
            <ImagePreview uri={imageUri} />
            <TouchableOpacity style={{ position: 'absolute', top: 5,right: 5,backgroundColor: 'rgba(0,0,0,0.6)',padding: 6,borderRadius: 20,}}onPress={handleRemoveImage}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ImageButton
            label="Analisar Imagem"
            onPress={handleAnalyze}
            color="analyze"
          />
        </>
      )}
    </View>
  );
};

export default HomeScreen;
