import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { io } from 'socket.io-client';
import { getQueueStatus } from '../utils/api';
import { BASE_URL } from '../utils/api';

const COLORS = { primary: '#C9A84C', bg: '#0d0d0d', card: '#141414', border: '#222' };

export default function QueueScreen({ route, navigation }) {
  const { booking, salon_name, barber_name } = route.params;
  const [queue,   setQueue]   = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchQueue();
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await getQueueStatus(booking._id);
      setQueue(data);
    } catch {
      setQueue({ queue_position: 0, estimated_wait_min: 0, status: booking.status });
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    const socket = io(BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_barber_queue', { barber_id: booking.barber_id });
    });

    socket.on('queue_updated', () => {
      fetchQueue(); // Refresh queue position on any update
    });
  };

  const getStatusInfo = (status) => {
    const map = {
      confirmed:   { label: 'Booking Confirmed',    color: '#4ade80', icon: '✅' },
      arrived:     { label: 'You\'ve Arrived',       color: '#60a5fa', icon: '👋' },
      in_progress: { label: 'Service in Progress',  color: COLORS.primary, icon: '✂' },
      completed:   { label: 'Completed!',            color: '#a78bfa', icon: '🎉' },
    };
    return map[status] || map.confirmed;
  };

  const bookedTime = new Date(booking.booked_time);
  const timeStr    = bookedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr    = bookedTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const statusInfo = getStatusInfo(queue?.status);
  const position   = queue?.queue_position ?? 0;
  const waitMins   = queue?.estimated_wait_min ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Booking ID */}
      <View style={styles.idBadge}>
        <Text style={styles.idLabel}>Booking ID</Text>
        <Text style={styles.idValue}>#{booking._id?.slice(-6).toUpperCase()}</Text>
      </View>

      {/* Status */}
      <View style={[styles.statusCard, { borderColor: statusInfo.color + '40' }]}>
        <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
        <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
      </View>

      {/* Queue Position */}
      {queue?.status === 'confirmed' && (
        <View style={styles.queueCard}>
          {position === 0 ? (
            <>
              <Text style={styles.queueBig}>You're Next!</Text>
              <Text style={styles.queueSub}>Head to the salon now 🚶</Text>
            </>
          ) : (
            <>
              <Text style={styles.queueNumber}>{position}</Text>
              <Text style={styles.queueBig}>
                {position === 1 ? 'person' : 'people'} ahead of you
              </Text>
              <Text style={styles.queueSub}>Est. wait: ~{waitMins} min</Text>
            </>
          )}

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[
              styles.progressFill,
              { width: `${Math.max(5, 100 - (position * 20))}%` }
            ]} />
          </View>
        </View>
      )}

      {/* Booking Details */}
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Appointment Details</Text>
        <DetailRow label="Salon"   value={salon_name} />
        <DetailRow label="Barber"  value={barber_name || 'Auto-assigned'} />
        <DetailRow label="Date"    value={dateStr} />
        <DetailRow label="Time"    value={timeStr} />
        <DetailRow label="Total"   value={`₹${booking.total_cost}`} highlight />
      </View>

      {/* Live update note */}
      <Text style={styles.liveNote}>🔴 Live — updates automatically when barber marks progress</Text>

      {/* Done button if completed */}
      {queue?.status === 'completed' && (
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Tabs')}
        >
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const DetailRow = ({ label, value, highlight }) => (
  <View style={detailStyles.row}>
    <Text style={detailStyles.label}>{label}</Text>
    <Text style={[detailStyles.value, highlight && detailStyles.highlight]}>{value}</Text>
  </View>
);
const detailStyles = StyleSheet.create({
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label:     { color: '#666', fontSize: 13 },
  value:     { color: '#ccc', fontSize: 13, fontWeight: '600' },
  highlight: { color: '#C9A84C', fontSize: 15, fontWeight: '800' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content:   { padding: 20, paddingBottom: 40 },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  idBadge: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  idLabel: { color: '#555', fontSize: 12 },
  idValue: { color: COLORS.primary, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  statusCard: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1,
    padding: 24, alignItems: 'center', marginBottom: 16,
  },
  statusIcon:  { fontSize: 40, marginBottom: 8 },
  statusLabel: { fontSize: 18, fontWeight: '800' },
  queueCard: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    padding: 24, alignItems: 'center', marginBottom: 16,
  },
  queueNumber: { fontSize: 64, fontWeight: '900', color: COLORS.primary, lineHeight: 70 },
  queueBig:    { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 4 },
  queueSub:    { fontSize: 13, color: '#666', marginTop: 6, marginBottom: 16 },
  progressBg:  { width: '100%', height: 6, backgroundColor: '#222', borderRadius: 3 },
  progressFill:{ height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  detailCard: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    padding: 20, marginBottom: 16,
  },
  detailTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  liveNote: { color: '#333', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  doneBtnText: { color: '#111', fontWeight: '800', fontSize: 15 },
});
