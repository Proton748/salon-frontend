import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { getMyBookings, cancelBooking } from '../utils/api';

const COLORS = { primary: '#C9A84C', bg: '#0d0d0d', card: '#141414', border: '#222' };

const STATUS_COLORS = {
  confirmed:   '#4ade80',
  arrived:     '#60a5fa',
  in_progress: '#C9A84C',
  completed:   '#a78bfa',
  cancelled:   '#555',
  no_show:     '#ef4444',
};

export default function MyBookingsScreen({ navigation }) {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data);
    } catch {
      Alert.alert('Error', 'Could not load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  const handleCancel = (booking) => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking._id);
              load();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Could not cancel');
            }
          },
        },
      ]
    );
  };

  const renderBooking = ({ item: b }) => {
    const isActive = ['confirmed', 'arrived', 'in_progress'].includes(b.status);
    const date = new Date(b.booked_time);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.salonName}>{b.salon_id?.name || 'Salon'}</Text>
            <Text style={styles.barberName}>with {b.barber_id?.name || 'Barber'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[b.status] || '#555') + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[b.status] || '#555' }]}>
              {b.status?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.meta}>📅 {dateStr}</Text>
          <Text style={styles.meta}>🕐 {timeStr}</Text>
          <Text style={styles.meta}>⏱ {b.total_duration_min}min</Text>
        </View>

        <Text style={styles.services}>
          {b.services?.map(s => s.name).join(' + ') || 'Service'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cost}>₹{b.total_cost}</Text>
          <View style={styles.actions}>
            {isActive && (
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => navigation.navigate('Queue', {
                  booking: b,
                  salon_name: b.salon_id?.name,
                  barber_name: b.barber_id?.name,
                })}
              >
                <Text style={styles.trackBtnText}>Track Queue →</Text>
              </TouchableOpacity>
            )}
            {b.status === 'confirmed' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(b)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings yet.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.emptyLink}>Book your first appointment →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  header:    { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#111' },
  title:     { fontSize: 22, fontWeight: '800', color: '#fff' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 16, marginBottom: 12,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  salonName:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  barberName:  { fontSize: 12, color: '#666', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  divider:     { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  metaRow:     { flexDirection: 'row', gap: 16, marginBottom: 8 },
  meta:        { color: '#777', fontSize: 12 },
  services:    { color: '#aaa', fontSize: 13, marginBottom: 12 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cost:        { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  actions:     { flexDirection: 'row', gap: 8 },
  trackBtn:    { backgroundColor: COLORS.primary + '22', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  trackBtnText:{ color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  cancelBtn:   { backgroundColor: '#ef444422', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  cancelBtnText:{ color: '#ef4444', fontSize: 12, fontWeight: '700' },
  empty:       { alignItems: 'center', marginTop: 80 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: '#555', fontSize: 15, marginBottom: 8 },
  emptyLink:   { color: COLORS.primary, fontSize: 13 },
});
