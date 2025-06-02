
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const alertHistoryData = [
  {
    id: '1',
    date: '2023-12-01 10:15',
    type: 'Alto Risco',
    message: 'Sinais suspeitos detectados. Procure um especialista imediatamente.',
  },
  {
    id: '2',
    date: '2023-11-25 14:30',
    type: 'Baixo Risco',
    message: 'Padrões em análise. Acompanhe e, se persistir, agende uma consulta.',
  },
];

const AlertsScreen = () => {
  const {
    background,
    primary,
    text,
    buttonBackground,
    buttonText,
    isDark,
  } = useTheme();

  const currentAlert = {
    type: 'Alto Risco',
    message: 'Foram identificados sinais suspeitos. Procure um dermatologista imediatamente.',
    recommendations: 'Agende uma consulta o quanto antes. Clique para mais informações ou contato.',
  };

  const handleAction = () => {
    Alert.alert(
      'Orientação',
      'Encaminhe-se ao serviço de saúde mais próximo ou acesse nosso portal de informações.'
    );
  };

  const renderAlertItem = ({ item }) => (
    <View style={[styles.alertItem, {
      backgroundColor: isDark ? '#2d2d2d' : '#f9f9f9',
      borderColor: isDark ? '#444' : '#ccc',
    }]}>
      <Text style={[styles.alertDate, { color: text }]}>{item.date}</Text>
      <Text style={[styles.alertType, { color: primary }]}>{item.type}</Text>
      <Text style={[styles.alertMessage, { color: text }]}>{item.message}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.screenTitle, { color: primary }]}>
        Histórico de Consultas & Alertas
      </Text>

      <View style={[styles.currentAlert, {
        backgroundColor: isDark ? '#4b1c1c' : '#fee2e2',
        borderColor: isDark ? '#7f1d1d' : '#fca5a5',
      }]}>
        <Text style={[styles.currentAlertTitle, { color: '#dc2626' }]}>
          Alerta Atual
        </Text>
        <Text style={[styles.currentAlertType, { color: '#dc2626' }]}>
          {currentAlert.type}
        </Text>
        <Text style={[styles.currentAlertMessage, { color: text }]}>
          {currentAlert.message}
        </Text>
        <Text style={[styles.currentAlertRecommendations, { color: text }]}>
          Recomendações: {currentAlert.recommendations}
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: buttonBackground }]}
          onPress={handleAction}
        >
          <Text style={[styles.actionButtonText, { color: buttonText }]}>
            Saiba Mais / Agende Consulta
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.historyTitle, { color: primary }]}>
        Histórico de Alertas:
      </Text>
      <FlatList
        data={alertHistoryData}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertItem}
        contentContainerStyle={styles.historyList}
      />
    </View>
  );
};

export default AlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  currentAlert: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
  },
  currentAlertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  currentAlertType: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentAlertMessage: {
    fontSize: 18,
    marginBottom: 12,
  },
  currentAlertRecommendations: {
    fontSize: 16,
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyList: {
    paddingBottom: 16,
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 16,
  },
});
