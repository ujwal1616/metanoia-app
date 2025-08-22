import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Chip,
  Surface,
  HelperText,
  Divider,
  IconButton,
  Portal,
  Dialog,
  Checkbox,
} from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

const SUGGESTED_PERKS = [
  "Remote Friendly",
  "Casual Fridays",
  "Flexible Hours",
  "Health Benefits",
  "Team Trips",
  "Stock Options",
  "Learning Budget",
  "Free Lunch",
  "Paid Parental Leave",
  "Wellness Programs",
  "Four-Day Workweek",
  "Dog Friendly",
  "Commuter Benefits",
  "Gym Membership",
  "Unlimited PTO",
  "Annual Bonus",
  "Relocation Support",
  "Home Office Stipend",
  "Mental Health Support",
  "Volunteer Days",
  "Retirement Plan",
];

const PERK_CATEGORIES = [
  { label: "Work-life", perks: ["Remote Friendly", "Flexible Hours", "Four-Day Workweek", "Unlimited PTO", "Casual Fridays"] },
  { label: "Wellness", perks: ["Health Benefits", "Mental Health Support", "Gym Membership", "Wellness Programs"] },
  { label: "Financial", perks: ["Stock Options", "Annual Bonus", "Retirement Plan", "Learning Budget", "Commuter Benefits", "Relocation Support", "Home Office Stipend"] },
  { label: "Family", perks: ["Paid Parental Leave"] },
  { label: "Fun & Team", perks: ["Dog Friendly", "Team Trips", "Free Lunch", "Volunteer Days"] },
];

function getSuggestions(input: string, all: string[], selected: string[]) {
  if (!input) return [];
  const lower = input.trim().toLowerCase();
  const startsWith = all.filter(
    s => s.toLowerCase().startsWith(lower) && !selected.some(sel => sel.toLowerCase() === s.toLowerCase())
  );
  const contains = all.filter(
    s => s.toLowerCase().includes(lower) && !s.toLowerCase().startsWith(lower) && !selected.some(sel => sel.toLowerCase() === s.toLowerCase())
  );
  return [...startsWith, ...contains].slice(0, 8);
}

