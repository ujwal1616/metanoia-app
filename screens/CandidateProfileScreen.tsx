import React, { useState, useMemo, useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, Avatar, Text, Surface, ProgressBar, Snackbar, Portal, Dialog } from 'react-native-paper';
import type { StackNavigationProp } from '@react-navigation/stack';

// Steps
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import Step6 from './Step6';
import Step7 from './Step7';
import Step8 from './Step8';
import Step9 from './Step9';

import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const WHITE = "#FFFFFF";
const OFF_WHITE = "#FAF7F2";
const CARD_BG = "#FFF9EC";
const GOLD_ACCENT = "#FFD700";
const DARK_TEXT = "#232323";

type CandidateProfileScreenProps = {
  navigation: StackNavigationProp<any, any>;
  route: { params?: { companyType?: string } };
};

const steps = [
  Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9,
];

const stepTitles = [
  "Company & Location",
  "Your Name & Birthday",
  "Gender",
  "Education & Experience",
  "Roles & Skills",
  "Intro & Video",
  "Fun Prompts",
  "Links & Docs",
  "Profile Photo",
];

const summaryLabels: { [key: string]: string } = {
  // ...same as before
  fullName: "Full Name",
  birthday: "Birthday",
  age: "Age",
  nickname: "Nickname",
  pronouns: "Pronouns",
  gender: "Gender",
  genderPronoun: "Gender Pronoun",
  latestEducation: "Education",
  passingYear: "Passing Year",
  projects: "Projects",
  experiences: "Experiences",
  skills: "Skills",
  roles: "Roles",
  hardSkills: "Hard Skills",
  softSkills: "Soft Skills",
  specificSkills: "Specific Skills",
  software: "Software",
  otherStrengths: "Other Strengths",
  superpower: "Superpower",
  introText: "Intro",
  videoUrl: "Video",
  links: "Links",
  resume: "Resume",
  profilePhoto: "Profile Photo",
};

function formatSummary(formData: any): Array<{ label: string, value: string | string[] | undefined }> {
  return Object.entries(formData).map(([key, value]) => ({
    label: summaryLabels[key] || key,
    value: value as string | string[] | undefined,
  }));
}

