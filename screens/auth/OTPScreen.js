import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { verifyOTP, sendOTP } from '../../utils/api';

export default function OTPScreen({ route, navigation }) {
  const { phone, is_new_user } = route.params;
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return Alert.alert('Enter all 6 digits');

    setLoading(true);
    try {
      const { data } = await verifyOTP(phone, code);
      await SecureStore.setItemAsync('token', data.token);

      if (is_new_user || !data.user.name) {
        navigation.replace('ProfileSetup', { user: data.user });
      } else {
        navigation.replace('Tabs');
      }
    } catch (err) {
      Alert.alert('Wrong OTP', err.response?.data?.message || 'Please try again');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOTP(phone);
      Alert.alert('OTP Resent', 'Check your messages.');
    } catch {
      Alert.alert('Error', 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to +91 {phone}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#111" />
          : <Text style={styles.btnText}>Verify & Continue</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={resending}>
        <Text style={styles.resend}>
          {resending ? 'Resending...' : "Didn't get it? Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 28, justifyContent: 'center' },
  back:      { position: 'absolute', top: 56, left: 28 },
  backText:  { color: '#C9A84C', fontSize: 15 },
  title:     { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: '#666', marginBottom: 40 },
  otpRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpBox: {
    width: 48, height: 56, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#333', backgroundColor: '#1a1a1a',
    textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#fff',
  },
  otpBoxFilled: { borderColor: '#C9A84C' },
  btn: {
    backgroundColor: '#C9A84C', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText:   { fontSize: 16, fontWeight: '700', color: '#111' },
  resend:    { color: '#666', textAlign: 'center', fontSize: 13 },
});
