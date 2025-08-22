import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  HelperText,
  Divider,
  IconButton,
  Portal,
  Dialog,
  Checkbox,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

type JobOpening = {
  jobTitle: string;
  description: string;
  experienceRequired: string;
  salaryRange?: string;
  jdPdfUrl?: string;
  location?: string;
  openingsCount?: string;
  applyLink?: string;
  skills?: string[];
  urgent?: boolean;
  highlight?: boolean;
};

function isValidPdfUrl(url: string) {
  if (!url) return true;
  return (
    /^https?:\/\/\S+\.pdf(\?.*)?$/i.test(url) ||
    /(drive\.google\.com|dropbox\.com)/i.test(url)
  );
}
function isValidUrl(url: string) {
  if (!url) return true;
  return /^https?:\/\/\S+\.\S+/.test(url);
}

const SUGGESTED_LOCATIONS = [
  "Remote", "Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "USA", "UK", "Europe"
];
const SUGGESTED_SKILLS = [
  "React", "Node.js", "Python", "Java", "SQL", "AWS", "Figma", "UI/UX", "TypeScript", "Kubernetes", "Sales", "Marketing", "Flutter", "Django", "Go", "C++"
];

export default function Step11({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const prev: Partial<JobOpening> = answers.jobOpenings && answers.jobOpenings[0] ? answers.jobOpenings[0] : {};
  const [jobTitle, setJobTitle] = useState(prev.jobTitle || "");
  const [description, setDescription] = useState(prev.description || "");
  const [experienceRequired, setExperienceRequired] = useState(prev.experienceRequired || "");
  const [salaryRange, setSalaryRange] = useState(prev.salaryRange || "");
  const [jdPdfUrl, setJdPdfUrl] = useState(prev.jdPdfUrl || "");
  const [location, setLocation] = useState(prev.location || "");
  const [openingsCount, setOpeningsCount] = useState(prev.openingsCount || "");
  const [applyLink, setApplyLink] = useState(prev.applyLink || "");
  const [skills, setSkills] = useState<string[]>(prev.skills || []);
  const [inputSkill, setInputSkill] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [urgent, setUrgent] = useState(prev.urgent ?? false);
  const [highlight, setHighlight] = useState(prev.highlight ?? false);

  const [touchedPdf, setTouchedPdf] = useState(false);
  const [touchedApply, setTouchedApply] = useState(false);

  const pdfValid = isValidPdfUrl(jdPdfUrl);
  const applyValid = isValidUrl(applyLink);

  const skillSuggestions = inputSkill
    ? SUGGESTED_SKILLS.filter(
        s => s.toLowerCase().includes(inputSkill.trim().toLowerCase()) && !skills.some(sk => sk.toLowerCase() === s.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleNext = () => {
    const jobOpening: JobOpening = {
      jobTitle,
      description,
      experienceRequired,
      salaryRange,
      jdPdfUrl,
      location,
      openingsCount,
      applyLink,
      skills,
      urgent,
      highlight,
    };
    setAnswer("jobOpenings", [jobOpening]);
    onNext && onNext();
  };

  const handleSkip = () => {
    setAnswer("jobOpenings", []);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Progress bar */}
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={0.99} color="#B88908" style={styles.progressBar} />
          <Text style={styles.progressLabel}>Step 11 of 11 – One last detail!</Text>
        </View>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Got an opening? Drop the deets. <Text style={{ color: "#B88908" }}>📄</Text>
          </Text>
        </Surface>
        <Text style={styles.label}>
          Share details for your open position. The more info, the better!
        </Text>
        <Divider style={{ marginVertical: 10 }} />
        <TextInput
          label="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. Senior Backend Engineer"
          left={<TextInput.Icon icon="briefcase-outline" />}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          style={styles.input}
          placeholder="Describe the role, responsibilities, and expectations"
          left={<TextInput.Icon icon="text" />}
          numberOfLines={4}
        />
        <TextInput
          label="Experience Required"
          value={experienceRequired}
          onChangeText={setExperienceRequired}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. 3+ years in Node.js, SQL"
          left={<TextInput.Icon icon="account-tie-outline" />}
        />
        <TextInput
          label="Salary Range (optional)"
          value={salaryRange}
          onChangeText={setSalaryRange}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. ₹10L–15L, $80k–$120k"
          left={<TextInput.Icon icon="currency-usd" />}
        />
        {/* Location */}
        <TextInput
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. Remote, Bangalore"
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        <View style={styles.suggestedRow}>
          {SUGGESTED_LOCATIONS.map(loc => (
            <Chip
              key={loc}
              style={[
                styles.suggestedChip,
                location.toLowerCase() === loc.toLowerCase() && styles.selectedChip,
              ]}
              selected={location.toLowerCase() === loc.toLowerCase()}
              onPress={() => setLocation(loc)}
              compact
            >
              {loc}
            </Chip>
          ))}
        </View>
        {/* Number of openings */}
        <TextInput
          label="Number of Openings (optional)"
          value={openingsCount}
          onChangeText={setOpeningsCount}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. 2"
          left={<TextInput.Icon icon="numeric" />}
          keyboardType="numeric"
          maxLength={3}
        />
        {/* Apply Link */}
        <TextInput
          label="External Apply Link (optional)"
          value={applyLink}
          onChangeText={text => {
            setApplyLink(text);
            setTouchedApply(true);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="https://company.jobs/apply"
          left={<TextInput.Icon icon="link-variant" />}
          right={
            applyLink && applyValid ? (
              <TextInput.Icon
                icon="open-in-new"
                onPress={() => Linking.openURL(applyLink)}
                forceTextInputFocus={false}
              />
            ) : undefined
          }
          error={touchedApply && !!applyLink && !applyValid}
          onBlur={() => setTouchedApply(true)}
        />
        <HelperText type="info" visible={!!applyLink}>
          Add an external application link if you want to redirect candidates.
        </HelperText>
        <HelperText type="error" visible={touchedApply && !!applyLink && !applyValid}>
          Please enter a valid URL (https://...).
        </HelperText>
        {/* Job skills */}
        <Text style={styles.skillLabel}>Skills (optional):</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={inputSkill}
            onChangeText={text => {
              setInputSkill(text);
              setShowSkillSuggestions(!!text);
            }}
            onSubmitEditing={() => {
              const skill = inputSkill.trim();
              if (skill && !skills.some(s => s.toLowerCase() === skill.toLowerCase()) && skill.length <= 24) {
                setSkills([...skills, skill]);
                setInputSkill("");
              }
            }}
            mode="outlined"
            style={[styles.input, { flex: 1, marginRight: 4 }]}
            placeholder="e.g. React, SQL"
            left={<TextInput.Icon icon="star" />}
            maxLength={24}
            onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 100)}
          />
          <Button
            icon="plus"
            mode="outlined"
            onPress={() => {
              const skill = inputSkill.trim();
              if (skill && !skills.some(s => s.toLowerCase() === skill.toLowerCase()) && skill.length <= 24) {
                setSkills([...skills, skill]);
                setInputSkill("");
              }
            }}
            disabled={!inputSkill.trim()}
          >
            Add
          </Button>
        </View>
        {showSkillSuggestions && skillSuggestions.length > 0 && (
          <Surface style={styles.skillSuggestionDropdown}>
            {skillSuggestions.map(s => (
              <Chip
                key={s}
                onPress={() => {
                  setSkills([...skills, s]);
                  setInputSkill("");
                  setShowSkillSuggestions(false);
                }}
                style={styles.suggestedChip}
                compact
              >
                {s}
              </Chip>
            ))}
          </Surface>
        )}
        <View style={styles.chipRow}>
          {skills.map(s =>
            <Chip
              key={s}
              style={styles.skillChip}
              onClose={() => setSkills(skills.filter(k => k !== s))}
              closeIcon="close"
            >
              {s}
            </Chip>
          )}
        </View>
        {/* Urgent and highlight */}
        <View style={styles.row}>
          <Checkbox
            status={urgent ? "checked" : "unchecked"}
            onPress={() => setUrgent(u => !u)}
            color="#B88908"
          />
          <Text style={styles.checkboxLabel}>Mark as urgent opening</Text>
        </View>
        <View style={styles.row}>
          <Checkbox
            status={highlight ? "checked" : "unchecked"}
            onPress={() => setHighlight(h => !h)}
            color="#6c47ff"
          />
          <Text style={styles.checkboxLabel}>Highlight this opening (more visible to candidates)</Text>
        </View>
        {/* JD PDF */}
        <TextInput
          label="Upload JD PDF (URL, optional)"
          value={jdPdfUrl}
          onChangeText={text => {
            setJdPdfUrl(text);
            setTouchedPdf(true);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="https://.../your-job-description.pdf"
          left={<TextInput.Icon icon="file-pdf-box" />}
          right={
            jdPdfUrl && pdfValid ? (
              <TextInput.Icon
                icon="open-in-new"
                onPress={() => Linking.openURL(jdPdfUrl)}
                forceTextInputFocus={false}
              />
            ) : undefined
          }
          error={touchedPdf && !pdfValid}
          onBlur={() => setTouchedPdf(true)}
        />
        <HelperText type="info" visible={!!jdPdfUrl}>
          Accepts direct PDF links or Google Drive/Dropbox URLs.
        </HelperText>
        <HelperText type="error" visible={touchedPdf && !pdfValid}>
          Please enter a valid PDF or drive link.
        </HelperText>
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNext}
          disabled={
            !jobTitle.trim() ||
            !description.trim() ||
            !experienceRequired.trim() ||
            (!!jdPdfUrl && !pdfValid) ||
            (!!applyLink && !applyValid)
          }
        >
          Next
        </Button>
        <Button
          style={styles.skipBtn}
          onPress={handleSkip}
        >
          Skip this, I’ll add later
        </Button>
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
            Uploading a job description PDF helps candidates get all the info they need!
          </Text>
          <Text style={styles.tipTitle}>Tips:</Text>
          <Text style={styles.tip}>• Use a clear, descriptive job title</Text>
          <Text style={styles.tip}>• Highlight must-have skills and responsibilities</Text>
          <Text style={styles.tip}>• Attach a PDF for a detailed JD if available</Text>
          <Text style={styles.tip}>• Add location, skills, and urgency to reach right talent faster</Text>
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
  skillLabel: {
    fontWeight: "bold",
    marginTop: 6,
    color: "#6c47ff",
    marginBottom: 2,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 2,
  },
  skillChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f6f4ff",
    borderColor: "#ece3ff",
    borderWidth: 1,
  },
  suggestedRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
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
  skillSuggestionDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 2,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    maxHeight: 120,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 6,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#B88908',
    borderRadius: 16,
    paddingVertical: 5,
  },
  skipBtn: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: '#f6f4ff',
    color: '#232323',
  },
  tipTitle: {
    marginTop: 18,
    fontWeight: '700',
    color: "#B88908",
    fontSize: 14,
  },
  tip: {
    color: "#6c47ff",
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#6c47ff",
    fontWeight: "bold",
    marginLeft: 2,
  },
});