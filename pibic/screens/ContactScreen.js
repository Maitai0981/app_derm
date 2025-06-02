import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext'; // ajuste o caminho se necessário

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { isDark } = useTheme();

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos!');
      return;
    }

    Alert.alert('Contato Enviado', `Obrigado ${name}, sua mensagem foi enviada com sucesso!`);
    setName('');
    setEmail('');
    setMessage('');
  };

  const backgroundColor = isDark ? '#111827' : '#f3f4f6';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const descriptionColor = isDark ? '#d1d5db' : '#374151';
  const inputBackground = isDark ? '#1f2937' : '#fff';
  const inputBorder = isDark ? '#374151' : '#ccc';
  const placeholderTextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, backgroundColor, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginVertical: 20, textAlign: 'center', color: textColor }}>
          Contato
        </Text>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, color: descriptionColor }}>
          Entre em contato conosco para esclarecer dúvidas, enviar feedback ou obter suporte.
        </Text>

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: inputBorder,
            backgroundColor: inputBackground,
            padding: 10,
            marginBottom: 15,
            borderRadius: 8,
            color: textColor,
          }}
          placeholder="Seu Nome"
          placeholderTextColor={placeholderTextColor}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: inputBorder,
            backgroundColor: inputBackground,
            padding: 10,
            marginBottom: 15,
            borderRadius: 8,
            color: textColor,
          }}
          placeholder="Seu Email"
          placeholderTextColor={placeholderTextColor}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: inputBorder,
            backgroundColor: inputBackground,
            padding: 10,
            marginBottom: 15,
            borderRadius: 8,
            height: 100,
            textAlignVertical: 'top',
            color: textColor,
          }}
          placeholder="Sua Mensagem"
          placeholderTextColor={placeholderTextColor}
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={4}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={handleSubmit}
        >
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: '600' }}>
            Enviar Mensagem
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ContactScreen;