export default function CandidateProfileScreen({ navigation, route }: CandidateProfileScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<{visible: boolean, message: string}>({visible: false, message: ''});
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const { answers, setAnswer, resetAnswers } = useContext(OnboardingContext);

  const companyType = route?.params?.companyType;

  const StepComponent = steps[stepIndex];
  const progressPercent = useMemo(() => (stepIndex + 1) / steps.length, [stepIndex]);

  // Handle Next: Save data to context, go to next step
  const handleNext = (data: any) => {
    Object.entries(data).forEach(([key, value]) => setAnswer(key, value));
    setStepIndex((prev) => prev + 1);
    setSnackbar({visible: false, message: ''});
  };

  // Handle Back: Go to previous step
  const handleBack = () => {
    if (stepIndex === 0) setShowDialog(true);
    else setStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Confirm exit dialog
  const handleDialogConfirm = () => {
    setShowDialog(false);
    resetAnswers();
    navigation.goBack();
  };

  // Handle Publish: Submit data (async simulated)
  const handlePublish = async () => {
    setLoading(true);
    try {
      // Replace with real API call if needed
      await new Promise(res => setTimeout(res, 1300));
      setSnackbar({visible: true, message: "Profile published! Redirecting..."});
      setTimeout(() => {
        resetAnswers();
        navigation.navigate('Swipe');
      }, 1200);
    } catch (e) {
      setSnackbar({visible: true, message: "Error submitting. Please try again."});
    } finally {
      setLoading(false);
    }
  };

  // Final step: Preview & Publish
  if (stepIndex >= steps.length) {
    const summaryArray = formatSummary(answers);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Avatar.Icon icon="account" size={80} style={styles.avatar} />
        <Text style={styles.title}>Profile Preview</Text>
        <Text style={{marginBottom: 10, color: DARK_TEXT, textAlign: 'center'}}>Make sure everything looks right before publishing!</Text>
        {companyType && (
          <Surface style={styles.previewSurface}>
            <Text style={{fontWeight: 'bold', color: GOLD}}>Selected Company Type: </Text>
            <Text style={{color: DARK_TEXT}}>{companyType}</Text>
          </Surface>
        )}
        <Surface style={styles.previewSurface}>
          {summaryArray.map((item, idx) => (
            <View key={idx} style={{marginBottom: 8}}>
              <Text style={{fontWeight: 'bold', color: GOLD, fontSize: 13, marginBottom: 2}}>
                {item.label}:
              </Text>
              {Array.isArray(item.value) ? (
                item.value.length > 0 ?
                  item.value.map((el, i) => (
                    <Text key={i} selectable style={{fontFamily: 'monospace', fontSize: 12, color: DARK_TEXT}}>
                      {el}
                    </Text>
                  ))
                  : <Text style={{fontFamily: 'monospace', fontSize: 12, color: "#888"}}>None</Text>
              ) : (
                <Text selectable style={{fontFamily: 'monospace', fontSize: 12, color: DARK_TEXT}}>
                  {item.value ? item.value : <Text style={{color:"#888"}}>None</Text>}
                </Text>
              )}
            </View>
          ))}
        </Surface>
        <Button
          mode="contained"
          style={[styles.submitBtn, loading && {opacity:0.8}]}
          buttonColor={GOLD}
          textColor={WHITE}
          loading={loading}
          onPress={handlePublish}
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </Button>
        <Button mode="outlined" style={styles.backBtn} textColor={GOLD} onPress={() => setStepIndex(steps.length - 1)}>
          Back
        </Button>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({...snackbar, visible: false})}
          duration={2200}
          style={{backgroundColor: GOLD}}
        >
          {snackbar.message}
        </Snackbar>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Avatar.Icon icon="account" size={64} style={styles.avatar} />
        <Text style={styles.title}>{stepTitles[stepIndex]}</Text>
        {stepIndex === 0 && companyType && (
          <Surface style={styles.infoSurface}>
            <Text style={{ color: GOLD }}>
              Selected Company Type: <Text style={{fontWeight: 'bold', color: GOLD_ACCENT}}>{companyType}</Text>
            </Text>
          </Surface>
        )}
        <ProgressBar
          progress={progressPercent}
          color={GOLD}
          style={styles.progressBar}
        />
        <StepComponent
          onNext={handleNext}
          defaultValues={answers}
        />
        <View style={styles.footerRow}>
          <Button mode="outlined" style={styles.backBtn} textColor={GOLD} onPress={handleBack}>
            {stepIndex === 0 ? "Exit" : "Back"}
          </Button>
          <Text style={styles.stepText}>
            Step {stepIndex+1} of {steps.length}
          </Text>
          <View style={{flex:1}} />
        </View>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({...snackbar, visible: false})}
          duration={2200}
          style={{backgroundColor: GOLD}}
        >
          {snackbar.message}
        </Snackbar>
      </ScrollView>
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Exit Profile?</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to exit? Your progress will be lost.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={handleDialogConfirm} textColor={GOLD}>Exit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: OFF_WHITE,
    padding: 20
  },
  avatar: {
    marginTop: 20,
    backgroundColor: GOLD,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  submitBtn: {
    marginTop: 30,
    width: '100%',
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: GOLD,
    elevation: 2,
  },
  backBtn: {
    marginTop: 10,
    flex: 1,
    borderColor: GOLD,
    borderWidth: 1.2,
    borderRadius: 18,
    backgroundColor: WHITE,
    marginRight: 8,
  },
  infoSurface: {
    backgroundColor: WHITE,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    borderColor: GOLD_ACCENT,
    borderWidth: 0.7,
  },
  previewSurface: {
    width: '100%',
    padding: 14,
    marginBottom: 15,
    backgroundColor: WHITE,
    borderRadius: 12,
    elevation: 2,
    borderColor: GOLD_ACCENT,
    borderWidth: 1,
  },
  progressBar: {
    width: '80%',
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: '#e6dac0',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    alignSelf: 'center',
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});