import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { getBarberSlots } from '../utils/api';

const COLORS = { primary: '#C9A84C', bg: '#0d0d0d', card: '#141414', border: '#222' };

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Generate next 7 date options
const getNextDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
};

export default function BookingScreen({ route, navigation }) {
  const { salon, services, totalPrice, totalDuration } = route.params;

  const [selectedBarber, setSelectedBarber] = useState(null); // null = auto
  const [selectedDate,   setSelectedDate]   = useState(getNextDates()[0]);
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [slots,          setSlots]          = useState([]);
  const [loadingSlots,   setLoadingSlots]   = useState(false);

  const dates    = getNextDates();
  const barbers  = salon.barbers?.filter(b => b.is_active) || [];

  useEffect(() => {
    if (selectedBarber) loadSlots();
    else setSlots([]);
    setSelectedSlot(null);
  }, [selectedBarber, selectedDate]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data } = await getBarberSlots(selectedBarber._id, dateStr, totalDuration);
      setSlots(data.slots);
    } catch {
      Alert.alert('Error', 'Could not load slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNext = () => {
    if (!selectedSlot && selectedBarber) {
      return Alert.alert('Select a time slot');
    }
    navigation.navigate('Confirm', {
      salon,
      services,
      barber:      selectedBarber,  // null = auto-assign
      slot:        selectedSlot,
      date:        selectedDate.toISOString(),
      totalPrice,
      totalDuration,
      autoAssign:  !selectedBarber,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Selected services summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          {services.map(s => (
            <View key={s._id} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{s.name}</Text>
              <Text style={styles.servicePrice}>₹{s.base_price} · {s.duration_min}min</Text>
            </View>
          ))}
        </View>

        {/* Barber Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Barber</Text>
          {/* Auto-assign option */}
          <TouchableOpacity
            style={[styles.barberCard, selectedBarber === null && styles.barberCardSelected]}
            onPress={() => setSelectedBarber(null)}
          >
            <Text style={styles.autoIcon}>⚡</Text>
            <View style={styles.barberInfo}>
              <Text style={styles.barberName}>Earliest Available</Text>
              <Text style={styles.barberSub}>Auto-assign — we pick the first free barber</Text>
            </View>
            {selectedBarber === null && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>

          {barbers.map(b => (
            <TouchableOpacity
              key={b._id}
              style={[styles.barberCard, selectedBarber?._id === b._id && styles.barberCardSelected]}
              onPress={() => setSelectedBarber(b)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{b.name.charAt(0)}</Text>
              </View>
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{b.name}</Text>
                <Text style={styles.barberSub}>⭐ {b.rating?.toFixed(1) || 'New'}{b.specialties?.length ? ' · ' + b.specialties.join(', ') : ''}</Text>
              </View>
              {selectedBarber?._id === b._id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selection */}
        {selectedBarber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d, i) => {
                const isSelected = d.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text style={[styles.dateDay,  isSelected && styles.dateTextSelected]}>{DAYS[d.getDay()]}</Text>
                    <Text style={[styles.dateNum,  isSelected && styles.dateTextSelected]}>{d.getDate()}</Text>
                    {i === 0 && <Text style={styles.todayLabel}>Today</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Slot Selection */}
        {selectedBarber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Time Slot</Text>
            {loadingSlots ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 16 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.noSlots}>No slots available on this date. Try another day.</Text>
            ) : (
              <View style={styles.slotGrid}>
                {slots.map((slot, i) => {
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                        {slot.start}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, (!selectedBarber ? false : !selectedSlot) && styles.nextBtnDisabled]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {selectedBarber ? 'Review Booking →' : 'Continue (Auto-Assign) →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg },
  section:     { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  serviceRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  serviceName: { color: '#ccc', fontSize: 14 },
  servicePrice:{ color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  barberCard: {
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, gap: 12,
  },
  barberCardSelected: { borderColor: COLORS.primary, backgroundColor: '#1a1608' },
  autoIcon:   { fontSize: 22 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a2008', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  barberInfo: { flex: 1 },
  barberName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  barberSub:  { color: '#666', fontSize: 12, marginTop: 2 },
  check:      { color: COLORS.primary, fontSize: 18 },
  dateScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  dateChip: {
    width: 56, height: 70, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, position: 'relative',
  },
  dateChipSelected: { borderColor: COLORS.primary, backgroundColor: '#1a1608' },
  dateDay:     { color: '#666', fontSize: 11, fontWeight: '600' },
  dateNum:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  dateTextSelected: { color: COLORS.primary },
  todayLabel:  { position: 'absolute', bottom: 4, fontSize: 8, color: COLORS.primary },
  noSlots:     { color: '#555', textAlign: 'center', marginTop: 16, fontSize: 13 },
  slotGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  slotChipSelected: { borderColor: COLORS.primary, backgroundColor: '#1a1608' },
  slotText:         { color: '#aaa', fontSize: 13, fontWeight: '600' },
  slotTextSelected: { color: COLORS.primary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222', padding: 16, paddingBottom: 32,
  },
  nextBtn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText:     { color: '#111', fontWeight: '800', fontSize: 15 },
});
