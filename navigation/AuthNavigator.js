import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen    from '../screens/auth/LoginScreen';
import OTPScreen      from '../screens/auth/OTPScreen';
import ProfileSetup   from '../screens/auth/ProfileSetup';

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"        component={LoginScreen} />
      <Stack.Screen name="OTP"          component={OTPScreen} />
      <Stack.Screen name="ProfileSetup">
        {(props) => <ProfileSetup {...props} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
