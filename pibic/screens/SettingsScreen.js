// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { background, primary, text, buttonBackground, buttonText, toggleTheme, isDark } = useTheme();

  const openHelpLink = () => {
    Linking.openURL('https://profissoes.vagas.com.br/wp-content/uploads/2020/12/voce-sabe-quando-pedir-ajuda-scaled.jpg');
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: primary }]}>Configurações e Ajuda</Text>
      <Text style={[styles.text, { color: text }]}>
        Aqui você pode configurar preferências do aplicativo, ver informações sobre privacidade
        e acessar nosso suporte.
      </Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: buttonBackground }]} onPress={openHelpLink}>
        <Text style={[styles.buttonText, { color: buttonText }]}>Visite nosso portal de ajuda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground, marginTop: 20 }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttonText, { color: buttonText }]}>
          Alternar para modo {isDark ? 'Claro' : 'Escuro'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
