import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, PanResponder, Easing, Image } from 'react-native';
import { Button, Card, Text, Avatar, Surface, Snackbar, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUser } from '../App';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const GOLD = "#B88908";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const ERROR_COLOR = "#d32f2f";

// Define prompts for rendering (order and label)
const CANDIDATE_PROMPTS = [
  { key: "step1", label: "Job Title" },
  { key: "step2", label: "Education" },
  { key: "step3", label: "Skills" },
  { key: "step4", label: "Work Experience" },
  { key: "step5", label: "Dream Company" },
  { key: "step6", label: "Fun Fact" },
  { key: "step7", label: "What motivates you?" },
  { key: "step8", label: "Looking for" },
  { key: "location", label: "Location" },
];

const HR_PROMPTS = [
  { key: "step1", label: "Company Name" },
  { key: "step2", label: "Industry" },
  { key: "step3", label: "Company Size" },
  { key: "step4", label: "Role Hiring For" },
  { key: "step5", label: "Skills Needed" },
  { key: "step6", label: "Perks" },
  { key: "step7", label: "Team Culture" },
  { key: "step8", label: "Vision" },
  { key: "step9", label: "What excites you about candidates?" },
  { key: "step10", label: "Fun Fact" },
  { key: "step11", label: "Salary Range" },
  { key: "location", label: "Location" },
];

type RootStackParamList = {
  Chat: undefined;
  Settings: undefined;
};

type SwipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
};

