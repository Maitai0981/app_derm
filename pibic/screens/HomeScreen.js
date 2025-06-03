import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'; // Adicionado ScrollView, ActivityIndicator
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ImageButton from '../components/ImageButton';
import ImagePreview from '../components/ImagePreview';
import styles from '../styles/style';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null); // Estado para armazenar o resultado do diagnóstico
  const [isLoading, setIsLoading] = useState(false); // Estado para indicar carregamento
  const { isDark } = useTheme();

  // IMPORTANTE: Use o IP da sua máquina onde o servidor Flask está rodando.
  // Se você está testando no emulador Android ou dispositivo na mesma rede do seu PC,
  // 192.168.X.X (o IP da sua máquina na rede local) é geralmente o correto.
  // Se o backend estiver rodando no mesmo emulador (ex: via Docker dentro do emulador),
  // pode ser 10.0.2.2.
  const API_URL = 'http://192.168.4.2:5000/predict'; // Verifique se este é o IP correto da sua máquina!

  const requestPermissions = async () => {
    console.log('DEBUG: Solicitando permissões da câmera e galeria...');
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== "granted" || mediaPermission.status !== "granted") {
      Alert.alert(
        "Permissões negadas",
        "Você precisa permitir o uso da câmera e da galeria."
      );
      console.log('DEBUG: Permissões negadas.');
      return false;
    }
    console.log('DEBUG: Permissões concedidas.');
    return true;
  };

  const handleCaptureImage = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    console.log('DEBUG: Iniciando captura de imagem...');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images, // CORRIGIDO: Uso de MediaType
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setDiagnosisResult(null); // Limpa resultados anteriores ao selecionar nova imagem
      console.log('DEBUG: Imagem capturada:', result.assets[0].uri);
    } else {
      console.log('DEBUG: Captura de imagem cancelada.');
    }
  };

  const handleSelectImage = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    console.log('DEBUG: Iniciando seleção de imagem da galeria...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // CORRIGIDO: Uso de MediaType
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setDiagnosisResult(null); // Limpa resultados anteriores ao selecionar nova imagem
      console.log('DEBUG: Imagem selecionada:', result.assets[0].uri);
    } else {
      console.log('DEBUG: Seleção de imagem cancelada.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert("Erro", "Por favor, selecione ou capture uma imagem primeiro.");
      console.log('DEBUG: Tentativa de análise sem imagem selecionada.');
      return;
    }

    setIsLoading(true); // Inicia o indicador de carregamento
    setDiagnosisResult(null); // Limpa resultados anteriores
    console.log('DEBUG: Iniciando análise da imagem...');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    console.log('DEBUG: FormData preparado com:', imageUri);

    try {
      // CORRIGIDO: Atribuindo o resultado do fetch à variável 'response'
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      console.log('DEBUG: Resposta da API recebida. Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text(); // Tenta ler como texto primeiro para debug
        let errorData = { error: `Erro HTTP: ${response.status} ${response.statusText}` };
        try {
            errorData = JSON.parse(errorText); // Tenta parsear como JSON
        } catch (e) {
            console.warn('DEBUG: Resposta de erro não é JSON:', errorText);
            errorData.error = `${errorData.error} - Resposta: ${errorText.substring(0, 100)}...`; // Limita o tamanho do erro no alerta
        }
        console.error('DEBUG: Erro de resposta da API:', errorData);
        throw new Error(errorData.error || `Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setDiagnosisResult(result); // Armazena o resultado no estado
      console.log('DEBUG: Dados da API parseados e armazenados:', result);
      Alert.alert("Análise Concluída", "Os resultados da análise estão abaixo."); // Feedback ao usuário

    } catch (error) {
      console.error('DEBUG: Erro ao analisar imagem:', error);
      Alert.alert("Erro na Análise", `Não foi possível analisar a imagem: ${error.message}. Verifique o console do Metro Bundler para mais detalhes. Verifique também se o backend está rodando no IP e porta corretos.`);
    } finally {
      setIsLoading(false); // Finaliza o indicador de carregamento
      console.log('DEBUG: Análise finalizada (com ou sem erro).');
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setDiagnosisResult(null); // Limpa o resultado quando a imagem é removida
    console.log('DEBUG: Imagem e resultados removidos.');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              <TouchableOpacity style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20, }} onPress={handleRemoveImage}>
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

        {isLoading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#2563eb'} />
            <Text style={{ color: isDark ? '#f3f4f6' : '#374151', textAlign: 'center', marginTop: 10 }}>
              Analisando imagem...
            </Text>
          </View>
        )}

        {diagnosisResult && ( // Renderiza os resultados se houver
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color: isDark ? '#f9fafb' : '#1f2937', marginTop: 20 }]}>
              Resultados da Análise:
            </Text>
            <Text style={{ color: isDark ? '#f3f4f6' : '#374151', marginBottom: 5 }}>
              {diagnosisResult.diagnostico_text}
            </Text>
            {/* O ScrollView externo ajuda se o laudo for muito longo */}
            <Text style={{ color: isDark ? '#f3f4f6' : '#374151', marginBottom: 5 }}>
              {diagnosisResult.descricao_text}
            </Text>
            <Text style={{ color: isDark ? '#f3f4f6' : '#374151' }}>
              {diagnosisResult.laudo_text}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;