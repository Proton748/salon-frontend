import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { getNearbySalons } from '../utils/api';
import SalonCard from '../components/SalonCard';

export default function HomeScreen({ navigation }) {
  const [salons,    setSalons]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,    setSearch]    = useState('');
  const [location,  setLocation]  = useState(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback: Patna, Bihar coordinates
        fetchSalons(25.5941, 85.1376);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
      fetchSalons(loc.coords.latitude, loc.coords.longitude);
    } catch {
      fetchSalons(25.5941, 85.1376);
    }
  };

  const fetchSalons = async (lat, lng) => {
    try {
      const { data } = await getNearbySalons(lat, lng, 5000);
      setSalons(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load salons. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (location) fetchSalons(location.latitude, location.longitude);
    else fetchLocation();
  }, [location]);

  const filtered = salons.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C9A84C" />
        <Text style={styles.loadingText}>Finding salons near you…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>✂ SnapCut</Text>
        <Text style={styles.subtitle}>Book. Skip the wait.</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Search salons..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>
        {filtered.length} salon{filtered.length !== 1 ? 's' : ''} near you
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SalonCard
            salon={item}
            onPress={() => navigation.navigate('SalonDetail', { salon: item })}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C9A84C"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No salons found nearby.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0d0d0d' },
  center:       { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
  loadingText:  { color: '#666', marginTop: 12 },
  header:       { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#111' },
  logo:         { fontSize: 24, fontWeight: '800', color: '#C9A84C' },
  subtitle:     { fontSize: 13, color: '#555', marginTop: 2 },
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#111' },
  search: {
    backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 14,
  },
  sectionTitle: { color: '#555', fontSize: 12, letterSpacing: 1, paddingHorizontal: 20, paddingVertical: 8 },
  empty:        { alignItems: 'center', marginTop: 60 },
  emptyIcon:    { fontSize: 40, marginBottom: 12 },
  emptyText:    { color: '#555', fontSize: 15 },
});
