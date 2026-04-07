import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator  from './navigation/AppNavigator';
import { getMe } from './utils/api';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const { data } = await getMe();
        setUser(data);
      }
    } catch {
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator user={user} setUser={setUser} />
      ) : (
        <AuthNavigator setUser={setUser} />
      )}
    </NavigationContainer>
  );
}
