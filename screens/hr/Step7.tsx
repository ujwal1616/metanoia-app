import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { TextInput, Button, Text, Chip, Surface, HelperText, IconButton, Portal, Dialog } from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const ACCENT = "#6c47ff";
const CARD_BG = "#FFF9EC";
const OFF_WHITE = "#f6f4ff";
const DARK_TEXT = "#232323";

const ALL_ROLES = [
  // ...same as your list (omitted for brevity)
  "Account Executive", "Account Manager", "Accountant", "Actuary", "Administrative Assistant", "Advisor",
  "Android Developer", "Animator", "Application Support Analyst", "Architect", "Art Director", "Artist",
  "Backend Developer", "Banker", "Benefits Specialist", "Blockchain Engineer", "Brand Manager",
  "Business Analyst", "Business Development Manager", "CFO", "CHRO", "CMO", "COO", "CTO", "CEO",
  "Content Strategist", "Consultant", "Copywriter", "Creative Director", "CRM Manager", "Customer Success Manager",
  "Data Analyst", "Data Engineer", "Data Scientist", "Database Administrator", "Delivery Manager",
  "Designer", "DevOps Engineer", "Digital Marketer", "Director of Engineering", "Editor", "Electrical Engineer",
  "Embedded Systems Engineer", "Event Manager", "Executive Assistant", "Facilities Manager",
  "Finance Analyst", "Finance Manager", "Financial Advisor", "Frontend Developer", "Full Stack Developer",
  "Game Designer", "Game Developer", "General Manager", "Graphic Designer", "Growth Marketer",
  "Head of HR", "Head of Marketing", "Head of Operations", "Help Desk Technician", "HR Manager",
  "Illustrator", "Industrial Designer", "Infrastructure Engineer", "iOS Developer", "IT Manager",
  "Java Developer", "Junior Developer", "Lawyer", "Lead Engineer", "Legal Counsel", "Machine Learning Engineer",
  "Maintenance Engineer", "Manager", "Manufacturing Engineer", "Marketing Analyst", "Marketing Manager",
  "Mechanical Engineer", "Mobile Developer", "Motion Designer", "Network Administrator", "Office Manager",
  "Operations Analyst", "Operations Manager", "Payroll Specialist", "PR Manager", "Product Designer",
  "Product Manager", "Product Owner", "Production Manager", "Project Coordinator", "Project Manager",
  "QA Engineer", "Quality Assurance Manager", "Recruiter", "Research Analyst", "Research Scientist",
  "Risk Analyst", "Robotics Engineer", "Sales Associate", "Sales Director", "Sales Engineer", "Sales Manager",
  "Scrum Master", "Security Analyst", "SEO Specialist", "Service Designer", "Social Media Manager",
  "Software Architect", "Software Developer", "Software Engineer", "Solutions Architect", "Strategy Analyst",
  "Supply Chain Manager", "Support Engineer", "Systems Administrator", "Talent Acquisition Specialist",
  "Teacher", "Technical Lead", "Technical Recruiter", "Technical Writer", "Test Engineer", "UI Designer",
  "UI/UX Designer", "UX Designer", "UX Researcher", "Venture Partner", "Video Editor", "Virtual Assistant",
  "VP of Engineering", "VP of Marketing", "Web Designer", "Web Developer", "Writer"
];

const ROLE_FILTERS = [
  { label: "Tech", roles: ["Backend Developer", "Frontend Developer", "Full Stack Developer", "DevOps Engineer", "Software Engineer", "Data Scientist", "Machine Learning Engineer", "QA Engineer", "Product Manager"] },
  { label: "Design", roles: ["UI Designer", "UX Designer", "Product Designer", "Graphic Designer", "Motion Designer", "Animator", "Artist"] },
  { label: "Business", roles: ["Business Analyst", "Business Development Manager", "Account Manager", "Sales Manager", "Marketing Manager", "Finance Analyst"] },
  { label: "Leadership", roles: ["CEO", "CTO", "COO", "CFO", "CMO", "Head of HR", "VP of Engineering", "VP of Marketing"] }
];

