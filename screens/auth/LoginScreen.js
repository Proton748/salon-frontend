import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { sendOTP } from '../../utils/api';

export default function LoginScreen({ navigation }) {
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length !== 10) {
      return Alert.alert('Invalid Number', 'Enter a valid 10-digit phone number.');
    }
    setLoading(true);
    try {
      const { data } = await sendOTP(cleaned);
      navigation.navigate('OTP', { phone: cleaned, is_new_user: data.is_new_user });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>✂ SnapCut</Text>
        <Text style={styles.tagline}>Book your barber. Skip the wait.</Text>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputRow}>
          <Text style={styles.flag}>🇮🇳 +91</Text>
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor="#555"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#111" />
            : <Text style={styles.btnText}>Send OTP →</Text>}
        </TouchableOpacity>

        <Text style={styles.note}>We'll send a 6-digit OTP to verify your number.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  inner:     { flex: 1, padding: 28, justifyContent: 'center' },
  logo:      { fontSize: 32, fontWeight: '800', color: '#C9A84C', marginBottom: 6 },
  tagline:   { fontSize: 15, color: '#666', marginBottom: 44 },
  label:     { fontSize: 13, color: '#999', marginBottom: 8, letterSpacing: 1 },
  inputRow:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 14, marginBottom: 20,
  },
  flag:  { fontSize: 16, color: '#ccc', marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: '#fff', paddingVertical: 16, letterSpacing: 2 },
  btn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#111' },
  note:    { fontSize: 12, color: '#444', textAlign: 'center' },
});
