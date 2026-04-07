import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = { primary: '#C9A84C', card: '#141414', border: '#222' };

export default function SalonCard({ salon, onPress }) {
  const minPrice = salon.services_preview?.[0]?.base_price;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Salon initial avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{salon.name?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{salon.name}</Text>
          <View style={[styles.dot, { backgroundColor: salon.is_active ? '#4ade80' : '#555' }]} />
        </View>
        <Text style={styles.address} numberOfLines={1}>📍 {salon.address}</Text>

        {/* Service preview prices */}
        {salon.services_preview?.length > 0 && (
          <View style={styles.priceRow}>
            {salon.services_preview.map(s => (
              <View key={s._id} style={styles.priceChip}>
                <Text style={styles.priceChipText}>{s.name} ₹{s.base_price}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐ {salon.rating?.toFixed(1) || 'New'}</Text>
          {minPrice && (
            <Text style={styles.from}>from ₹{minPrice}</Text>
          )}
        </View>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, gap: 12,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: '#2a2008', alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  info:        { flex: 1 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name:        { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  address:     { fontSize: 12, color: '#666', marginBottom: 6 },
  priceRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  priceChip:   { backgroundColor: '#1a1608', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  priceChipText:{ fontSize: 11, color: COLORS.primary },
  metaRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  rating:      { fontSize: 12, color: '#888' },
  from:        { fontSize: 12, color: '#555' },
  arrow:       { fontSize: 22, color: '#333' },
});