export default function Step9({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [perks, setPerks] = useState(answers.perks || []);
  const [inputPerk, setInputPerk] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touched, setTouched] = useState(false);

  // Advanced fields
  const [highlight, setHighlight] = useState(answers.highlight || "");
  const [showPerksOnCard, setShowPerksOnCard] = useState(answers.showPerksOnCard ?? true);
  const [customPerkNotes, setCustomPerkNotes] = useState(answers.customPerkNotes || "");
  const [ecoFriendly, setEcoFriendly] = useState(answers.ecoFriendly ?? false);
  const [imageDialog, setImageDialog] = useState(false);
  const [perksImages, setPerksImages] = useState<string[]>(answers.perksImages || []);
  const [imageInput, setImageInput] = useState("");

  const suggestions = getSuggestions(inputPerk, SUGGESTED_PERKS, perks);

  const addPerk = (val?: string) => {
    const value = (val ?? inputPerk).trim();
    if (
      value &&
      !perks.some(p => p.toLowerCase() === value.toLowerCase()) &&
      value.length <= 40
    ) {
      setPerks([...perks, value]);
      setInputPerk("");
      setShowSuggestions(false);
      setTouched(false);
    } else if (value.length > 40) {
      setTouched(true);
    }
  };
  const removePerk = (perk: string) => setPerks(perks.filter((p: string) => p !== perk));

  // Perk image handling (could be camera/gallery picker but now just URL for demo)
  const addImage = () => {
    const url = imageInput.trim();
    if (url && !perksImages.includes(url)) {
      setPerksImages([...perksImages, url]);
      setImageInput("");
      setImageDialog(false);
    }
  };
  const removeImage = (url: string) => setPerksImages(perksImages.filter(i => i !== url));

  const handleNextStep = () => {
    setAnswer('perks', perks);
    setAnswer('highlight', highlight || undefined);
    setAnswer('showPerksOnCard', showPerksOnCard);
    setAnswer('customPerkNotes', customPerkNotes.trim());
    setAnswer('ecoFriendly', ecoFriendly);
    setAnswer('perksImages', perksImages);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Let’s talk perks.<Text style={{ color: "#B88908" }}> 🎉</Text>
          </Text>
        </Surface>
        <Text style={styles.label}>Select from popular perks, categories, or add your own:</Text>

        {/* Quick-add perk categories */}
        <View>
          {PERK_CATEGORIES.map(cat => (
            <View key={cat.label} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{cat.label}:</Text>
              {cat.perks.map(perk => (
                <Chip
                  key={perk}
                  style={[
                    styles.suggestedChip,
                    perks.some(p => p.toLowerCase() === perk.toLowerCase()) && styles.selectedChip,
                  ]}
                  selected={perks.some(p => p.toLowerCase() === perk.toLowerCase())}
                  onPress={() => addPerk(perk)}
                  icon={perks.some(p => p.toLowerCase() === perk.toLowerCase()) ? "check" : undefined}
                  disabled={perks.some(p => p.toLowerCase() === perk.toLowerCase())}
                  compact
                  textStyle={{ fontSize: 13, fontWeight: "bold" }}
                >
                  {perk}
                </Chip>
              ))}
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 10 }} />
        <View>
          <TextInput
            label="Custom Perk"
            value={inputPerk}
            onChangeText={text => {
              setInputPerk(text);
              setShowSuggestions(!!text);
              setTouched(false);
            }}
            onSubmitEditing={() => addPerk()}
            mode="outlined"
            placeholder="e.g. Home Office Stipend"
            left={<TextInput.Icon icon="star-outline" />}
            maxLength={40}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            error={touched && inputPerk.length > 40}
          />
          {showSuggestions && suggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={suggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => addPerk(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
          <HelperText type="info" visible={inputPerk.length > 0}>
            {inputPerk.length}/40 characters
          </HelperText>
          <HelperText type="error" visible={touched && inputPerk.length > 40}>
            Perk name must be less than 40 characters.
          </HelperText>
        </View>
        <Button
          onPress={() => addPerk()}
          disabled={!inputPerk.trim() || inputPerk.length > 40}
          style={styles.addBtn}
          icon="plus"
        >
          Add Perk
        </Button>

        <Divider style={{ marginVertical: 8 }} />

        <Text style={styles.selectedLabel}>Selected Perks:</Text>
        <View style={styles.selectedRow}>
          {perks.map(perk => (
            <Chip
              key={perk}
              style={styles.selectedChip}
              onClose={() => removePerk(perk)}
              mode="outlined"
              closeIcon="close"
            >
              {perk}
            </Chip>
          ))}
        </View>

        {/* Advanced: highlight a perk */}
        {perks.length > 0 && (
          <View style={styles.highlightSection}>
            <Text style={styles.sectionLabel}>Highlight a Key Perk:</Text>
            <View style={styles.highlightRow}>
              {perks.map(pk => (
                <Chip
                  key={pk}
                  selected={highlight === pk}
                  style={highlight === pk ? styles.chipActive : styles.chip}
                  onPress={() => setHighlight(pk)}
                  compact
                >
                  {pk}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Advanced: eco-friendly */}
        <View style={styles.row}>
          <Checkbox
            status={ecoFriendly ? "checked" : "unchecked"}
            onPress={() => setEcoFriendly(e => !e)}
            color="#6c47ff"
          />
          <Text style={styles.checkboxLabel}>Eco-friendly (sustainable, green office, etc)</Text>
        </View>

        {/* Advanced: show perks on card */}
        <View style={styles.row}>
          <Checkbox
            status={showPerksOnCard ? "checked" : "unchecked"}
            onPress={() => setShowPerksOnCard(s => !s)}
            color="#B88908"
          />
          <Text style={styles.checkboxLabel}>
            Show perks on job card (recommended)
          </Text>
        </View>

        {/* Advanced: custom perk notes */}
        <TextInput
          label="Notes about perks (optional)"
          value={customPerkNotes}
          onChangeText={setCustomPerkNotes}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. Our team trip is to Bali every year! Or perks with a twist."
          maxLength={120}
          multiline
        />

        {/* Advanced: add perks images */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Perk Images (optional)</Text>
          <IconButton icon="plus-circle-outline" size={20} onPress={() => setImageDialog(true)} />
          <View style={styles.imageRow}>
            {perksImages.map(url => (
              <View key={url} style={styles.imageBox}>
                <Text style={{ fontSize: 11, color: "#888" }}>{url.length > 26 ? url.slice(0, 24) + "..." : url}</Text>
                <IconButton icon="delete-outline" size={14} onPress={() => removeImage(url)} />
              </View>
            ))}
          </View>
        </View>
        <Portal>
          <Dialog visible={imageDialog} onDismiss={() => setImageDialog(false)}>
            <Dialog.Title>Add Perk Image (URL for demo)</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Image URL"
                value={imageInput}
                onChangeText={setImageInput}
                mode="outlined"
                maxLength={120}
                placeholder="https://example.com/perk.jpg"
              />
              <Button mode="contained" onPress={addImage} disabled={!imageInput.trim()}>
                Add
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>

        <Button
          mode="contained"
          style={styles.nextBtn}
          onPress={handleNextStep}
          disabled={perks.length === 0}
        >
          Next
        </Button>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Perks help you stand out to great talent. Get creative!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FAF9F6" },
  surface: {
    padding: 15,
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: '#FFF9EC',
    elevation: 2,
  },
  title: {
    color: '#232323',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  label: { marginBottom: 8, color: "#232323", fontWeight: '600', fontSize: 15 },
  suggestedRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  suggestedChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f6f4ff",
    borderColor: "#ece3ff",
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: "#ffeec6",
    borderColor: "#B88908",
    borderWidth: 1,
  },
  addBtn: { alignSelf: 'flex-end', marginVertical: 6 },
  selectedLabel: { marginTop: 10, fontWeight: '600', color: "#B88908" },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  nextBtn: {
    marginTop: 20,
    backgroundColor: '#B88908',
    borderRadius: 16,
    paddingVertical: 5,
  },
  suggestionDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 2,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    maxHeight: 180,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e7e7e7",
  },
  suggestionText: {
    fontSize: 16,
    color: "#232323",
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  categoryLabel: {
    color: "#6c47ff",
    fontWeight: "bold",
    marginRight: 3,
    fontSize: 13,
    marginBottom: 2
  },
  highlightSection: { marginTop: 10, marginBottom: 3 },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 },
  chip: {
    borderColor: "#6c47ff",
    margin: 2,
    borderRadius: 18,
    backgroundColor: "#FFF9EC",
    paddingHorizontal: 6,
    minHeight: 28,
    minWidth: 0,
  },
  chipActive: {
    borderColor: "#B88908",
    margin: 2,
    borderRadius: 18,
    backgroundColor: "#B88908",
    minHeight: 28,
    minWidth: 0,
    paddingHorizontal: 6,
  },
  sectionLabel: {
    marginTop: 6,
    marginBottom: 3,
    fontWeight: '700',
    color: "#6c47ff",
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#6c47ff",
    fontWeight: "bold",
    marginLeft: 2,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  imageSection: {
    marginTop: 10,
    marginBottom: 2,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  imageBox: {
    backgroundColor: "#f6f4ff",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#ece3ff",
    padding: 4,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 6,
    flexDirection: 'row',
    minWidth: 70,
    maxWidth: 120,
    gap: 2,
  },
});