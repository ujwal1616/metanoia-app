import React, { useEffect, useState, createContext, useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ActivityIndicator, View, LogBox, StatusBar, Appearance } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { Provider as PaperProvider } from 'react-native-paper';

import { auth, db } from './screens/firebase';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import CandidateProfileScreen from './screens/CandidateProfileScreen';
import HRProfileScreen from './screens/HRProfileScreen';
import SwipeScreen from './screens/SwipeScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';

// ONBOARDING CONTEXT
import { OnboardingProvider } from './screens/OnboardingContext';

// THEME COLORS
const GOLD = "#B88908";
const WHITE = "#FFFFFF";
const OFF_WHITE = "#FAF7F2";
const CARD_BG = "#FFF9EC";
const GOLD_ACCENT = "#FFD700";
const DARK_BG = "#181818";
const DARK_CARD = "#232323";
const DARK_TEXT = "#FFF9F0";

// Theme objects
const lightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: GOLD,
    background: WHITE,
    card: CARD_BG,
    text: "#232323",
    border: GOLD_ACCENT,
    notification: GOLD_ACCENT,
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: GOLD_ACCENT,
    background: DARK_BG,
    card: DARK_CARD,
    text: DARK_TEXT,
    border: GOLD_ACCENT,
    notification: GOLD_ACCENT,
  },
};

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Register: undefined;
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Chat: undefined;
  Profile: undefined;
  Settings: undefined;
};

// User context for global access
type UserProfile = {
  uid: string;
  role: 'candidate' | 'hr';
  completed: boolean;
  [key: string]: any;
};
type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
};
const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  setProfile: () => {},
});
export const useUser = () => useContext(UserContext);

// Tab navigators for candidate & HR
const Tab = createBottomTabNavigator<MainTabParamList>();

function CandidateTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: CARD_BG },
      }}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} options={{ title: "Discover" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
      <Tab.Screen name="Profile" component={CandidateProfileScreen} options={{ title: "Profile" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function HRTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: CARD_BG },
      }}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} options={{ title: "Discover" }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
      <Tab.Screen name="Profile" component={HRProfileScreen} options={{ title: "Profile" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Listen for theme change
  useEffect(() => {
    setIsDark(Appearance.getColorScheme() === "dark");
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setIsDark(colorScheme === "dark")
    );
    return () => sub.remove();
  }, []);

  // Listen for Firebase Auth state and fetch Firestore profile
  useEffect(() => {
    LogBox.ignoreLogs(['Setting a timer', 'AsyncStorage has been extracted']);
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile({ ...snap.data(), uid: firebaseUser.uid } as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? darkTheme.colors.background : lightTheme.colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? darkTheme.colors.background : lightTheme.colors.background} />
        <ActivityIndicator size="large" color={isDark ? darkTheme.colors.primary : lightTheme.colors.primary} />
      </View>
    );
  }

  // Advanced: Use OnboardingProvider to wrap onboarding, provide global onboarding context
  // Advanced: Use context for HRProfileScreen so HR can edit/swipe profile after onboarding
  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <UserContext.Provider value={{ user, profile, setProfile }}>
        <NavigationContainer theme={isDark ? darkTheme : lightTheme}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? darkTheme.colors.background : lightTheme.colors.background} />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: isDark ? darkTheme.colors.primary : lightTheme.colors.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              headerShadowVisible: false,
              headerShown: false,
            }}
          >
            {!user ? (
              <>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </>
            ) : !profile || !profile.completed ? (
              <Stack.Screen name="Onboarding">
                {props =>
                  <OnboardingProvider>
                    <OnboardingScreen {...props} />
                  </OnboardingProvider>
                }
              </Stack.Screen>
            ) : (
              <Stack.Screen
                name="Main"
                // HR can edit their profile after onboarding with context
                component={
                  profile.role === 'hr'
                    ? (props => (
                      <OnboardingProvider>
                        <HRProfileScreen {...props} />
                      </OnboardingProvider>
                    ))
                    : CandidateTabs
                }
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </UserContext.Provider>
    </PaperProvider>
  );
}