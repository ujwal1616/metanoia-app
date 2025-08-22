import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, RadioButton, HelperText, Chip, IconButton, Portal, Dialog } from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const ACCENT = "#6c47ff";
const CARD_BG = "#FFF9EC";
const OFF_WHITE = "#f6f4ff";
const DARK_TEXT = "#232323";

const WORK_TYPE_LABELS: Record<string, string> = {
  onsite: "Onsite (everyone in the office)",
  hybrid: "Hybrid (mix of in-office and remote)",
  remote: "Remote (work from anywhere)",
};

export default function Step6({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [officeLocation, setOfficeLocation] = useState(answers.officeLocation || "");
  const [workType, setWorkType] = useState(answers.workType || "");
  const [satelliteOffices, setSatelliteOffices] = useState<string[]>(answers.satelliteOffices || []);
  const [satDialog, setSatDialog] = useState(false);
  const [satInput, setSatInput] = useState("");
  const [timezone, setTimezone] = useState(answers.timezone || "");
  const [relocationSupport, setRelocationSupport] = useState(answers.relocationSupport || false);
  const [remotePolicyNote, setRemotePolicyNote] = useState(answers.remotePolicyNote || "");

  const [touched, setTouched] = useState({ officeLocation: false, workType: false });

  const isOfficeLocationValid = officeLocation.trim().length >= 2;
  const isWorkTypeValid = !!workType;
  const canContinue = isOfficeLocationValid && isWorkTypeValid;

  // Satellite office logic
  const addSatellite = () => {
    const val = satInput.trim();
    if (val.length >= 2 && !satelliteOffices.includes(val)) {
      setSatelliteOffices([...satelliteOffices, val]);
      setSatInput("");
    }
  };
  const removeSatellite = (val: string) =>
    setSatelliteOffices(satelliteOffices.filter(s => s !== val));

  const handleNextStep = () => {
    setAnswer("officeLocation", officeLocation.trim());
    setAnswer("workType", workType);
    setAnswer("satelliteOffices", satelliteOffices);
    setAnswer("timezone", timezone.trim());
    setAnswer("relocationSupport", relocationSupport);
    setAnswer("remotePolicyNote", remotePolicyNote.trim());
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
            Where’s the magic happening?
            <Text style={{ color: GOLD }}> 🏙️</Text>
          </Text>
        </Surface>
        <TextInput
          label="City / Main Office Location"
          value={officeLocation}
          onChangeText={setOfficeLocation}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, officeLocation: true }))}
          maxLength={48}
          left={<TextInput.Icon icon="map-marker-outline" />}
          placeholder="e.g. Bengaluru, Mumbai, New York"
          error={touched.officeLocation && !isOfficeLocationValid}
        />
        <HelperText type="error" visible={touched.officeLocation && !isOfficeLocationValid}>
          Please enter a valid location (min 2 characters).
        </HelperText>
        {/* Satellite offices */}
        <View style={styles.satelliteHeaderRow}>
          <Text style={styles.labelSmall}>Satellite/Other Offices (optional)</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => setSatDialog(true)} />
        </View>
        <View style={styles.satelliteRow}>
          {satelliteOffices.map(sat => (
            <Chip key={sat} onClose={() => removeSatellite(sat)} style={styles.satelliteChip}>
              {sat}
            </Chip>
          ))}
        </View>
        {/* Timezone */}
        <TextInput
          label="Main Timezone (optional)"
          value={timezone}
          onChangeText={setTimezone}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. IST, PST, UTC+2"
          maxLength={18}
          left={<TextInput.Icon icon="clock-outline" />}
        />
        <Text style={styles.radioLabel}>Work Type:</Text>
        <RadioButton.Group
          onValueChange={value => {
            setWorkType(value);
            setTouched(t => ({ ...t, workType: true }));
          }}
          value={workType}
        >
          <Surface style={styles.radioSurface}>
            {Object.entries(WORK_TYPE_LABELS).map(([value, label]) => (
              <RadioButton.Item
                key={value}
                label={label}
                value={value}
                mode="android"
                position="leading"
                labelStyle={styles.radioItemLabel}
                style={styles.radioItem}
                uncheckedColor={GOLD}
                color={ACCENT}
              />
            ))}
          </Surface>
        </RadioButton.Group>
        <HelperText type="error" visible={touched.workType && !isWorkTypeValid}>
          Please select a work type.
        </HelperText>
        {/* Relocation and remote policy */}
        <View style={styles.row}>
          <Chip
            selected={relocationSupport}
            style={relocationSupport ? styles.chipActive : styles.chip}
            textStyle={{ color: relocationSupport ? '#fff' : GOLD }}
            onPress={() => setRelocationSupport(r => !r)}
            icon="airplane"
            compact
          >
            Relocation Support
          </Chip>
        </View>
        {workType === "remote" && (
          <TextInput
            label="Remote Policy Notes (optional)"
            value={remotePolicyNote}
            onChangeText={setRemotePolicyNote}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. Only within India, or any time zone"
            left={<TextInput.Icon icon="information-outline" />}
            maxLength={100}
          />
        )}
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={!canContinue}
        >
          Next
        </Button>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            This helps candidates know where they’ll work and what to expect.
          </Text>
        </View>
        {/* Satellite office dialog */}
        <Portal>
          <Dialog visible={satDialog} onDismiss={() => setSatDialog(false)}>
            <Dialog.Title>Add a Satellite Office</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Office Location"
                value={satInput}
                onChangeText={setSatInput}
                mode="outlined"
                maxLength={48}
                placeholder="e.g. Pune, Berlin, London"
                left={<TextInput.Icon icon="map-marker-outline" />}
                autoCapitalize="words"
                onSubmitEditing={addSatellite}
                style={{ marginBottom: 8 }}
              />
              <Button mode="contained" onPress={addSatellite} disabled={satInput.trim().length < 2}>
                Add
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: OFF_WHITE },
  surface: {
    padding: 15,
    marginBottom: 18,
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
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ACCENT,
    marginTop: 6,
    marginBottom: 2,
  },
  satelliteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
    marginLeft: 0,
    minHeight: 28,
  },
  satelliteHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    marginBottom: 2,
    marginLeft: 2
  },
  satelliteChip: {
    backgroundColor: "#E3F2FD",
    marginRight: 6,
    marginBottom: 5
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 8,
    color: DARK_TEXT,
  },
  radioSurface: {
    backgroundColor: OFF_WHITE,
    borderRadius: 8,
    paddingVertical: 0,
    marginBottom: 2,
    marginTop: -3,
    elevation: 0,
  },
  radioItem: {
    paddingVertical: 0,
    marginVertical: -2,
  },
  radioItemLabel: {
    fontSize: 15,
    color: DARK_TEXT,
  },
  button: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    marginLeft: 2,
  },
  chip: {
    borderColor: GOLD,
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