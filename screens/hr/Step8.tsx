import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

// -- Suggestions Lists --
const HARD_SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "Java", "C++", "SQL", "React", "Node.js", "AWS",
  "Machine Learning", "Data Analysis", "UI Design", "Cybersecurity",
  "Financial Modeling", "Copywriting", "Project Management",
  "Go", "Rust", "Power BI", "Tableau", "Excel (Advanced)", "Alteryx", "SAS", "SPSS", "Matlab", "RStudio", "IBM Cognos",
  "Google Data Studio", "Apache Superset", "QlikView", "Qlik Sense", "Domo", "Looker", "Talend", "Informatica",
  "Apache NiFi", "Microsoft SSIS", "Pentaho", "Unreal Engine", "Unity", "AutoCAD", "Blender", "Figma",
  "Sketch", "Rhino 3D", "Salesforce", "SAP", "SolidWorks", "ArcGIS", "Ansys", "IBM SPSS Modeler",
  "IBM Watson Studio", "Snowflake", "MongoDB", "Oracle Database", "SQL Server", "Amazon Redshift",
  "Apache Spark", "Hadoop", "DBeaver", "MongoDB Compass", "Visual Studio", "IntelliJ IDEA", "Eclipse",
  "PyCharm", "Android Studio", "Xcode", "Wireshark", "Metasploit", "Nessus", "Cisco Packet Tracer", "Kali Linux"
];
const SOFT_SKILL_SUGGESTIONS = [
  "Communication", "Problem Solving", "Leadership", "Teamwork",
  "Time Management", "Adaptability", "Creativity", "Critical Thinking",
  "Empathy", "Attention to Detail", "Work Ethic"
];
const TOOLS_SUGGESTIONS = [
  "Power BI", "Tableau", "Unreal Engine", "Excel (Advanced)", "Alteryx", "SAS", "SPSS", "Matlab",
  "RStudio", "IBM Cognos", "Google Data Studio", "Apache Superset", "QlikView", "Qlik Sense", "Domo",
  "Looker", "Talend", "Informatica", "Apache NiFi", "Microsoft SSIS", "Pentaho",
  "Unity", "AutoCAD", "Blender", "Figma", "Sketch", "Rhino 3D", "Salesforce", "SAP", "SolidWorks",
  "ArcGIS", "Ansys", "IBM SPSS Modeler", "IBM Watson Studio", "Snowflake", "MongoDB", "Oracle Database",
  "SQL Server", "Amazon Redshift", "Apache Spark", "Hadoop", "DBeaver", "MongoDB Compass",
  "Visual Studio", "IntelliJ IDEA", "Eclipse", "PyCharm", "Android Studio", "Xcode",
  "Wireshark", "Metasploit", "Nessus", "Cisco Packet Tracer", "Kali Linux",
  "GitHub", "JIRA", "Confluence", "Slack", "Trello", "Asana", "Notion", "Zoom", "Google Analytics", "Photoshop"
];
const CERTIFICATIONS_SUGGESTIONS = [
  "AWS Certified Solutions Architect", "Certified Scrum Master", "PMP", "Google Data Analytics Professional Certificate",
  "Cisco CCNA", "Microsoft Certified Azure Fundamentals", "CompTIA Security+", "CPA", "CFA", "Six Sigma Green Belt",
  "Adobe Certified Expert", "Oracle Certified Professional", "ISTQB Certified Tester"
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

export default function Step8({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [hardSkills, setHardSkills] = useState(answers.hardSkills || []);
  const [softSkills, setSoftSkills] = useState(answers.softSkills || []);
  const [toolsRequired, setToolsRequired] = useState(answers.toolsRequired || []);
  const [certifications, setCertifications] = useState<string[]>(answers.certifications || []);
  const [languages, setLanguages] = useState<string[]>(answers.languages || []);
  const [preferredDegrees, setPreferredDegrees] = useState<string[]>(answers.preferredDegrees || []);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(answers.preferredLanguages || []);
  const [minEducation, setMinEducation] = useState(answers.minEducation || "");
  const [mustHaveAll, setMustHaveAll] = useState(answers.mustHaveAll ?? false);
  const [openToFreshers, setOpenToFreshers] = useState(answers.openToFreshers ?? false);

  const [inputHard, setInputHard] = useState("");
  const [inputSoft, setInputSoft] = useState("");
  const [inputTool, setInputTool] = useState("");
  const [inputCert, setInputCert] = useState("");
  const [inputLang, setInputLang] = useState("");
  const [inputDegree, setInputDegree] = useState("");
  const [inputPrefLang, setInputPrefLang] = useState("");

  const [showHardSuggestions, setShowHardSuggestions] = useState(false);
  const [showSoftSuggestions, setShowSoftSuggestions] = useState(false);
  const [showToolSuggestions, setShowToolSuggestions] = useState(false);
  const [showCertSuggestions, setShowCertSuggestions] = useState(false);

  function addTag(
    input: string,
    setInput: (val: string) => void,
    arr: string[],
    setArr: (val: string[]) => void
  ) {
    const tag = input.trim();
    if (tag && !arr.some(s => s.toLowerCase() === tag.toLowerCase()) && tag.length <= 32) {
      setArr([...arr, tag]);
      setInput("");
    }
  }

  function removeTag(
    item: string,
    arr: string[],
    setArr: (val: string[]) => void
  ) {
    setArr(arr.filter(s => s !== item));
  }

  const hardSuggestions = getSuggestions(inputHard, HARD_SKILL_SUGGESTIONS, hardSkills);
  const softSuggestions = getSuggestions(inputSoft, SOFT_SKILL_SUGGESTIONS, softSkills);
  const toolSuggestions = getSuggestions(inputTool, TOOLS_SUGGESTIONS, toolsRequired);
  const certSuggestions = getSuggestions(inputCert, CERTIFICATIONS_SUGGESTIONS, certifications);

  const handleNextStep = () => {
    setAnswer('hardSkills', hardSkills);
    setAnswer('softSkills', softSkills);
    setAnswer('toolsRequired', toolsRequired);
    setAnswer('certifications', certifications);
    setAnswer('languages', languages);
    setAnswer('minEducation', minEducation.trim() || undefined);
    setAnswer('mustHaveAll', mustHaveAll);
    setAnswer('preferredDegrees', preferredDegrees);
    setAnswer('preferredLanguages', preferredLanguages);
    setAnswer('openToFreshers', openToFreshers);
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
            Must-have skills in your dream candidate?<Text style={{ color: "#B88908" }}> 🛠️</Text>
          </Text>
        </Surface>
        {/* HARD SKILLS */}
        <Text style={styles.sectionLabel}>Hard Skills</Text>
        <View>
          <TextInput
            value={inputHard}
            onChangeText={text => {
              setInputHard(text);
              setShowHardSuggestions(!!text);
            }}
            onSubmitEditing={() => addTag(inputHard, setInputHard, hardSkills, setHardSkills)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. Python, Power BI, Tableau"
            left={<TextInput.Icon icon="hammer-wrench" />}
            maxLength={32}
            onBlur={() => setTimeout(() => setShowHardSuggestions(false), 100)}
          />
          {showHardSuggestions && hardSuggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={hardSuggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      addTag(item, setInputHard, hardSkills, setHardSkills);
                      setShowHardSuggestions(false);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
        </View>
        <HelperText type="info" visible={inputHard.length > 0}>
          {inputHard.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {hardSkills.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, hardSkills, setHardSkills)}>{s}</Chip>
          )}
        </View>
        {/* SOFT SKILLS */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Soft Skills <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <View>
          <TextInput
            value={inputSoft}
            onChangeText={text => {
              setInputSoft(text);
              setShowSoftSuggestions(!!text);
            }}
            onSubmitEditing={() => addTag(inputSoft, setInputSoft, softSkills, setSoftSkills)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. Communication, Leadership"
            left={<TextInput.Icon icon="handshake-outline" />}
            maxLength={32}
            onBlur={() => setTimeout(() => setShowSoftSuggestions(false), 100)}
          />
          {showSoftSuggestions && softSuggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={softSuggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      addTag(item, setInputSoft, softSkills, setSoftSkills);
                      setShowSoftSuggestions(false);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
        </View>
        <HelperText type="info" visible={inputSoft.length > 0}>
          {inputSoft.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {softSkills.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, softSkills, setSoftSkills)}>{s}</Chip>
          )}
        </View>
        {/* TOOLS */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Tools / Software Required</Text>
        <View>
          <TextInput
            value={inputTool}
            onChangeText={text => {
              setInputTool(text);
              setShowToolSuggestions(!!text);
            }}
            onSubmitEditing={() => addTag(inputTool, setInputTool, toolsRequired, setToolsRequired)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. Power BI, Tableau, Unreal Engine"
            left={<TextInput.Icon icon="toolbox-outline" />}
            maxLength={32}
            onBlur={() => setTimeout(() => setShowToolSuggestions(false), 100)}
          />
          {showToolSuggestions && toolSuggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={toolSuggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      addTag(item, setInputTool, toolsRequired, setToolsRequired);
                      setShowToolSuggestions(false);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
        </View>
        <HelperText type="info" visible={inputTool.length > 0}>
          {inputTool.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {toolsRequired.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, toolsRequired, setToolsRequired)}>{s}</Chip>
          )}
        </View>
        {/* CERTIFICATIONS */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Certifications <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <View>
          <TextInput
            value={inputCert}
            onChangeText={text => {
              setInputCert(text);
              setShowCertSuggestions(!!text);
            }}
            onSubmitEditing={() => addTag(inputCert, setInputCert, certifications, setCertifications)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g. AWS Certified Solutions Architect"
            left={<TextInput.Icon icon="certificate-outline" />}
            maxLength={32}
            onBlur={() => setTimeout(() => setShowCertSuggestions(false), 100)}
          />
          {showCertSuggestions && certSuggestions.length > 0 && (
            <Surface style={styles.suggestionDropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={certSuggestions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      addTag(item, setInputCert, certifications, setCertifications);
                      setShowCertSuggestions(false);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Surface>
          )}
        </View>
        <HelperText type="info" visible={inputCert.length > 0}>
          {inputCert.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {certifications.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, certifications, setCertifications)}>{s}</Chip>
          )}
        </View>
        {/* LANGUAGES */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Languages (required for this role) <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <TextInput
          value={inputLang}
          onChangeText={setInputLang}
          onSubmitEditing={() => {
            addTag(inputLang, setInputLang, languages, setLanguages);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. English, Hindi, French"
          left={<TextInput.Icon icon="translate" />}
          maxLength={32}
        />
        <HelperText type="info" visible={inputLang.length > 0}>
          {inputLang.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {languages.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, languages, setLanguages)}>{s}</Chip>
          )}
        </View>
        {/* PREFERRED DEGREES */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Preferred Degrees <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <TextInput
          value={inputDegree}
          onChangeText={setInputDegree}
          onSubmitEditing={() => {
            addTag(inputDegree, setInputDegree, preferredDegrees, setPreferredDegrees);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. B.Tech, MBA, MSc"
          left={<TextInput.Icon icon="school-outline" />}
          maxLength={32}
        />
        <HelperText type="info" visible={inputDegree.length > 0}>
          {inputDegree.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {preferredDegrees.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, preferredDegrees, setPreferredDegrees)}>{s}</Chip>
          )}
        </View>
        {/* MIN EDUCATION */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Minimum Required Education <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <TextInput
          value={minEducation}
          onChangeText={setMinEducation}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. Bachelor's, Diploma, 12th Pass"
          left={<TextInput.Icon icon="school-outline" />}
          maxLength={32}
        />
        {/* PREFERRED LANGUAGES */}
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Preferred Languages <Text style={{ color: "#888", fontSize: 13 }}>(optional)</Text></Text>
        <TextInput
          value={inputPrefLang}
          onChangeText={setInputPrefLang}
          onSubmitEditing={() => {
            addTag(inputPrefLang, setInputPrefLang, preferredLanguages, setPreferredLanguages);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="e.g. Spanish, German"
          left={<TextInput.Icon icon="translate" />}
          maxLength={32}
        />
        <HelperText type="info" visible={inputPrefLang.length > 0}>
          {inputPrefLang.length}/32 characters
        </HelperText>
        <View style={styles.chipRow}>
          {preferredLanguages.map(s =>
            <Chip key={s} style={styles.chip} onClose={() => removeTag(s, preferredLanguages, setPreferredLanguages)}>{s}</Chip>
          )}
        </View>
        {/* Must-have all checkbox */}
        <View style={styles.row}>
          <Checkbox
            status={mustHaveAll ? "checked" : "unchecked"}
            onPress={() => setMustHaveAll(m => !m)}
            color="#B88908"
          />
          <Text style={styles.checkboxLabel}>
            Candidate must have ALL these skills (strict filter)
          </Text>
        </View>
        {/* Freshers */}
        <View style={styles.row}>
          <Checkbox
            status={openToFreshers ? "checked" : "unchecked"}
            onPress={() => setOpenToFreshers(f => !f)}
            color="#B88908"
          />
          <Text style={styles.checkboxLabel}>
            Open to Freshers / No Prior Experience
          </Text>
        </View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={hardSkills.length === 0}
        >
          Next
        </Button>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Add as many skills, tools, certifications, or languages as you want — suggestions help you get started faster!
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
  sectionLabel: {
    marginTop: 6,
    marginBottom: 3,
    fontWeight: '700',
    color: "#6c47ff",
    fontSize: 16,
  },
  input: {
    marginBottom: 2,
    backgroundColor: '#fff',
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 2,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f6f4ff",
    borderColor: "#ece3ff",
    borderWidth: 1,
  },
  button: {
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
});