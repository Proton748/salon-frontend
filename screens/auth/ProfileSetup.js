import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { updateProfile } from '../../utils/api';

export default function ProfileSetup({ route, navigation, setUser }) {
  const { user } = route.params;
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter your name');

    setLoading(true);
    try {
      // Request push notification permission
      const { status } = await Notifications.requestPermissionsAsync();
      let pushToken = null;
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushToken = tokenData.data;
      }

      const { data } = await updateProfile({
        name: name.trim(),
        expo_push_token: pushToken,
      });

      setUser(data);
      navigation.replace('Tabs');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <Text style={styles.subtitle}>We'll use this for your bookings.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor="#555"
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#111" />
          : <Text style={styles.btnText}>Let's Go →</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 28, justifyContent: 'center' },
  title:     { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: '#666', marginBottom: 40 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 16, paddingVertical: 16, fontSize: 18, color: '#fff', marginBottom: 24,
  },
  btn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#111' },
});
