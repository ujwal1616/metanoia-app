import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, Chip, IconButton, Portal, Dialog } from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";

const MAX_MISSION = 100;
const MAX_VISION = 100;
const CORE_VALUES = [
  "Integrity", "Innovation", "Empathy", "Excellence", "Diversity", "Transparency", "Teamwork", "Learning"
];

export default function Step5({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [companyMission, setCompanyMission] = useState(answers.companyMission || "");
  const [vision, setVision] = useState(answers.vision || "");
  const [coreValues, setCoreValues] = useState<string[]>(answers.coreValues || []);
  const [hashtags, setHashtags] = useState<string[]>(answers.hashtags || []);

  const [touched, setTouched] = useState({ mission: false, vision: false });
  const [hashtagDialog, setHashtagDialog] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");

  const isValidMission = companyMission.trim().length >= 4 && companyMission.length <= MAX_MISSION;
  const isValidVision = !vision || (vision.trim().length >= 4 && vision.length <= MAX_VISION);

  const toggleCoreValue = (val: string) =>
    setCoreValues((prev) => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const addHashtag = () => {
    const tag = hashtagInput.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => setHashtags(hashtags.filter(h => h !== tag));

  const canContinue = isValidMission && isValidVision;

  const handleNextStep = () => {
    setAnswer("companyMission", companyMission.trim());
    setAnswer("vision", vision.trim());
    setAnswer("coreValues", coreValues);
    setAnswer("hashtags", hashtags);
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
            What’s your vibe/mission in one line?
            <Text style={{ color: GOLD }}> 💡</Text>
          </Text>
        </Surface>
        <TextInput
          label="Company Mission"
          value={companyMission}
          onChangeText={text => setCompanyMission(text)}
          mode="outlined"
          placeholder="Make it memorable"
          multiline
          maxLength={MAX_MISSION}
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, mission: true }))}
          left={<TextInput.Icon icon="flag-outline" />}
          error={touched.mission && !isValidMission}
        />
        <View style={styles.helperRow}>
          <HelperText type="info" visible>
            {companyMission.length}/{MAX_MISSION} characters
          </HelperText>
          <HelperText type="error" visible={touched.mission && !isValidMission} style={{ marginLeft: 10 }}>
            Please enter at least 4 characters (max {MAX_MISSION}).
          </HelperText>
        </View>
        <TextInput
          label="Company Vision (optional)"
          value={vision}
          onChangeText={setVision}
          mode="outlined"
          placeholder="Where are you headed?"
          multiline
          maxLength={MAX_VISION}
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, vision: true }))}
          left={<TextInput.Icon icon="eye-outline" />}
          error={!!vision && !isValidVision}
        />
        <View style={styles.helperRow}>
          <HelperText type="info" visible>
            {vision.length}/{MAX_VISION} characters
          </HelperText>
          <HelperText type="error" visible={!!vision && !isValidVision} style={{ marginLeft: 10 }}>
            Please enter at least 4 characters (max {MAX_VISION}) if provided.
          </HelperText>
        </View>
        {/* Core Values */}
        <Text style={styles.labelSmall}>Pick core values (optional, multiple):</Text>
        <View style={styles.valuesRow}>
          {CORE_VALUES.map(val => (
            <Chip
              key={val}
              selected={coreValues.includes(val)}
              style={coreValues.includes(val) ? styles.chipActive : styles.chip}
              textStyle={{ color: coreValues.includes(val) ? "#fff" : GOLD }}
              onPress={() => toggleCoreValue(val)}
              compact
            >
              {val}
            </Chip>
          ))}
        </View>
        {/* Hashtags */}
        <View style={styles.hashtagTitleRow}>
          <Text style={{ color: ACCENT, fontWeight: "bold" }}>#Hashtags for your brand (optional)</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => setHashtagDialog(true)} />
        </View>
        <View style={styles.hashtagsRow}>
          {hashtags.map(tag => (
            <Chip
              key={tag}
              onClose={() => removeHashtag(tag)}
              style={styles.hashtagChip}
              textStyle={{ color: ACCENT }}
            >
              #{tag}
            </Chip>
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
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            This is your pitch to candidates – keep it short, strong, and real!
          </Text>
        </View>
        {/* Hashtag dialog */}
        <Portal>
          <Dialog visible={hashtagDialog} onDismiss={() => setHashtagDialog(false)}>
            <Dialog.Title>Add a Hashtag</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Brand Hashtag"
                value={hashtagInput}
                onChangeText={setHashtagInput}
                mode="outlined"
                maxLength={20}
                placeholder="e.g. #culture, #openroles"
                style={{ marginBottom: 8 }}
                left={<TextInput.Icon icon="pound" />}
                autoCapitalize="none"
                onSubmitEditing={addHashtag}
              />
              <Button mode="contained" onPress={addHashtag} disabled={!hashtagInput}>
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
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -4,
  },
  button: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  labelSmall: {
    fontSize: 15,
    fontWeight: 'bold',
    color: GOLD,
    marginTop: 12,
    marginBottom: 2,
    marginLeft: 2
  },
  valuesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    marginLeft: 0,
    minHeight: 28,
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
  hashtagTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 1,
    marginLeft: 2
  },
  hashtagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    marginLeft: 2,
    minHeight: 28,
    alignItems: "center"
  },
  hashtagChip: {
    backgroundColor: "#e3e0ff",
    marginRight: 6,
    marginBottom: 5
  }
});