const JOB_TYPES = [
  { value: 'fullTime', label: 'Full-time' },
  { value: 'partTime', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }
];

export default function Step7({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [rolesHiringFor, setRolesHiringFor] = useState<string[]>(answers.rolesHiringFor || []);
  const [inputRole, setInputRole] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touched, setTouched] = useState(false);

  const [priorityRoles, setPriorityRoles] = useState<string[]>(answers.priorityRoles || []);
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(answers.mustHaveSkills || []);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(answers.niceToHaveSkills || []);
  const [skillsDialog, setSkillsDialog] = useState<'must'|'nice'|null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [allowRemote, setAllowRemote] = useState(answers.allowRemote ?? false);
  const [allowRelocation, setAllowRelocation] = useState(answers.allowRelocation ?? false);
  const [diversityHiring, setDiversityHiring] = useState(answers.diversityHiring ?? false);
  const [fresherFriendly, setFresherFriendly] = useState(answers.fresherFriendly ?? false);
  const [minExperience, setMinExperience] = useState(answers.minExperience || "");
  const [maxExperience, setMaxExperience] = useState(answers.maxExperience || "");
  const [jobType, setJobType] = useState(answers.jobType || "");
  const [contractLength, setContractLength] = useState(answers.contractLength || "");

  const getSuggestions = (input: string) => {
    if (!input) return [];
    const lower = input.trim().toLowerCase();
    const startsWith = ALL_ROLES.filter(
      role =>
        role.toLowerCase().startsWith(lower) &&
        !rolesHiringFor.some(r => r.toLowerCase() === role.toLowerCase())
    );
    const contains = ALL_ROLES.filter(
      role =>
        role.toLowerCase().includes(lower) &&
        !role.toLowerCase().startsWith(lower) &&
        !rolesHiringFor.some(r => r.toLowerCase() === role.toLowerCase())
    );
    return [...startsWith, ...contains].slice(0, 10);
  };

  const suggestions = inputRole ? getSuggestions(inputRole) : [];

  const addRole = (roleToAdd?: string) => {
    const role = (roleToAdd ?? inputRole).trim();
    if (
      role &&
      !rolesHiringFor.some(r => r.toLowerCase() === role.toLowerCase()) &&
      role.length < 40
    ) {
      setRolesHiringFor([...rolesHiringFor, role]);
      setInputRole("");
      setShowSuggestions(false);
      setTouched(false);
    } else if (role.length >= 40) {
      setTouched(true);
    }
  };

  const removeRole = (role: string) =>
    setRolesHiringFor(rolesHiringFor.filter((r) => r !== role));

  const togglePriorityRole = (role: string) => {
    if (priorityRoles.includes(role)) {
      setPriorityRoles(priorityRoles.filter(r => r !== role));
    } else if (priorityRoles.length < 3) {
      setPriorityRoles([...priorityRoles, role]);
    }
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (skillsDialog === 'must' && !mustHaveSkills.includes(val)) {
      setMustHaveSkills([...mustHaveSkills, val]);
    }
    if (skillsDialog === 'nice' && !niceToHaveSkills.includes(val)) {
      setNiceToHaveSkills([...niceToHaveSkills, val]);
    }
    setSkillInput("");
  };
  const removeSkill = (skill: string, type: 'must'|'nice') => {
    if (type === 'must') setMustHaveSkills(mustHaveSkills.filter(s => s !== skill));
    else setNiceToHaveSkills(niceToHaveSkills.filter(s => s !== skill));
  };

  const addRoleFilter = (role: string) => {
    if (!rolesHiringFor.includes(role)) {
      setRolesHiringFor([...rolesHiringFor, role]);
    }
  };

  const handleNextStep = () => {
    setAnswer("rolesHiringFor", rolesHiringFor);
    setAnswer("priorityRoles", priorityRoles);
    setAnswer("mustHaveSkills", mustHaveSkills);
    setAnswer("niceToHaveSkills", niceToHaveSkills);
    setAnswer("allowRemote", allowRemote);
    setAnswer("allowRelocation", allowRelocation);
    setAnswer("diversityHiring", diversityHiring);
    setAnswer("fresherFriendly", fresherFriendly);
    setAnswer("minExperience", minExperience.trim());
    setAnswer("maxExperience", maxExperience.trim());
    setAnswer("jobType", jobType);
    setAnswer("contractLength", contractLength.trim());
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
            Who are you looking for?<Text style={{ color: GOLD }}> 👀</Text>
          </Text>
        </Surface>
        <Text style={styles.label}>
          Start typing a role (like LinkedIn) and select from suggestions or add your custom role.
        </Text>
        {/* Quick role filter chips */}
        <View style={styles.filterRow}>
          {ROLE_FILTERS.map(group => (
            <View key={group.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
              <Text style={styles.filterLabel}>{group.label}:</Text>
              {group.roles.map(role => (
                <Chip
                  key={role}
                  onPress={() => addRoleFilter(role)}
                  style={rolesHiringFor.includes(role) ? styles.chipActive : styles.chip}
                  textStyle={{ color: rolesHiringFor.includes(role) ? '#fff' : ACCENT, fontWeight: "bold" }}
                  compact
                >
                  {role}
                </Chip>
              ))}
            </View>
          ))}
        </View>
        <View>
          <TextInput
            label="Add a role"
            value={inputRole}
            onChangeText={text => {
              setInputRole(text);
              setShowSuggestions(!!text);
              setTouched(false);
            }}
            onSubmitEditing={() => addRole()}
            mode="outlined"
            style={styles.input}
            maxLength={40}
            left={<TextInput.Icon icon="account-plus-outline" />}
            returnKeyType="done"
            placeholder="e.g. Business Analyst, Consultant"
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            error={touched && inputRole.length > 39}
          />
          {/* Suggestion Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={suggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => addRole(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
        </View>
        <HelperText type="info" visible={inputRole.length > 0}>
          {inputRole.length}/40 characters
        </HelperText>
        <HelperText type="error" visible={touched && inputRole.length > 39}>
          Role name must be less than 40 characters.
        </HelperText>
        <Button
          onPress={() => addRole()}
          disabled={!inputRole.trim() || inputRole.length > 39}
          style={styles.addBtn}
          icon="plus"
        >
          Add Role
        </Button>
        {rolesHiringFor.length > 0 && (
          <>
            <Text style={styles.selectedLabel}>Roles you will be hiring for:</Text>
            <View style={styles.selectedRow}>
              {rolesHiringFor.map((role) => (
                <Chip
                  key={role}
                  style={styles.selectedChip}
                  onClose={() => removeRole(role)}
                  mode="outlined"
                  closeIcon="close"
                  selected={priorityRoles.includes(role)}
                  onPress={() => togglePriorityRole(role)}
                  textStyle={{ fontWeight: priorityRoles.includes(role) ? "bold" : "normal", color: priorityRoles.includes(role) ? "#fff" : DARK_TEXT }}
                  selectedColor="#fff"
                >
                  {role}
                  {priorityRoles.includes(role) ? " ★" : ""}
                </Chip>
              ))}
            </View>
            {priorityRoles.length > 0 && (
              <Text style={styles.priorityHint}>
                Tap a chip to mark/unmark as a priority role (max 3).
              </Text>
            )}
          </>
        )}
        {/* Must-have/nice-to-have skills */}
        <View style={styles.skillsSection}>
          <Text style={styles.skillsLabel}>Must-have Skills</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => {setSkillsDialog('must'); setSkillInput("");}} />
          <View style={styles.skillsRow}>
            {mustHaveSkills.map(skill => (
              <Chip key={skill} style={styles.mustChip} onClose={() => removeSkill(skill, 'must')} closeIcon="close">
                {skill}
              </Chip>
            ))}
          </View>
          <Text style={styles.skillsLabel}>Nice-to-have Skills</Text>
          <IconButton icon="plus-circle-outline" size={18} onPress={() => {setSkillsDialog('nice'); setSkillInput("");}} />
          <View style={styles.skillsRow}>
            {niceToHaveSkills.map(skill => (
              <Chip key={skill} style={styles.niceChip} onClose={() => removeSkill(skill, 'nice')} closeIcon="close">
                {skill}
              </Chip>
            ))}
          </View>
        </View>
        {/* Job type/contract/experience/fresher-friendly UI */}
        <View style={styles.jobOptionsSection}>
          <Text style={styles.jobOptionsLabel}>Job Type</Text>
          <View style={styles.typeRow}>
            {JOB_TYPES.map(jt => (
              <Chip
                key={jt.value}
                selected={jobType === jt.value}
                style={jobType === jt.value ? styles.chipActive : styles.chip}
                onPress={() => setJobType(jt.value)}
                textStyle={{ color: jobType === jt.value ? "#fff" : ACCENT, fontWeight: "bold" }}
                compact
              >
                {jt.label}
              </Chip>
            ))}
          </View>
          {jobType === "contract" && (
            <TextInput
              label="Contract Length"
              value={contractLength}
              onChangeText={setContractLength}
              placeholder="e.g. 6 months, 1 year"
              style={styles.input}
              left={<TextInput.Icon icon="calendar-clock" />}
              maxLength={24}
              mode="outlined"
            />
          )}
        </View>
        <View style={styles.expRow}>
          <TextInput
            label="Min Exp (years)"
            value={minExperience}
            onChangeText={setMinExperience}
            mode="outlined"
            style={styles.expInput}
            keyboardType="numeric"
            maxLength={2}
            left={<TextInput.Icon icon="numeric-1-box-outline" />}
            placeholder="e.g. 0"
          />
          <TextInput
            label="Max Exp (years)"
            value={maxExperience}
            onChangeText={setMaxExperience}
            mode="outlined"
            style={styles.expInput}
            keyboardType="numeric"
            maxLength={2}
            left={<TextInput.Icon icon="numeric-9-plus-box-outline" />}
            placeholder="e.g. 2"
          />
          <Chip
            selected={fresherFriendly}
            style={fresherFriendly ? styles.chipActive : styles.chip}
            textStyle={{ color: fresherFriendly ? "#fff" : GOLD, fontWeight: "bold" }}
            onPress={() => setFresherFriendly(f => !f)}
            icon="school-outline"
            compact
          >
            Open to Freshers
          </Chip>
        </View>
        {/* Remote/relocation/diversity options */}
        <View style={styles.advRow}>
          <Chip 
            selected={allowRemote}
            style={allowRemote ? styles.chipActive : styles.chip}
            textStyle={{ color: allowRemote ? '#fff' : ACCENT, fontWeight: "bold" }}
            onPress={() => setAllowRemote(a => !a)}
            icon="home-modern"
            compact
          >
            Open to Remote
          </Chip>
          <Chip 
            selected={allowRelocation}
            style={allowRelocation ? styles.chipActive : styles.chip}
            textStyle={{ color: allowRelocation ? '#fff' : ACCENT, fontWeight: "bold" }}
            onPress={() => setAllowRelocation(r => !r)}
            icon="airplane"
            compact
          >
            Relocation OK
          </Chip>
          <Chip 
            selected={diversityHiring}
            style={diversityHiring ? styles.chipActive : styles.chip}
            textStyle={{ color: diversityHiring ? '#fff' : ACCENT, fontWeight: "bold" }}
            onPress={() => setDiversityHiring(r => !r)}
            icon="account-multiple"
            compact
          >
            Diversity Hiring
          </Chip>
        </View>
        <Button
          mode="contained"
          style={styles.nextBtn}
          onPress={handleNextStep}
          disabled={rolesHiringFor.length === 0}
        >
          Next
        </Button>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Add any title you need — just like LinkedIn. This helps us recommend better candidates.
          </Text>
        </View>
        {/* Skill dialog */}
        <Portal>
          <Dialog visible={!!skillsDialog} onDismiss={() => setSkillsDialog(null)}>
            <Dialog.Title>{skillsDialog === "must" ? "Add Must-have Skill" : "Add Nice-to-have Skill"}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Skill"
                value={skillInput}
                onChangeText={setSkillInput}
                mode="outlined"
                maxLength={32}
                placeholder="e.g. React, Figma, SQL"
                onSubmitEditing={addSkill}
                style={{ marginBottom: 8 }}
                left={<TextInput.Icon icon="star-outline" />}
                autoCapitalize="words"
              />
              <Button mode="contained" onPress={addSkill} disabled={!skillInput.trim()}>
                Add
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: OFF_WHITE },
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
  label: { marginBottom: 8, color: DARK_TEXT, fontWeight: '600', fontSize: 15 },
  input: { marginBottom: 2, backgroundColor: '#fff' },
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
    maxHeight: 220,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e7e7e7",
  },
  suggestionText: {
    fontSize: 16,
    color: DARK_TEXT,
  },
  addBtn: { alignSelf: 'flex-end', marginVertical: 6 },
  filterRow: { flexDirection: 'column', flexWrap: 'wrap', marginBottom: 8 },
  filterLabel: { color: ACCENT, fontWeight: "bold", marginRight: 2, fontSize: 13, marginBottom: 2 },
  chip: {
    borderColor: ACCENT,
    margin: 2,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    paddingHorizontal: 6,
    minHeight: 28,
    minWidth: 0,
  },
  chipActive: {
    borderColor: GOLD,
    margin: 2,
    borderRadius: 18,
    backgroundColor: GOLD,
    minHeight: 28,
    minWidth: 0,
    paddingHorizontal: 6,
  },
  selectedLabel: { marginTop: 10, fontWeight: '600', color: GOLD },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  selectedChip: { 
    marginRight: 7, marginBottom: 7, backgroundColor: "#fff",
    borderWidth: 2, borderColor: "#ece3ff", 
  },
  priorityHint: {
    fontSize: 13,
    color: GOLD,
    marginTop: 2,
    marginBottom: 6,
    marginLeft: 2,
    fontStyle: "italic"
  },
  nextBtn: {
    marginTop: 20,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  skillsSection: {
    marginTop: 20,
    marginBottom: 8,
    padding: 6,
    backgroundColor: OFF_WHITE,
    borderRadius: 10,
  },
  skillsLabel: {
    fontWeight: "bold",
    color: ACCENT,
    fontSize: 14,
    marginTop: 2,
    marginBottom: 0,
    marginLeft: 4,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 2,
    minHeight: 28,
  },
  mustChip: {
    backgroundColor: "#ffe7e7",
    marginRight: 6,
    marginBottom: 5
  },
  niceChip: {
    backgroundColor: "#f7f7ff",
    marginRight: 6,
    marginBottom: 5
  },
  jobOptionsSection: {
    marginTop: 16,
    marginBottom: 6,
  },
  jobOptionsLabel: {
    color: GOLD,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 3
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
    marginLeft: 0,
    minHeight: 28,
  },
  expRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginLeft: 2,
    justifyContent: "flex-start",
    gap: 6,
  },
  expInput: {
    width: 90,
    marginRight: 8,
    backgroundColor: "#fff"
  },
  advRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 4,
    alignItems: "center"
  }
});