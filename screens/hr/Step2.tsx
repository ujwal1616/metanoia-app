import React, { useState, useRef, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, Avatar, IconButton, Portal, Dialog } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingContext } from '../OnboardingContext';

// Hinge/Bumble colors
const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";

// Example roles for hiring
const HIRING_ROLES = [
  "Software Engineer", "Designer", "Product Manager", "Sales", "HR", "Marketing", "Data Scientist", "Finance"
];

function isAlphaSpace(str: string) {
  return /^[a-zA-Z\s'.-]+$/.test(str);
}

export default function Step2({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [fullName, setFullName] = useState(answers.fullName || '');
  const [designation, setDesignation] = useState(answers.designation || '');
  const [companyName, setCompanyName] = useState(answers.companyName || '');
  const [profilePicUri, setProfilePicUri] = useState<string | undefined>(answers.profilePicUri);
  const [companyLogoUri, setCompanyLogoUri] = useState<string | undefined>(answers.companyLogoUri);
  const [linkedIn, setLinkedIn] = useState(answers.linkedIn || '');
  const [hiringFor, setHiringFor] = useState<string[]>(answers.hiringFor || []);
  const [touched, setTouched] = useState({ fullName: false, designation: false, companyName: false, linkedIn: false });

  // For image picker modal
  const [logoDialog, setLogoDialog] = useState(false);
  const [picDialog, setPicDialog] = useState(false);

  const isFullNameValid = fullName.length >= 2 && isAlphaSpace(fullName);
  const isDesignationValid = designation.length >= 2;
  const isCompanyNameValid = companyName.length >= 2;
  const isLinkedInValid = !linkedIn || /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(linkedIn.trim());

  const canContinue = isFullNameValid && isDesignationValid && isCompanyNameValid && isLinkedInValid;

  // Image pickers
  const pickImage = async (forLogo = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      if (forLogo) setCompanyLogoUri(result.assets[0].uri);
      else setProfilePicUri(result.assets[0].uri);
    }
    setLogoDialog(false);
    setPicDialog(false);
  };

  // Chip select for hiring roles
  const toggleHiringRole = (role: string) => {
    setHiringFor((prev) =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleNextStep = () => {
    setAnswer("fullName", fullName.trim());
    setAnswer("designation", designation.trim());
    setAnswer("companyName", companyName.trim());
    setAnswer("companyLogoUri", companyLogoUri);
    setAnswer("profilePicUri", profilePicUri);
    setAnswer("linkedIn", linkedIn.trim());
    setAnswer("hiringFor", hiringFor);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Let’s put a name to the face behind the hires
            <Text style={{ color: GOLD }}> 😉</Text>
          </Text>
        </Surface>
        {/* Profile Pic Upload */}
        <View style={styles.avatarRow}>
          <Avatar.Image 
            size={64} 
            source={
              profilePicUri 
                ? { uri: profilePicUri } 
                : require('../../assets/images/avatar-placeholder.png')
            }
            style={{ backgroundColor: CARD_BG }}
          />
          <IconButton icon="camera" size={26} onPress={() => setPicDialog(true)} style={{ marginLeft: -10, marginTop: 18 }} />
          <Text style={{ marginLeft: 10, color: ACCENT, fontWeight: "bold" }}>Profile Pic</Text>
        </View>
        {/* Company Logo Upload */}
        <View style={styles.avatarRow}>
          <Avatar.Image 
            size={52} 
            source={
              companyLogoUri 
                ? { uri: companyLogoUri } 
                : require('../../assets/images/logo-placeholder.png')
            }
            style={{ backgroundColor: CARD_BG }}
          />
          <IconButton icon="camera" size={22} onPress={() => setLogoDialog(true)} style={{ marginLeft: -10, marginTop: 12 }} />
          <Text style={{ marginLeft: 10, color: GOLD, fontWeight: "bold" }}>Company Logo</Text>
        </View>
        {/* Text Inputs */}
        <TextInput
          label="Your Full Name"
          value={fullName}
          onChangeText={text => setFullName(text)}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, fullName: true }))}
          maxLength={40}
          autoCapitalize="words"
          left={<TextInput.Icon icon="account" />}
          error={touched.fullName && !isFullNameValid}
        />
        <HelperText type="error" visible={touched.fullName && !isFullNameValid}>
          Please enter a valid name (letters, spaces, and .'- only, 2+ chars).
        </HelperText>
        <TextInput
          label="Designation"
          value={designation}
          onChangeText={setDesignation}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, designation: true }))}
          maxLength={32}
          left={<TextInput.Icon icon="briefcase-outline" />}
          error={touched.designation && !isDesignationValid}
        />
        <HelperText type="error" visible={touched.designation && !isDesignationValid}>
          Please enter your designation (min 2 characters).
        </HelperText>
        <TextInput
          label="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, companyName: true }))}
          maxLength={40}
          left={<TextInput.Icon icon="office-building-outline" />}
          error={touched.companyName && !isCompanyNameValid}
        />
        <HelperText type="error" visible={touched.companyName && !isCompanyNameValid}>
          Please enter your company name (min 2 characters).
        </HelperText>
        <TextInput
          label="LinkedIn Profile (optional)"
          value={linkedIn}
          onChangeText={setLinkedIn}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, linkedIn: true }))}
          maxLength={80}
          left={<TextInput.Icon icon="linkedin" />}
          error={touched.linkedIn && !isLinkedInValid}
        />
        <HelperText type="error" visible={touched.linkedIn && !isLinkedInValid}>
          Enter a valid LinkedIn URL (starts with https://linkedin.com/)
        </HelperText>

        {/* What roles are you hiring for */}
        <Text style={styles.labelSmall}>
          What roles are you hiring for? <Text style={{ color: "#aaa" }}>(optional, multiple)</Text>
        </Text>
        <View style={styles.chipRow}>
          {HIRING_ROLES.map(role => (
            <Button
              key={role}
              mode={hiringFor.includes(role) ? "contained" : "outlined"}
              style={hiringFor.includes(role) ? styles.chipActive : styles.chip}
              onPress={() => toggleHiringRole(role)}
              compact
              labelStyle={hiringFor.includes(role) ? { color: "#fff" } : { color: ACCENT }}
            >
              {role}
            </Button>
          ))}
        </View>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={!canContinue}
        >
          Next
        </Button>
      </View>
      {/* Avatar Dialogs */}
      <Portal>
        <Dialog visible={picDialog} onDismiss={() => setPicDialog(false)}>
          <Dialog.Title>Upload Profile Photo</Dialog.Title>
          <Dialog.Content>
            <Button icon="camera" mode="outlined" onPress={() => pickImage(false)}>Pick from Gallery</Button>
          </Dialog.Content>
        </Dialog>
        <Dialog visible={logoDialog} onDismiss={() => setLogoDialog(false)}>
          <Dialog.Title>Upload Company Logo</Dialog.Title>
          <Dialog.Content>
            <Button icon="camera" mode="outlined" onPress={() => pickImage(true)}>Pick from Gallery</Button>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: OFF_WHITE },
  surface: {
    padding: 15,
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    elevation: 2,
  },
  title: {
    color: DARK_TEXT,
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 18,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 2
  },
  labelSmall: {
    fontSize: 15,
    fontWeight: 'bold',
    color: ACCENT,
    marginTop: 12,
    marginBottom: 2,
    marginLeft: 2
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    marginTop: 1,
    marginLeft: 0
  },
  chip: {
    borderColor: ACCENT,
    margin: 2,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    minHeight: 28,
    minWidth: 0,
    paddingHorizontal: 6
  },
  chipActive: {
    borderColor: GOLD,
    margin: 2,
    borderRadius: 18,
    backgroundColor: GOLD,
    minHeight: 28,
    minWidth: 0,
    paddingHorizontal: 6
  },
});