import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, Chip, IconButton, Portal, Dialog, Checkbox } from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";

const CURRENT_YEAR = new Date().getFullYear();
const SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+",
];

const CULTURE_TAGS = [
  "Innovative", "Growth", "Mission-driven", "Inclusive", "Collaborative", "Fast-paced", "Flexible", "Transparent"
];
const PERKS = [
  "Remote Work", "Flexible Hours", "Health Insurance", "Wellness Programs", "Learning Budget", "Equity", "Paid Time Off"
];

function isValidYear(val: string) {
  const year = parseInt(val, 10);
  return !val || (val.length === 4 && year > 1800 && year <= CURRENT_YEAR);
}

function isValidUrl(url: string) {
  return !url || /^https?:\/\/\S+\.\S+/.test(url);
}

export default function Step4({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [companyName, setCompanyName] = useState(answers.companyName || "");
  const [industry, setIndustry] = useState(answers.industry || "");
  const [companySize, setCompanySize] = useState(answers.companySize || "");
  const [foundedIn, setFoundedIn] = useState(answers.foundedIn || "");
  const [websiteUrl, setWebsiteUrl] = useState(answers.websiteUrl || "");
  const [cultureTags, setCultureTags] = useState<string[]>(answers.cultureTags || []);
  const [perks, setPerks] = useState<string[]>(answers.perks || []);
  const [remoteFirst, setRemoteFirst] = useState(answers.remoteFirst ?? false);
  const [diversity, setDiversity] = useState(answers.diversity ?? false);
  const [verified, setVerified] = useState(answers.verified ?? false);

  const [cultureDialog, setCultureDialog] = useState(false);
  const [perksDialog, setPerksDialog] = useState(false);

  const [touched, setTouched] = useState({
    companyName: false,
    industry: false,
    companySize: false,
    foundedIn: false,
    websiteUrl: false,
  });

  const isCompanyNameValid = companyName.trim().length >= 2;
  const isIndustryValid = industry.trim().length >= 2;
  const isCompanySizeValid = companySize.length > 0;
  const isFoundedInValid = isValidYear(foundedIn);
  const isWebsiteUrlValid = isValidUrl(websiteUrl);

  const canContinue =
    isCompanyNameValid &&
    isIndustryValid &&
    isCompanySizeValid &&
    isFoundedInValid &&
    isWebsiteUrlValid;

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleNextStep = () => {
    setAnswer("companyName", companyName.trim());
    setAnswer("industry", industry.trim());
    setAnswer("companySize", companySize);
    setAnswer("foundedIn", foundedIn.trim() || undefined);
    setAnswer("websiteUrl", websiteUrl.trim() || undefined);
    setAnswer("cultureTags", cultureTags);
    setAnswer("perks", perks);
    setAnswer("remoteFirst", remoteFirst);
    setAnswer("diversity", diversity);
    setAnswer("verified", verified);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Tell us about the empire you’re building
            <Text style={{ color: GOLD }}> 🏢</Text>
          </Text>
        </Surface>
        <TextInput
          label="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, companyName: true }))}
          maxLength={80}
          left={<TextInput.Icon icon="office-building-outline" />}
          error={touched.companyName && !isCompanyNameValid}
        />
        <HelperText type="error" visible={touched.companyName && !isCompanyNameValid}>
          Please enter your company name (2+ characters).
        </HelperText>
        <TextInput
          label="Industry"
          value={industry}
          onChangeText={setIndustry}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, industry: true }))}
          maxLength={60}
          left={<TextInput.Icon icon="factory" />}
          error={touched.industry && !isIndustryValid}
        />
        <HelperText type="error" visible={touched.industry && !isIndustryValid}>
          Please provide your industry (2+ characters).
        </HelperText>
        <TextInput
          label="Company Size"
          value={companySize}
          onChangeText={setCompanySize}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. 1-10, 11-50, 51-200, etc."
          left={<TextInput.Icon icon="account-group-outline" />}
          onBlur={() => setTouched(t => ({ ...t, companySize: true }))}
          error={touched.companySize && !isCompanySizeValid}
          right={
            <TextInput.Icon
              icon="menu-down"
              onPress={() => {}}
              forceTextInputFocus={false}
            />
          }
        />
        <View style={styles.sizeChips}>
          {SIZES.map(size => (
            <Button
              key={size}
              mode={companySize === size ? "contained" : "outlined"}
              onPress={() => setCompanySize(size)}
              style={{
                marginRight: 8,
                marginBottom: 5,
                borderRadius: 14,
                backgroundColor: companySize === size ? "#ece3ff" : "#fff",
                borderColor: GOLD,
              }}
              labelStyle={{
                color: companySize === size ? ACCENT : GOLD,
                fontWeight: "bold",
                fontSize: 13,
              }}
              compact
            >
              {size}
            </Button>
          ))}
        </View>
        <HelperText type="error" visible={touched.companySize && !isCompanySizeValid}>
          Please select or enter your company size.
        </HelperText>
        <TextInput
          label="Founded In (optional)"
          value={foundedIn}
          onChangeText={setFoundedIn}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={4}
          left={<TextInput.Icon icon="calendar-outline" />}
          onBlur={() => setTouched(t => ({ ...t, foundedIn: true }))}
          error={!!foundedIn && !isFoundedInValid}
        />
        <HelperText type="error" visible={!!foundedIn && !isFoundedInValid}>
          Please enter a valid year (e.g., 2010).
        </HelperText>
        <TextInput
          label="Website URL (optional)"
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="web" />}
          onBlur={() => setTouched(t => ({ ...t, websiteUrl: true }))}
          error={!!websiteUrl && !isWebsiteUrlValid}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <HelperText type="error" visible={!!websiteUrl && !isWebsiteUrlValid}>
          Please enter a valid URL (should start with http:// or https://).
        </HelperText>
        <View style={styles.chipRowTitle}>
          <Text style={{ color: ACCENT, fontWeight: "bold" }}>Company Culture</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => setCultureDialog(true)} />
        </View>
        <View style={styles.chipRow}>
          {cultureTags.length === 0 && <Text style={{ color: "#aaa" }}>Add culture tags (eg. Innovative, Mission-driven)</Text>}
          {cultureTags.map(tag => (
            <Chip 
              key={tag}
              style={{ backgroundColor: "#fff3cd", marginRight: 6, marginBottom: 5 }}
              textStyle={{ color: GOLD }}
              onClose={() => toggleChip(cultureTags, setCultureTags, tag)}
            >{tag}</Chip>
          ))}
        </View>
        <View style={styles.chipRowTitle}>
          <Text style={{ color: GOLD, fontWeight: "bold" }}>Perks & Benefits</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => setPerksDialog(true)} />
        </View>
        <View style={styles.chipRow}>
          {perks.length === 0 && <Text style={{ color: "#aaa" }}>Add perks (eg. Remote Work, Health Insurance, Equity)</Text>}
          {perks.map(p => (
            <Chip 
              key={p}
              style={{ backgroundColor: "#ede7ff", marginRight: 6, marginBottom: 5 }}
              textStyle={{ color: ACCENT }}
              onClose={() => toggleChip(perks, setPerks, p)}
            >{p}</Chip>
          ))}
        </View>
        <View style={styles.toggleRow}>
          <Checkbox status={remoteFirst ? "checked" : "unchecked"} onPress={() => setRemoteFirst(r => !r)} />
          <Text style={styles.toggleLabel}>Remote First</Text>
          <Checkbox status={diversity ? "checked" : "unchecked"} onPress={() => setDiversity(d => !d)} />
          <Text style={styles.toggleLabel}>Diversity & Inclusion</Text>
          <Checkbox status={verified ? "checked" : "unchecked"} onPress={() => setVerified(v => !v)} />
          <Text style={styles.toggleLabel}>Verified by Metanoia</Text>
        </View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={!canContinue}
        >
          Next
        </Button>
        <View style={{ alignItems: 'center', marginTop: 15 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Sharing more about your company helps you attract the best talent!
          </Text>
        </View>
        <Portal>
          <Dialog visible={cultureDialog} onDismiss={() => setCultureDialog(false)}>
            <Dialog.Title>Pick Company Culture</Dialog.Title>
            <Dialog.Content>
              <View style={styles.chipDialog}>
                {CULTURE_TAGS.map(tag => (
                  <Chip
                    key={tag}
                    mode={cultureTags.includes(tag) ? "flat" : "outlined"}
                    selected={cultureTags.includes(tag)}
                    style={{
                      marginRight: 5, marginBottom: 7,
                      backgroundColor: cultureTags.includes(tag) ? "#fff3cd" : "#fff"
                    }}
                    textStyle={{
                      color: GOLD,
                      fontWeight: cultureTags.includes(tag) ? "bold" : "normal"
                    }}
                    onPress={() => toggleChip(cultureTags, setCultureTags, tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
              <Button onPress={() => setCultureDialog(false)} style={{ marginTop: 10 }}>
                Done
              </Button>
            </Dialog.Content>
          </Dialog>
          <Dialog visible={perksDialog} onDismiss={() => setPerksDialog(false)}>
            <Dialog.Title>Pick Company Perks</Dialog.Title>
            <Dialog.Content>
              <View style={styles.chipDialog}>
                {PERKS.map(p => (
                  <Chip
                    key={p}
                    mode={perks.includes(p) ? "flat" : "outlined"}
                    selected={perks.includes(p)}
                    style={{
                      marginRight: 5, marginBottom: 7,
                      backgroundColor: perks.includes(p) ? "#ede7ff" : "#fff"
                    }}
                    textStyle={{
                      color: ACCENT,
                      fontWeight: perks.includes(p) ? "bold" : "normal"
                    }}
                    onPress={() => toggleChip(perks, setPerks, p)}
                  >
                    {p}
                  </Chip>
                ))}
              </View>
              <Button onPress={() => setPerksDialog(false)} style={{ marginTop: 10 }}>
                Done
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
  button: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  sizeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
    marginTop: -4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    marginLeft: 2,
    minHeight: 28,
    alignItems: "center"
  },
  chipRowTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 1,
    marginLeft: 2
  },
  chipDialog: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 2,
    marginBottom: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    marginLeft: 4,
  },
  toggleLabel: {
    marginRight: 10,
    marginLeft: 2,
    fontWeight: "bold",
    color: ACCENT,
  }
});