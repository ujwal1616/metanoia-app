import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Keyboard } from 'react-native';
import { Button, Text, ToggleButton, Surface, ProgressBar, Portal, Dialog, Snackbar, TextInput } from 'react-native-paper';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

// User context and Firebase
import { useUser } from '../App';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// Onboarding Context for global answers state
import { OnboardingContext, OnboardingProvider } from './OnboardingContext';

// THEME COLORS
const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const OFF_WHITE = "#f6f4ff";
const ACCENT = "#6c47ff";
const DARK_TEXT = "#232323";

// Steps
const STEP_ROLE = 0;
const STEP_COMPANY = 1;
const STEP_LOCATION = 2;
const STEP_DETAIL = 3; // candidate/hr detail onboarding
const STEP_COMPLETE = 4;

type OnboardingScreenNavigationProp = StackNavigationProp<any>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

function OnboardingScreenInner({ navigation }: OnboardingScreenProps) {
  const [role, setRole] = useState<'candidate' | 'hr' | null>(null);
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [step, setStep] = useState(STEP_ROLE);

  // Location
  const [location, setLocation] = useState<string | null>(null);
  const [locationDialog, setLocationDialog] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // UI Feedback
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type?: "error" | "info" }>({ visible: false, message: '', type: "info" });
  const [exitDialog, setExitDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Context
  const { user, profile, setProfile } = useUser();

  // Onboarding Context
  const { answers, setAnswer, resetAnswers } = useContext(OnboardingContext);

  // Progress animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progress = step / STEP_COMPLETE;

  // Company types
  const companyTypes = [
    { label: "MNC", value: "mnc", icon: "domain" },
    { label: "Medium Enterprise", value: "medium", icon: "office-building" },
    { label: "Startup", value: "startup", icon: "rocket-launch" },
    { label: "All of the Above", value: "all", icon: "earth" },
  ];

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Redirect if not signed in or already onboarded
  useEffect(() => {
    if (!user) navigation.replace('Register');
    if (user && profile?.completed) navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [user, profile]);

  // Handle role select
  const handleRoleSelect = (value: string) => {
    if (value === 'candidate' || value === 'hr') {
      setRole(value);
      setAnswer("role", value);
      setCompanyType(null);
      setStep(STEP_COMPANY);
    }
  };

  // Handle company type select
  const handleCompanyType = (value: string | null) => {
    setCompanyType(value);
    setAnswer("companyType", value);
    setStep(STEP_LOCATION);
  };

  // Handle continue button
  const handleContinue = async () => {
    if (step === STEP_ROLE && role) setStep(STEP_COMPANY);
    else if (step === STEP_COMPANY && companyType) setStep(STEP_LOCATION);
    else if (step === STEP_LOCATION) setStep(STEP_DETAIL);
    else if (step === STEP_DETAIL) {
      // Save everything to Firestore
      if (!user) {
        setSnackbar({ visible: true, message: "User not signed in", type: "error" });
        return;
      }
      setLoading(true);
      const profileData = {
        ...answers,
        role,
        companyType,
        location,
        completed: true,
        onboardingCompletedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
        setProfile({ ...profileData, uid: user.uid, role: role as "candidate" | "hr" });
        setSnackbar({ visible: true, message: "Profile saved!", type: "info" });
        setTimeout(() => {
          resetAnswers();
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }, 800);
      } catch (error: any) {
        setSnackbar({ visible: true, message: "Failed to save profile: " + (error.message || error), type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle going back (with confirmation)
  const handleBack = () => {
    if (step === STEP_ROLE) setExitDialog(true);
    else setStep((prev) => prev - 1);
  };

  // Get Current Location
  const handleGetCurrentLocation = async () => {
    try {
      setLocationError(null);
      setLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied.');
        setSnackbar({ visible: true, message: 'Location permission denied.', type: "error" });
        setLocating(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo?.city && geo?.country) {
        setLocation(`${geo.city}, ${geo.country}`);
        setAnswer("location", `${geo.city}, ${geo.country}`);
        setSnackbar({ visible: true, message: `Location set as ${geo.city}, ${geo.country}` });
      } else {
        setLocation("Your Location");
        setAnswer("location", "Your Location");
        setSnackbar({ visible: true, message: `Location set.` });
      }
      setLocationDialog(false);
    } catch (e: any) {
      setLocationError(e?.message || "Couldn't fetch location.");
      setSnackbar({ visible: true, message: e?.message || "Couldn't fetch location.", type: "error" });
    } finally {
      setLocating(false);
    }
  };

  // Handle manual location entry
  const handleManualLocation = () => {
    if (customLocation.trim().length > 0) {
      setLocation(customLocation.trim());
      setAnswer("location", customLocation.trim());
      setSnackbar({ visible: true, message: `Location set as ${customLocation.trim()}` });
      setCustomLocation("");
      setLocationDialog(false);
      Keyboard.dismiss();
    }
  };

  // Render step components
  const renderStep = () => {
    switch (step) {
      case STEP_ROLE:
        return (
          <Surface style={styles.surface}>
            <Text style={styles.label}>I am a...</Text>
            <ToggleButton.Row
              onValueChange={handleRoleSelect}
              value={role ?? ''}
              style={styles.toggleRow}
            >
              <ToggleButton
                icon="account"
                value="candidate"
                style={role === 'candidate' ? styles.toggleBtnActive : styles.toggleBtn}
                size={36}
                accessibilityLabel="I'm a candidate"
              />
              <Text style={styles.toggleLabel}>Candidate</Text>
              <ToggleButton
                icon="briefcase"
                value="hr"
                style={role === 'hr' ? styles.toggleBtnActive : styles.toggleBtn}
                size={36}
                accessibilityLabel="I'm HR or recruiter"
              />
              <Text style={styles.toggleLabel}>HR / Recruiter</Text>
            </ToggleButton.Row>
          </Surface>
        );
      case STEP_COMPANY:
        return (
          <Surface style={styles.surface}>
            <Text style={[styles.companyLabelPrompt, { marginTop: 10 }]}>
              {role === "candidate"
                ? "Companies you want to see:"
                : "What kind of company are you hiring for?"}
            </Text>
            <ToggleButton.Row
              onValueChange={handleCompanyType}
              value={companyType ?? ''}
              style={styles.companyRow}
            >
              {companyTypes.map((type) => (
                <ToggleButton
                  key={type.value}
                  value={type.value}
                  style={
                    companyType === type.value
                      ? styles.companyBtnActive
                      : styles.companyBtn
                  }
                  icon={type.icon}
                  size={28}
                  accessibilityLabel={type.label}
                />
              ))}
            </ToggleButton.Row>
            <View style={styles.companyLabelsRow}>
              {companyTypes.map((type) => (
                <Text
                  key={type.value}
                  style={[
                    styles.companyLabel,
                    companyType === type.value && styles.companyLabelActive,
                  ]}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>
              ))}
            </View>
          </Surface>
        );
      case STEP_LOCATION:
        return (
          <Surface style={styles.surface}>
            <Text style={styles.label}>
              Choose your preferred location
            </Text>
            <Text style={{ color: "#777", fontSize: 14, marginBottom: 10, textAlign: 'center' }}>
              Swipe candidates/HR near you, or teleport to another city for your dream job/hire!
            </Text>
            <Button
              icon="crosshairs-gps"
              mode="outlined"
              style={styles.locationBtn}
              textColor={ACCENT}
              onPress={handleGetCurrentLocation}
              loading={locating}
              disabled={locating}
            >
              {locating ? "Fetching..." : "Use My Current Location"}
            </Button>
            <TouchableOpacity
              style={styles.locationTeleport}
              onPress={() => setLocationDialog(true)}
            >
              <Text style={styles.locationTeleportText}>
                Or teleport elsewhere
              </Text>
            </TouchableOpacity>
            {location && (
              <View style={styles.locationSelectedBox}>
                <Text style={{ color: GOLD, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                  Selected: {location}
                </Text>
              </View>
            )}
            {locationError && <Text style={{ color: "red", marginTop: 7, textAlign: 'center' }}>{locationError}</Text>}
          </Surface>
        );
      case STEP_DETAIL:
        if (role === "candidate") {
          const CandidateOnboarding = require("./candidate/OnboardingCandidate").default;
          return <CandidateOnboarding onComplete={handleContinue} />;
        } else if (role === "hr") {
          const HrOnboarding = require("./hr/OnboardingHR").default;
          return <HrOnboarding onComplete={handleContinue} />;
        }
        return null;
      default:
        return null;
    }
  };

  // Dialog for manual location entry
  const renderLocationDialog = () => (
    <Portal>
      <Dialog visible={locationDialog} onDismiss={() => setLocationDialog(false)}>
        <Dialog.Title>Set Custom Location</Dialog.Title>
        <Dialog.Content>
          <Text style={{ marginBottom: 15 }}>
            Enter a city, region, or country to swipe remotely.
          </Text>
          <TextInput
            mode="outlined"
            label="Location"
            value={customLocation}
            onChangeText={setCustomLocation}
            style={{ marginBottom: 12, backgroundColor: WHITE }}
            autoFocus
          />
          <Button
            mode="contained"
            onPress={handleManualLocation}
            style={{ backgroundColor: GOLD, marginTop: 8 }}
            disabled={customLocation.trim().length === 0}
          >
            Set Location
          </Button>
          <Button
            onPress={() => setLocationDialog(false)}
            style={{ marginTop: 10 }}
            textColor={ACCENT}
          >
            Cancel
          </Button>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );

  // Dialog for exit confirmation
  const renderExitDialog = () => (
    <Portal>
      <Dialog visible={exitDialog} onDismiss={() => setExitDialog(false)}>
        <Dialog.Title>Exit Onboarding?</Dialog.Title>
        <Dialog.Content>
          <Text>
            Are you sure you want to exit onboarding? Your progress will be lost.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setExitDialog(false)}>Cancel</Button>
          <Button onPress={() => { setExitDialog(false); navigation.goBack(); }} textColor={GOLD}>Exit</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // Continue button disabled logic
  const continueDisabled =
    loading ||
    (step === STEP_ROLE && !role) ||
    (step === STEP_COMPANY && !companyType) ||
    (step === STEP_LOCATION && !location);

  // Animated progress bar width for visual feedback
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['20%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityLabel="Back" onPress={handleBack} style={{ position: "absolute", top: 44, left: 14, zIndex: 2 }}>
        {step !== STEP_ROLE &&
          <Text style={{ color: ACCENT, fontWeight: "bold", fontSize: 18 }}>{'← Back'}</Text>
        }
      </TouchableOpacity>
      <Image
        source={require('../assets/images/metanoia-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.heading}>Welcome to Metanoia</Text>
      <Text style={styles.subheading}>
        Find your dream job or your dream hire.
      </Text>
      <Animated.View style={[styles.progressBar, { width: progressBarWidth }]}>
        <ProgressBar
          progress={progress}
          color={GOLD}
          style={{ backgroundColor: GOLD_ACCENT + "33", height: 9, borderRadius: 10 }}
        />
      </Animated.View>
      {renderStep()}
      {renderLocationDialog()}
      {renderExitDialog()}
      {step < STEP_DETAIL && (
        <Button
          mode="contained"
          style={styles.continueBtn}
          disabled={continueDisabled}
          onPress={handleContinue}
          buttonColor={GOLD}
          textColor={WHITE}
          loading={loading}
          icon="chevron-right"
        >
          {step === STEP_LOCATION ? "Continue" : "Continue"}
        </Button>
      )}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2200}
        style={{
          backgroundColor: snackbar.type === "error" ? "#b92c2c" : ACCENT,
        }}
      >
        {snackbar.message}
      </Snackbar>
      <Text style={styles.footerText}>
        By continuing, you agree to Metanoia's{' '}
        <Text style={{ color: ACCENT, textDecorationLine: 'underline' }}>Terms</Text> &{' '}
        <Text style={{ color: ACCENT, textDecorationLine: 'underline' }}>Privacy</Text>
      </Text>
    </View>
  );
}

// Provider wrapper for context
export default function OnboardingScreen(props: OnboardingScreenProps) {
  return (
    <OnboardingProvider>
      <OnboardingScreenInner {...props} />
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: OFF_WHITE },
  logo: { width: 85, height: 85, alignSelf: 'center', marginBottom: 16, marginTop: 10 },
  heading: { fontSize: 32, fontWeight: 'bold', color: GOLD, textAlign: 'center', marginBottom: 4, letterSpacing: 0.5 },
  subheading: { fontSize: 16, color: DARK_TEXT, textAlign: 'center', marginBottom: 18, fontWeight: '400' },
  progressBar: { width: '80%', alignSelf: 'center', marginBottom: 18, borderRadius: 10, backgroundColor: GOLD_ACCENT + "33" },
  surface: {
    marginTop: 12,
    padding: 20,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    elevation: 5,
    marginBottom: 30,
  },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: ACCENT, letterSpacing: 0.3, textAlign: 'center' },
  toggleRow: { justifyContent: 'center', marginVertical: 8, alignItems: 'center', alignSelf: 'center' },
  toggleBtn: { marginHorizontal: 6, borderRadius: 16, borderColor: '#aaa', borderWidth: 1, backgroundColor: WHITE, width: 52, height: 52 },
  toggleBtnActive: { marginHorizontal: 6, borderRadius: 16, borderColor: GOLD, borderWidth: 2.5, backgroundColor: GOLD_ACCENT + "33", width: 52, height: 52 },
  toggleLabel: { fontSize: 14, color: DARK_TEXT, textAlign: 'center', marginHorizontal: 8, marginBottom: 8, fontWeight: '600' },
  companyLabelPrompt: { fontSize: 15, color: DARK_TEXT, fontWeight: 'bold', marginBottom: 7, textAlign: 'center' },
  companyRow: { justifyContent: 'space-between', marginVertical: 8, alignSelf: 'center' },
  companyBtn: { marginHorizontal: 8, borderRadius: 14, borderColor: '#aaa', borderWidth: 1, backgroundColor: WHITE, width: 46, height: 46 },
  companyBtnActive: { marginHorizontal: 8, borderRadius: 14, borderColor: GOLD, borderWidth: 2.2, backgroundColor: GOLD_ACCENT + "33", width: 46, height: 46 },
  companyLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 2 },
  companyLabel: { flex: 1, fontSize: 12, color: DARK_TEXT, textAlign: 'center', fontWeight: '400', marginHorizontal: 1 },
  companyLabelActive: { color: GOLD, fontWeight: 'bold' },
  continueBtn: { marginTop: 25, borderRadius: 25, paddingVertical: 8, width: '90%', alignSelf: 'center', elevation: 2 },
  footerText: { fontSize: 12, color: "#888", textAlign: 'center', marginTop: 22 },
  locationBtn: { marginBottom: 10, borderColor: ACCENT, borderWidth: 1 },
  locationTeleport: { alignSelf: 'center', marginBottom: 14, marginTop: 2 },
  locationTeleportText: { color: ACCENT, textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 15 },
  locationSelectedBox: {
    backgroundColor: GOLD_ACCENT + "11",
    borderRadius: 10,
    marginVertical: 12,
    padding: 10,
    alignItems: 'center',
  },
});