function filterProfiles(profiles: any[], type: string) {
  if (type === 'all') return profiles;
  return profiles.filter((p) => (p.companyType || p.type) === type);
}

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { user, profile } = useUser();

  const [isCandidate, setIsCandidate] = useState(profile?.role === 'candidate');
  const [companyType, setCompanyType] = useState('all');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [index, setIndex] = useState(0);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [undoStack, setUndoStack] = useState<any[]>([]);

  // Swipe animation
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 15,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, { dx }) => {
        if (dx > 120) {
          triggerSwipe('right');
        } else if (dx < -120) {
          triggerSwipe('left');
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  // Fetch profiles from Firestore based on role
  useEffect(() => {
    setLoading(true);
    const fetchProfiles = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", isCandidate ? "hr" : "candidate"), where("completed", "==", true));
      const snap = await getDocs(q);
      let fetched: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.uid !== user?.uid) fetched.push(data);
      });
      setProfiles(filterProfiles(fetched, companyType));
      setIndex(0);
      setLoading(false);
    };
    fetchProfiles();
  }, [isCandidate, companyType]);

  function triggerSwipe(direction: 'left' | 'right') {
    Animated.timing(pan, {
      toValue: { x: direction === 'right' ? width * 1.2 : -width * 1.2, y: 0 },
      duration: 250,
      useNativeDriver: false,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      handleSwipe(direction);
      pan.setValue({ x: 0, y: 0 });
    });
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (!profiles[index]) return;
    setUndoStack([
      { profile: profiles[index], idx: index, type: companyType, isCandidate },
      ...undoStack,
    ]);
    setSnackbarMsg(direction === "right" ? "Liked! 🎉" : "Passed");
    if (index < profiles.length - 1) {
      setIndex(index + 1);
    } else {
      setTimeout(() => navigation.replace('Chat'), 650);
    }
  }

  function handleUndo() {
    if (undoStack.length > 0) {
      const last = undoStack[0];
      setIndex(last.idx);
      setCompanyType(last.type);
      setUndoStack(undoStack.slice(1));
      setSnackbarMsg("Undo successful!");
    } else {
      setSnackbarMsg("Nothing to undo!");
    }
  }

  // UI for each profile card
  const renderPrompts = (profileObj: any, prompts: { key: string, label: string }[]) => (
    <View style={styles.promptsWrap}>
      {prompts.map((p) => (
        profileObj[p.key] ?
          <View key={p.key} style={styles.promptCard}>
            <Text style={styles.promptLabel}>{p.label}</Text>
            <Text style={styles.promptAnswer}>{profileObj[p.key]}</Text>
          </View>
        : null
      ))}
    </View>
  );

  const profileCard = profiles[index];

  return (
    <View style={styles.container}>
      {/* Role selector */}
      <View style={styles.topRow}>
        <Chip
          selected={isCandidate}
          onPress={() => { setIndex(0); setIsCandidate(true); }}
          style={[styles.roleChip, isCandidate && styles.selectedChip]}
          textStyle={isCandidate ? styles.selectedText : undefined}
          icon="account"
        >Candidate</Chip>
        <Chip
          selected={!isCandidate}
          onPress={() => { setIndex(0); setIsCandidate(false); }}
          style={[styles.roleChip, !isCandidate && styles.selectedChip]}
          textStyle={!isCandidate ? styles.selectedText : undefined}
          icon="briefcase"
        >HR/Recruiter</Chip>
      </View>
      {/* Company type selector */}
      <View style={styles.typeRow}>
        <Chip
          selected={companyType === 'all'}
          onPress={() => { setCompanyType('all'); setIndex(0); }}
          style={[styles.typeChip, companyType === 'all' && styles.selectedTypeChip]}
          textStyle={companyType === 'all' ? styles.selectedText : undefined}
          icon="star"
        >All</Chip>
        <Chip
          selected={companyType === 'mnc'}
          onPress={() => { setCompanyType('mnc'); setIndex(0); }}
          style={[styles.typeChip, companyType === 'mnc' && styles.selectedTypeChip]}
          textStyle={companyType === 'mnc' ? styles.selectedText : undefined}
          icon="domain"
        >MNCs</Chip>
        <Chip
          selected={companyType === 'middle'}
          onPress={() => { setCompanyType('middle'); setIndex(0); }}
          style={[styles.typeChip, companyType === 'middle' && styles.selectedTypeChip]}
          textStyle={companyType === 'middle' ? styles.selectedText : undefined}
          icon="office-building"
        >Middle</Chip>
        <Chip
          selected={companyType === 'startup'}
          onPress={() => { setCompanyType('startup'); setIndex(0); }}
          style={[styles.typeChip, companyType === 'startup' && styles.selectedTypeChip]}
          textStyle={companyType === 'startup' ? styles.selectedText : undefined}
          icon="rocket"
        >Startups</Chip>
      </View>
      {/* Card swipe area */}
      <View style={styles.cardArea}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={{ color: GOLD, marginTop: 18 }}>Fetching profiles...</Text>
          </View>
        ) : !profileCard ? (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 24, color: GOLD, fontWeight: 'bold', marginBottom: 22 }}>No more profiles!</Text>
            <Button icon="refresh" mode="outlined" onPress={() => setIndex(0)} style={{ borderRadius: 20, marginBottom: 20 }}>Restart</Button>
            <Button icon="undo" mode="text" onPress={handleUndo} textColor={ACCENT} style={{ marginBottom: 12 }}>Undo</Button>
            <Button icon="cog" mode="text" onPress={() => navigation.navigate('Settings')}>Go to Settings</Button>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.animatedCard,
              {
                transform: [
                  { translateX: pan.x },
                  { rotate: pan.x.interpolate({
                      inputRange: [-width, 0, width],
                      outputRange: ['-15deg', '0deg', '15deg'],
                    })
                  },
                ],
                opacity: pan.x.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: [0.6, 1, 0.6],
                }),
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Surface style={styles.surfaceShadow}>{null}</Surface>
            <Card style={styles.card}>
              <Card.Title
                title={isCandidate ? profileCard.companyName || profileCard.name : profileCard.name}
                subtitle={isCandidate ? profileCard.roleHiringFor || profileCard.job : profileCard.jobTitle}
                titleStyle={{ color: GOLD, fontWeight: 'bold', fontSize: 19 }}
                subtitleStyle={{ color: ACCENT, fontWeight: '600' }}
                left={(props) => profileCard.photoURL
                  ? <Avatar.Image {...props} source={{ uri: profileCard.photoURL }} />
                  : <Avatar.Icon {...props} icon={isCandidate ? "briefcase" : "account"} style={{ backgroundColor: ACCENT }} />
                }
                right={(props) => (
                  <Chip
                    style={[
                      styles.miniTypeChip,
                      {
                        backgroundColor:
                          (profileCard.companyType || profileCard.type) === 'mnc'
                            ? '#ffefd2'
                            : (profileCard.companyType || profileCard.type) === 'middle'
                            ? '#f3e5f5'
                            : '#e3fcef',
                      },
                    ]}
                    textStyle={{
                      color:
                        (profileCard.companyType || profileCard.type) === 'mnc'
                          ? GOLD
                          : (profileCard.companyType || profileCard.type) === 'middle'
                          ? ACCENT
                          : '#1bb473',
                      fontWeight: 'bold',
                      fontSize: 11,
                    }}
                    icon={
                      (profileCard.companyType || profileCard.type) === 'mnc'
                        ? 'domain'
                        : (profileCard.companyType || profileCard.type) === 'middle'
                        ? 'office-building'
                        : 'rocket'
                    }
                  >
                    {(profileCard.companyType || profileCard.type || "").toUpperCase()}
                  </Chip>
                )}
              />
              <Card.Content>
                {renderPrompts(
                  profileCard,
                  isCandidate ? HR_PROMPTS : CANDIDATE_PROMPTS
                )}
              </Card.Content>
            </Card>
          </Animated.View>
        )}
      </View>
      {/* Swipe action buttons */}
      {!loading && profileCard && (
        <View style={styles.swipeRow}>
          <IconButton
            icon="close"
            size={36}
            onPress={() => triggerSwipe('left')}
            style={[styles.swipeBtn, { backgroundColor: WHITE, borderColor: GOLD, borderWidth: 1.2 }]}
            iconColor={GOLD}
            accessibilityLabel="Pass"
          />
          <IconButton
            icon="heart"
            size={36}
            onPress={() => triggerSwipe('right')}
            style={[styles.swipeBtn, { backgroundColor: GOLD }]}
            iconColor={WHITE}
            accessibilityLabel="Like"
          />
          <IconButton
            icon="undo"
            size={32}
            onPress={handleUndo}
            style={[styles.swipeBtn, { backgroundColor: ACCENT }]}
            iconColor={WHITE}
            accessibilityLabel="Undo"
            disabled={undoStack.length === 0}
          />
        </View>
      )}
      {/* Profile meta & settings */}
      <View style={styles.metaRow}>
        <Text style={{ color: "#888", fontSize: 15 }}>
          {profileCard ? `Profile ${index + 1} of ${profiles.length}` : ""}
        </Text>
        <Button
          icon="cog"
          mode="text"
          onPress={() => navigation.navigate('Settings')}
          textColor={ACCENT}
        >
          Settings
        </Button>
      </View>
      <Snackbar
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        duration={1200}
        style={{ backgroundColor: snackbarMsg === "Nothing to undo!" ? ERROR_COLOR : GOLD, borderRadius: 10, marginBottom: 20 }}
      >
        <Text style={{ color: WHITE, fontWeight: 'bold' }}>{snackbarMsg}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: OFF_WHITE, alignItems: 'center' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 4,
    width: '100%',
    gap: 12,
  },
  roleChip: {
    marginHorizontal: 3,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1.1,
    borderColor: GOLD,
    paddingVertical: 2,
    paddingHorizontal: 8,
    elevation: 1,
  },
  selectedChip: {
    backgroundColor: GOLD,
    borderColor: ACCENT,
    elevation: 3,
  },
  selectedText: {
    color: WHITE,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
    gap: 8,
  },
  typeChip: {
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    elevation: 1,
  },
  selectedTypeChip: {
    backgroundColor: ACCENT,
    borderColor: GOLD,
    elevation: 2,
  },
  cardArea: {
    width: width - 24,
    height: 440,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width - 44,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    elevation: 7,
    zIndex: 2,
    marginBottom: 30,
    alignSelf: 'center',
  },
  animatedCard: {
    width: width - 44,
    zIndex: 2,
  },
  surfaceShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFD70033",
    borderRadius: 22,
    zIndex: 1,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  swipeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    marginTop: 4,
    gap: 16,
  },
  swipeBtn: {
    borderRadius: 25,
    marginHorizontal: 2,
    minWidth: 54,
    minHeight: 54,
    elevation: 3,
  },
  location: {
    marginTop: 12,
    color: ACCENT,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width - 44,
  },
  miniTypeChip: {
    alignSelf: 'center',
    paddingHorizontal: 7,
    height: 22,
    marginRight: 8,
    marginTop: 2,
    elevation: 0,
  },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', flex: 1, height: 220 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', flex: 1, height: 220 },
  promptsWrap: { marginTop: 16, marginBottom: 12 },
  promptCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#FFD700AA",
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 1,
  },
  promptLabel: {
    fontWeight: "bold",
    color: ACCENT,
    fontSize: 15,
    marginBottom: 2,
  },
  promptAnswer: {
    color: "#222",
    fontSize: 15,
    marginLeft: 3,
  },
});