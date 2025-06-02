import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // cor suave
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30, // maior para leitura fácil
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#1f2937', // cinza escuro para contraste
    textAlign: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  primary: {
    backgroundColor: '#1d4ed8', 
  },
  secondary: {
    backgroundColor: '#16a34a', 
  },
  analyze: {
    marginTop: 20,
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 12,
  },
});
