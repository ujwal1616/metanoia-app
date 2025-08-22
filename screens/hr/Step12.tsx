import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Chip,
  HelperText,
  Divider,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

function isValidUrl(url: string) {
  if (!url) return true;
  return /^https?:\/\/\S+\.\S+/.test(url);
}
function isLinkedinUrl(url: string) {
  if (!url) return true;
  return /^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(url);
}

const SUGGESTED_LINKS = [
  { name: "Glassdoor", icon: "star-outline", url: "https://www.glassdoor.com/" },
  { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/" },
  { name: "Twitter/X", icon: "twitter", url: "https://twitter.com/" },
  { name: "YouTube", icon: "youtube", url: "https://youtube.com/" },
  { name: "GitHub", icon: "github", url: "https://github.com/" },
  { name: "AngelList", icon: "briefcase-outline", url: "https://angel.co/" },
];

export default function Step12({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [linkedinUrl, setLinkedinUrl] = useState(answers.linkedinUrl || "");
  const [careersPageUrl, setCareersPageUrl] = useState(answers.careersPageUrl || "");
  const [otherLinks, setOtherLinks] = useState(answers.otherLinks || []);
  const [inputOther, setInputOther] = useState("");
  const [touched, setTouched] = useState<{linkedin?: boolean; careers?: boolean; other?: boolean}>({});
  const [aboutBlurb, setAboutBlurb] = useState(answers.aboutBlurb || "");
  const [featuredLink, setFeaturedLink] = useState(answers.featuredLink || "");
  const [linksTipsDismissed, setLinksTipsDismissed] = useState(answers.linksTipsDismissed ?? false);
  const [showMore, setShowMore] = useState(false);

  // Validation
  const linkedinValid = isLinkedinUrl(linkedinUrl);
  const careersValid = isValidUrl(careersPageUrl);
  const inputOtherValid = isValidUrl(inputOther);

  const addOther = (val?: string) => {
    const value = (val ?? inputOther).trim();
    if (value && !otherLinks.includes(value) && isValidUrl(value)) {
      setOtherLinks([...otherLinks, value]);
      setInputOther("");
      setTouched(t => ({...t, other: false}));
    } else {
      setTouched(t => ({...t, other: true}));
    }
  };
  const removeOther = (link: string) => setOtherLinks(otherLinks.filter((l) => l !== link));

  // Progress bar simulate step 12/12
  const progressPercent = 1.0;

  const handleNextStep = () => {
    setAnswer("linkedinUrl", linkedinUrl);
    setAnswer("careersPageUrl", careersPageUrl);
    setAnswer("otherLinks", otherLinks);
    setAnswer("aboutBlurb", aboutBlurb.trim());
    setAnswer("featuredLink", featuredLink);
    setAnswer("linksTipsDismissed", linksTipsDismissed);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={progressPercent} color="#B88908" style={styles.progressBar} />
          <Text style={styles.progressLabel}>Step 12 of 12 – Last step!</Text>
        </View>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Want to show off your LinkedIn flex? <Text style={{ color: "#B88908" }}>🔗</Text>
          </Text>
        </Surface>
        <Text style={styles.label}>
          Add your company's LinkedIn, careers page, or any other links you'd like to share with candidates.
        </Text>
        <Divider style={{ marginVertical: 10 }} />

        {/* SUGGESTED LINKS */}
        <View style={styles.suggestedRow}>
          {SUGGESTED_LINKS.map(l => (
            <Chip
              key={l.url}
              icon={l.icon}
              style={styles.suggestedChip}
              onPress={() => setInputOther(l.url)}
              compact
            >
              {l.name}
            </Chip>
          ))}
        </View>

        {/* LinkedIn */}
        <TextInput
          label="LinkedIn"
          value={linkedinUrl}
          onChangeText={text => {
            setLinkedinUrl(text);
            setTouched(t => ({...t, linkedin: true}));
          }}
          mode="outlined"
          style={styles.input}
          placeholder="https://linkedin.com/company/yourpage"
          left={<TextInput.Icon icon="linkedin" />}
          right={linkedinUrl && linkedinValid ? (
            <TextInput.Icon icon="open-in-new" onPress={() => Linking.openURL(linkedinUrl)} forceTextInputFocus={false} />
          ) : undefined}
          error={touched.linkedin && !!linkedinUrl && !linkedinValid}
          onBlur={() => setTouched(t => ({...t, linkedin: true}))}
        />
        <HelperText type="info" visible={!!linkedinUrl && linkedinValid}>
          e.g. https://linkedin.com/company/yourpage
        </HelperText>
        <HelperText type="error" visible={touched.linkedin && !!linkedinUrl && !linkedinValid}>
          Please enter a valid LinkedIn company URL.
        </HelperText>

        {/* Careers page */}
        <TextInput
          label="Company Careers Page"
          value={careersPageUrl}
          onChangeText={text => {
            setCareersPageUrl(text);
            setTouched(t => ({...t, careers: true}));
          }}
          mode="outlined"
          style={styles.input}
          placeholder="https://yourcompany.com/careers"
          left={<TextInput.Icon icon="briefcase-outline" />}
          right={careersPageUrl && careersValid ? (
            <TextInput.Icon icon="open-in-new" onPress={() => Linking.openURL(careersPageUrl)} forceTextInputFocus={false} />
          ) : undefined}
          error={touched.careers && !!careersPageUrl && !careersValid}
          onBlur={() => setTouched(t => ({...t, careers: true}))}
        />
        <HelperText type="info" visible={!!careersPageUrl && careersValid}>
          e.g. https://yourcompany.com/careers
        </HelperText>
        <HelperText type="error" visible={touched.careers && !!careersPageUrl && !careersValid}>
          Please enter a valid URL.
        </HelperText>

        {/* Other Links (Portfolio, Insta, etc.) */}
        <TextInput
          label="Other Links (Portfolio, Insta, Glassdoor...)"
          value={inputOther}
          onChangeText={text => {
            setInputOther(text);
            setTouched(t => ({...t, other: false}));
          }}
          mode="outlined"
          style={styles.input}
          placeholder="https://portfolio.com/yourbrand"
          left={<TextInput.Icon icon="web" />}
          onSubmitEditing={() => addOther()}
          error={touched.other && !!inputOther && !inputOtherValid}
          onBlur={() => setTouched(t => ({...t, other: true}))}
        />
        <HelperText type="info" visible={!!inputOther && inputOtherValid}>
          Share your website, portfolio, Instagram, Glassdoor, etc.
        </HelperText>
        <HelperText type="error" visible={touched.other && !!inputOther && !inputOtherValid}>
          Please enter a valid URL.
        </HelperText>
        <Button
          onPress={() => addOther()}
          disabled={!inputOther.trim() || !inputOtherValid || otherLinks.includes(inputOther.trim())}
          icon="plus"
          style={styles.addBtn}
        >
          Add Link
        </Button>
        <Text style={styles.selectedLabel}>Added Links:</Text>
        <View style={styles.selectedRow}>
          {otherLinks.map(link => (
            <Chip
              key={link}
              style={[
                styles.selectedChip,
                featuredLink === link && styles.featuredChip
              ]}
              onClose={() => removeOther(link)}
              mode="outlined"
              closeIcon="close"
              onPress={() => Linking.openURL(link)}
              selected={featuredLink === link}
              onLongPress={() => setFeaturedLink(link)}
            >
              {link.length > 36 ? link.slice(0,33) + "..." : link}
              {featuredLink === link && (
                <Text style={{color:"#B88908", fontWeight:"bold"}}> ★</Text>
              )}
            </Chip>
          ))}
        </View>
        {/* Show More Options */}
        <Button
          mode="text"
          style={styles.moreBtn}
          onPress={() => setShowMore(m => !m)}
          icon={showMore ? "chevron-up" : "chevron-down"}
        >
          {showMore ? "Hide more options" : "More options"}
        </Button>
        {showMore && (
          <>
            <TextInput
              label="About/Blurb (optional)"
              value={aboutBlurb}
              onChangeText={setAboutBlurb}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. We’re a fast-growing, remote-first company passionate about impact."
              maxLength={150}
              multiline
            />
            <HelperText type="info" visible={aboutBlurb.length > 0}>
              {aboutBlurb.length}/150 characters
            </HelperText>
            <Text style={styles.featureLabel}>
              Long-press a link above to feature it on your public profile.
            </Text>
          </>
        )}

        {/* Tips, can be dismissed */}
        {!linksTipsDismissed && (
          <Surface style={styles.tipsSurface}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.tipTitle}>Tips for sharing links:</Text>
              <IconButton icon="close" size={18} onPress={() => setLinksTipsDismissed(true)} />
            </View>
            <Text style={styles.tip}>• LinkedIn and Glassdoor boost trust</Text>
            <Text style={styles.tip}>• Showcase your company’s culture on Instagram or YouTube</Text>
            <Text style={styles.tip}>• Feature your best link for extra visibility</Text>
          </Surface>
        )}
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={
            (!!linkedinUrl && !linkedinValid) ||
            (!!careersPageUrl && !careersValid) ||
            (!linkedinUrl && !careersPageUrl && otherLinks.length === 0)
          }
        >
          Finish & Unlock Swiping
        </Button>
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
            Adding links builds trust and lets candidates explore your company culture!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FAF9F6" },
  progressBarWrapper: { marginBottom: 12 },
  progressBar: { height: 8, borderRadius: 9, backgroundColor: "#efece7" },
  progressLabel: { fontSize: 12, color: "#B88908", marginTop: 1, marginLeft: 2, fontWeight: "bold" },
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
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  addBtn: { alignSelf: 'flex-end', marginVertical: 6 },
  selectedLabel: { marginTop: 10, fontWeight: '600', color: "#B88908" },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  suggestedRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
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
    marginRight: 6,
    marginBottom: 6,
  },
  featuredChip: {
    borderColor: "#18a957",
    borderWidth: 2,
    backgroundColor: "#e2ffe6",
  },
  moreBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 14,
    fontWeight: "bold"
  },
  button: {
    marginTop: 20,
    backgroundColor: '#B88908',
    borderRadius: 16,
    paddingVertical: 5,
  },
  tipsSurface: {
    backgroundColor: "#f6f4ff",
    borderRadius: 10,
    padding: 10,
    marginTop: 18,
    marginBottom: 4,
    elevation: 1,
  },
  tipTitle: {
    marginTop: 3,
    fontWeight: '700',
    color: "#B88908",
    fontSize: 14,
  },
  tip: {
    color: "#6c47ff",
    fontSize: 13,
    marginTop: 2,
  },
  featureLabel: {
    color: "#18a957",
    fontStyle: "italic",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 2,
  },
});