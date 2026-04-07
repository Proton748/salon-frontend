import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { getSalonDetail } from '../utils/api';

const COLORS = { primary: '#C9A84C', bg: '#0d0d0d', card: '#141414', border: '#222' };

export default function SalonDetailScreen({ route, navigation }) {
  const { salon: initialSalon } = route.params;
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('services'); // 'services' | 'barbers'
  const [selected, setSelected] = useState([]); // selected service ids

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await getSalonDetail(initialSalon._id);
      setDetail(data);
    } catch {
      Alert.alert('Error', 'Could not load salon details');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (svc) => {
    setSelected(prev => {
      const exists = prev.find(s => s._id === svc._id);
      if (exists) return prev.filter(s => s._id !== svc._id);
      return [...prev, svc];
    });
  };

  const totalPrice    = selected.reduce((sum, s) => sum + s.base_price, 0);
  const totalDuration = selected.reduce((sum, s) => sum + s.duration_min, 0);

  const handleBook = () => {
    if (selected.length === 0) return Alert.alert('Select a service', 'Pick at least one service to book.');
    navigation.navigate('Booking', {
      salon: detail,
      services: selected,
      totalPrice,
      totalDuration,
    });
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
      <ScrollView>
        {/* Salon Hero */}
        <View style={styles.hero}>
          <Text style={styles.salonName}>{detail.name}</Text>
          <Text style={styles.salonAddr}>📍 {detail.address}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.rating}>⭐ {detail.rating?.toFixed(1) || 'New'}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.status}>{detail.is_active ? '🟢 Open' : '🔴 Closed'}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['services', 'barbers'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'services' ? '✂ Services' : '👤 Barbers'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services list */}
        {tab === 'services' && (
          <View style={styles.list}>
            <Text style={styles.hint}>Tap to select services you want</Text>
            {detail.services?.map(svc => {
              const isSelected = selected.find(s => s._id === svc._id);
              return (
                <TouchableOpacity
                  key={svc._id}
                  style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                  onPress={() => toggleService(svc)}
                >
                  <View style={styles.serviceLeft}>
                    <Text style={styles.serviceName}>{svc.name}</Text>
                    <Text style={styles.serviceDur}>⏱ {svc.duration_min} min</Text>
                    {svc.description ? (
                      <Text style={styles.serviceDesc}>{svc.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.serviceRight}>
                    <Text style={styles.servicePrice}>₹{svc.base_price}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Barbers list */}
        {tab === 'barbers' && (
          <View style={styles.list}>
            {detail.barbers?.map(barber => (
              <View key={barber._id} style={styles.barberCard}>
                <View style={styles.barberAvatar}>
                  <Text style={styles.barberInitial}>
                    {barber.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.barberInfo}>
                  <Text style={styles.barberName}>{barber.name}</Text>
                  <Text style={styles.barberRating}>⭐ {barber.rating?.toFixed(1) || 'New'}</Text>
                  {barber.specialties?.length > 0 && (
                    <Text style={styles.barberTags}>{barber.specialties.join(' · ')}</Text>
                  )}
                </View>
                <View style={[styles.barberStatus, !barber.is_active && styles.barberOff]}>
                  <Text style={styles.barberStatusText}>
                    {barber.is_active ? 'Available' : 'Off Today'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom booking bar */}
      {selected.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.selectedCount}>{selected.length} service{selected.length > 1 ? 's' : ''} · {totalDuration} min</Text>
            <Text style={styles.totalPrice}>Total: ₹{totalPrice}</Text>
          </View>
          <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Book Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  salonName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  salonAddr: { fontSize: 13, color: '#777', marginBottom: 8 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating:    { fontSize: 13, color: '#C9A84C' },
  dot:       { color: '#555' },
  status:    { fontSize: 13, color: '#aaa' },
  tabRow:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn:    { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText:   { color: '#555', fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  list:      { padding: 16, gap: 12 },
  hint:      { color: '#444', fontSize: 12, marginBottom: 4 },
  serviceCard: {
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between',
  },
  serviceCardSelected: { borderColor: COLORS.primary, backgroundColor: '#1a1608' },
  serviceLeft:  { flex: 1 },
  serviceName:  { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  serviceDur:   { fontSize: 12, color: '#666' },
  serviceDesc:  { fontSize: 12, color: '#555', marginTop: 4 },
  serviceRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  servicePrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  checkmark:    { fontSize: 18, color: COLORS.primary },
  barberCard: {
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  barberAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#2a2008', alignItems: 'center', justifyContent: 'center',
  },
  barberInitial: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  barberInfo:    { flex: 1 },
  barberName:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  barberRating:  { fontSize: 12, color: '#888', marginTop: 2 },
  barberTags:    { fontSize: 11, color: '#555', marginTop: 3 },
  barberStatus:  { backgroundColor: '#0a2010', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  barberOff:     { backgroundColor: '#1a0a0a' },
  barberStatusText: { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingBottom: 32,
  },
  selectedCount: { color: '#777', fontSize: 12 },
  totalPrice:    { color: '#fff', fontSize: 18, fontWeight: '800' },
  bookBtn:       { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  bookBtnText:   { color: '#111', fontWeight: '800', fontSize: 15 },
});
