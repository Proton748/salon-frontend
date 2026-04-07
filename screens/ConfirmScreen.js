import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { createBooking } from '../utils/api';

const COLORS = { primary: '#C9A84C', bg: '#0d0d0d', card: '#141414', border: '#222' };

export default function ConfirmScreen({ route, navigation }) {
  const {
    salon, services, barber, slot, date,
    totalPrice, totalDuration, autoAssign,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const slotDate    = new Date(date);
  const dateLabel   = slotDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const serviceIds  = services.map(s => s._id);

  // Build slot_datetime
  const getSlotDatetime = () => {
    if (autoAssign || !slot) return null;
    const [h, m] = slot.start.split(':');
    const d = new Date(date);
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d.toISOString();
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const payload = {
        salon_id:      salon._id,
        service_ids:   serviceIds,
        auto_assign:   autoAssign || false,
      };

      if (!autoAssign && barber) {
        payload.barber_id      = barber._id;
        payload.slot_datetime  = getSlotDatetime();
      }

      const { data } = await createBooking(payload);

      navigation.replace('Queue', {
        booking:    data.booking,
        salon_name: data.salon_name,
        barber_name: data.barber_name,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      if (err.response?.status === 409) {
        Alert.alert('Slot Taken!', msg, [
          { text: 'Pick Another', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Review Your Booking</Text>
        <Text style={styles.subheading}>Confirm the details below</Text>

        {/* Booking Summary Card */}
        <View style={styles.card}>
          <Row label="Salon" value={salon.name} />
          <Row label="Barber" value={autoAssign ? '⚡ Auto-assigned' : barber?.name || '—'} />
          <Row label="Date"  value={dateLabel} />
          <Row label="Time"  value={autoAssign ? 'Earliest available' : slot?.start || '—'} />
          <Row label="Duration" value={`${totalDuration} min`} />

          <View style={styles.divider} />
          <Text style={styles.servicesLabel}>Services</Text>
          {services.map(s => (
            <View key={s._id} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{s.name}</Text>
              <Text style={styles.servicePrice}>₹{s.base_price}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice}</Text>
          </View>
          <Text style={styles.payNote}>💳 Pay at salon after service</Text>
        </View>

        {/* Cancellation policy */}
        <Text style={styles.policy}>
          ℹ️ Free cancellation up to 30 minutes before your slot.
        </Text>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#111" />
            : <Text style={styles.confirmBtnText}>✅ Confirm Booking — ₹{totalPrice}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Row = ({ label, value }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value}>{value}</Text>
  </View>
);
const rowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#666', fontSize: 13 },
  value: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content:   { padding: 20, paddingBottom: 100 },
  heading:   { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subheading:{ fontSize: 13, color: '#666', marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    padding: 20, marginBottom: 16,
  },
  divider:      { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  servicesLabel:{ color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  serviceRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  serviceName:  { color: '#ccc', fontSize: 14 },
  servicePrice: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalValue:   { color: COLORS.primary, fontSize: 24, fontWeight: '900' },
  payNote:      { color: '#555', fontSize: 11, marginTop: 6 },
  policy:       { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222', padding: 16, paddingBottom: 32,
  },
  confirmBtn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText:     { color: '#111', fontWeight: '800', fontSize: 15 },
});
