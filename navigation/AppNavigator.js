import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { createBottomTabNavigator }    from '@react-navigation/bottom-tabs';
import { Text }                        from 'react-native';

import HomeScreen        from '../screens/HomeScreen';
import SalonDetailScreen from '../screens/SalonDetailScreen';
import BookingScreen     from '../screens/BookingScreen';
import ConfirmScreen     from '../screens/ConfirmScreen';
import QueueScreen       from '../screens/QueueScreen';
import MyBookingsScreen  from '../screens/MyBookingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const COLORS = {
  primary: '#C9A84C',
  dark:    '#111111',
  gray:    '#888',
};

function HomeTabs({ user, setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor:  '#222',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ fontSize: 10, color }}>{route.name}</Text>
        ),
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: '🏠', Bookings: '📋' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, setUser }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:     { backgroundColor: '#111' },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { color: '#fff', fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {(props) => <HomeTabs {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="SalonDetail" component={SalonDetailScreen} options={{ title: 'Salon' }} />
      <Stack.Screen name="Booking"     component={BookingScreen}     options={{ title: 'Book Appointment' }} />
      <Stack.Screen name="Confirm"     component={ConfirmScreen}     options={{ title: 'Confirm Booking' }} />
      <Stack.Screen name="Queue"       component={QueueScreen}       options={{ title: 'Queue Status' }} />
    </Stack.Navigator>
  );
}
