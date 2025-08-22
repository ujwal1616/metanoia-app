import React, { useRef, useState, useEffect, useContext } from 'react';
import { FlatList, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { TextInput, Button, Card, Text, Avatar, Surface, IconButton, Menu, Divider, Snackbar, Portal, Dialog } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

// FIREBASE IMPORTS (make sure you have these in your project)
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Notifications from 'expo-notifications';

// GOLD-WHITE THEME COLORS
const GOLD = "#B88908";
const ACCENT = "#6c47ff";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const OFF_WHITE = "#f6f4ff";
const DARK_TEXT = "#232323";
const ERROR = "#d32f2f";

// Initial messages for demonstration
const initialMessages = [
  { id: '1', fromMe: false, text: "Hi, thanks for matching! Let's discuss the opportunity.", timestamp: "10:25 AM" },
  { id: '2', fromMe: true, text: "Hello! Happy to connect. When can we schedule a call?", timestamp: "10:26 AM" },
  { id: '3', fromMe: false, text: "Can you send your CV to hr@techmnc.com or call +919876543210?", timestamp: "10:27 AM" },
];

// Util: parse message for email/phone and make clickable
function parseMessageContent(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const phoneRegex = /(\+?\d[\d\s\-]{8,}\d)/g;
  const parts = [];
  let lastIndex = 0;

  const matchAll = [...text.matchAll(new RegExp(`${emailRegex.source}|${phoneRegex.source}`, 'g'))];
  matchAll.forEach((match, idx) => {
    if (match.index! > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const matched = match[0];
    if (emailRegex.test(matched)) {
      parts.push(
        <Text
          key={`email-${idx}`}
          style={styles.linkText}
          onPress={() => Linking.openURL(`mailto:${matched}`)}
        >
          {matched}
        </Text>
      );
    } else if (phoneRegex.test(matched)) {
      parts.push(
        <Text
          key={`phone-${idx}`}
          style={styles.linkText}
          onPress={() => Linking.openURL(`tel:${matched.replace(/\s+/g, '')}`)}
        >
          {matched}
        </Text>
      );
    }
    lastIndex = match.index! + matched.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// Helper for date key (for daily limit)
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

// EXAMPLE: UserContext (Replace with your own logic)
const UserContext = React.createContext({ role: "candidate", uid: "candidate_uid", name: "Candidate Name" });

export default function ChatScreen({ navigation, hrId = "hr_uid", jobId = "job_id", companyId = "company_id" }: { navigation: any, hrId?: string, jobId?: string, companyId?: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [referDialog, setReferDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [referralRequests, setReferralRequests] = useState<{ [key: string]: boolean }>({});
  const [showReferralPaywall, setShowReferralPaywall] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Scheduling state
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const availableSlots = [
    "Tomorrow 2:00 PM",
    "Tomorrow 5:00 PM",
    "Tuesday 11:00 AM",
    "Wednesday 4:00 PM",
  ];

  // Email dialog state
  const [emailTo, setEmailTo] = useState('hr@techmnc.com');
  const [emailSubject, setEmailSubject] = useState('Regarding React Developer Position');
  const [emailBody, setEmailBody] = useState('Hi, please find my CV attached.\n\nBest regards,\nCandidate');

  // Refer dialog state
  const [referEmail, setReferEmail] = useState('');
  const [referMsg, setReferMsg] = useState('');

  // User context (for role-based rendering)
  const currentUser = useContext(UserContext);

  // Referral daily limit logic
  const todayKey = getTodayKey();
  const canRequestReferral = !referralRequests[todayKey];

  useEffect(() => {
    // Optionally: load previous day's referral state from AsyncStorage/backend
  }, []);

  // Send a chat message
  const sendMessage = () => {
    if (input.trim().length === 0) return;
    const newMessage = {
      id: String(messages.length + 1),
      fromMe: true,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Handle action buttons
  const handleAction = async (type: string) => {
    if (type === 'schedule') setScheduleDialog(true);
    if (type === 'email') setEmailDialog(true);
    if (type === 'refer') {
      if (canRequestReferral) setReferDialog(true);
      else setShowReferralPaywall(true);
    }
    if (type === 'delete') setSnackbarMsg("Conversation deleted (not really).");
    setMenuVisible(false);
  };

  // Scheduling dialog confirm
  const confirmSchedule = () => {
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        fromMe: true,
        text: `Scheduled a call for: ${selectedSlot}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSnackbarMsg("Call scheduled!");
    setScheduleDialog(false);
    setSelectedSlot(null);
  };

  // File picker for email
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        setSnackbarMsg("File attached: " + result.assets[0].name);
      }
    } catch (e) {
      setSnackbarMsg("File attach failed.");
    }
  };

  // Email dialog send
  const sendEmail = () => {
    let mailUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    Linking.openURL(mailUrl);
    setEmailDialog(false);
    setSelectedFile(null);
    setSnackbarMsg("Opened email composer.");
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        fromMe: true,
        text: `Sent CV to ${emailTo}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Advanced: Referral dialog send (saves to Firestore and fires local notification)
  const sendRefer = async () => {
    setLoadingReferral(true);
    try {
      const currentUserId = auth.currentUser?.uid || currentUser.uid || "candidate";
      await addDoc(collection(db, "referrals"), {
        fromUserId: currentUserId,
        toUserId: hrId,
        jobId: jobId,
        companyId: companyId,
        email: referEmail,
        message: referMsg,
        timestamp: serverTimestamp(),
        status: "pending"
      });
      setReferralRequests({ ...referralRequests, [todayKey]: true });
      setReferDialog(false);
      setSnackbarMsg("Referral request sent!");
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          fromMe: true,
          text: `Requested a referral from your end for: ${referEmail || "HR"}${referMsg ? "\nMsg: " + referMsg : ""}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setReferEmail('');
      setReferMsg('');
      // Local notification (demo)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Referral request sent!',
          body: 'Your referral request has been sent to HR.',
        },
        trigger: null,
      });
    } catch (error) {
      setSnackbarMsg("Failed to send referral. Please try again.");
      setReferDialog(false);
    }
    setLoadingReferral(false);
  };

  // Paywall/upgrade dialog
  const handlePaywallClose = () => setShowReferralPaywall(false);

  // Demo payment handler (replace with real flow later)
  const handleUpgrade = () => {
    setShowReferralPaywall(false);
    setSnackbarMsg("Upgrade/extra referrals coming soon!");
  };

  // Only show referral to candidates (role-based check)
  const showReferralButton = currentUser.role === "candidate";

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: OFF_WHITE }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <Surface style={styles.headerBar}>
        <Avatar.Icon size={40} icon="briefcase" style={styles.headerAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>HR: TechMNC</Text>
          <Text style={styles.headerSubtitle}>React Developer</Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} style={{ marginRight: 2 }} />
          }
        >
          <Menu.Item onPress={() => handleAction('delete')} title="Delete Chat" leadingIcon="delete" />
          <Divider />
          <Menu.Item onPress={() => navigation.navigate('Settings')} title="Settings" leadingIcon="cog" />
        </Menu>
      </Surface>
      {/* Message list */}
      <FlatList
        ref={flatListRef}
        style={styles.list}
        data={messages}
        contentContainerStyle={{ paddingBottom: 10 }}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageRow,
            item.fromMe ? styles.me : styles.them,
          ]}>
            {!item.fromMe && (
              <Avatar.Icon
                size={30}
                icon="briefcase"
                style={styles.avatarThem}
              />
            )}
            <Card style={[
              styles.msgCard,
              item.fromMe ? styles.cardMe : styles.cardThem,
            ]}>
              <Card.Content>
                <Text style={{ color: DARK_TEXT }}>
                  {parseMessageContent(item.text)}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </Card.Content>
            </Card>
            {item.fromMe && (
              <Avatar.Icon
                size={30}
                icon="account"
                style={styles.avatarMe}
              />
            )}
          </View>
        )}
      />
      {/* Input and send */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          mode="outlined"
          outlineColor={GOLD}
          activeOutlineColor={ACCENT}
          textColor={DARK_TEXT}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Button mode="contained" onPress={sendMessage} style={styles.sendBtn} buttonColor={GOLD} textColor={WHITE} icon="send">
          {" "}
        </Button>
      </View>
      {/* Action buttons: schedule, email, refer (referral only for candidate) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => handleAction('schedule')}>
          <Surface style={styles.actionSurface}>
            <IconButton icon="calendar" size={22} iconColor={ACCENT} />
            <Text style={styles.actionText}>Schedule Call</Text>
          </Surface>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction('email')}>
          <Surface style={styles.actionSurface}>
            <IconButton icon="email" size={22} iconColor={ACCENT} />
            <Text style={styles.actionText}>Email</Text>
          </Surface>
        </TouchableOpacity>
        {showReferralButton && (
          <TouchableOpacity onPress={() => handleAction('refer')} disabled={!canRequestReferral || loadingReferral}>
            <Surface style={[styles.actionSurface, !canRequestReferral && { backgroundColor: "#ffe0b2", opacity: 0.7 }]}>
              <IconButton icon="account-arrow-right" size={22} iconColor={canRequestReferral ? ACCENT : "#bbb"} />
              <Text style={[styles.actionText, !canRequestReferral && { color: "#bbb" }]}>
                Request Referral
              </Text>
            </Surface>
          </TouchableOpacity>
        )}
      </View>
      {showReferralButton && !canRequestReferral && (
        <View style={styles.referralLimitRow}>
          <Text style={{ color: "#e67e22", fontSize: 13, fontWeight: "bold" }}>
            1 free referral request per day. Get unlimited with upgrade!
          </Text>
        </View>
      )}
      {/* Scheduling Dialog */}
      <Portal>
        <Dialog visible={scheduleDialog} onDismiss={() => setScheduleDialog(false)}>
          <Dialog.Title>Schedule Call</Dialog.Title>
          <Dialog.Content>
            <Text>Pick a time slot:</Text>
            {availableSlots.map((slot, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slotBtn,
                  selectedSlot === slot && styles.selectedSlotBtn,
                ]}
              >
                <Text style={{ color: selectedSlot === slot ? WHITE : ACCENT, fontWeight: 'bold' }}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setScheduleDialog(false)}>Cancel</Button>
            <Button onPress={confirmSchedule} disabled={!selectedSlot} textColor={GOLD}>
              Schedule
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* Email Dialog */}
        <Dialog visible={emailDialog} onDismiss={() => setEmailDialog(false)}>
          <Dialog.Title>Send Email</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="To"
              value={emailTo}
              onChangeText={setEmailTo}
              mode="outlined"
              style={styles.dialogInput}
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Subject"
              value={emailSubject}
              onChangeText={setEmailSubject}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Body"
              value={emailBody}
              onChangeText={setEmailBody}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
            <Button icon="paperclip" onPress={pickFile} mode="text">
              {selectedFile ? `Attached: ${selectedFile.name}` : "Attach File"}
            </Button>
            {selectedFile && (
              <Text style={{ color: ACCENT, fontSize: 13, marginTop: 2 }}>{selectedFile.name}</Text>
            )}
            <Text style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
              Attachment will need to be added in your email app.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEmailDialog(false)}>Cancel</Button>
            <Button onPress={sendEmail} textColor={GOLD}>
              Send Email
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* Refer Dialog */}
        <Dialog visible={referDialog} onDismiss={() => setReferDialog(false)}>
          <Dialog.Title>Request Referral</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 5, color: ACCENT, fontWeight: "bold" }}>
              You get 1 free referral request per day to this company.
            </Text>
            <TextInput
              label="Contact Email (optional)"
              placeholder="HR/Referrer's email (optional)"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              style={styles.dialogInput}
              value={referEmail}
              onChangeText={setReferEmail}
            />
            <TextInput
              label="Message"
              placeholder="Why do you want a referral? (optional)"
              mode="outlined"
              multiline
              style={styles.dialogInput}
              value={referMsg}
              onChangeText={setReferMsg}
            />
            <Text style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
              We'll notify the HR/referrer about your request.
            </Text>
            <Text style={{ color: "#e67e22", fontSize: 12, marginTop: 4 }}>
              Need more? Unlock unlimited referrals soon!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReferDialog(false)}>Cancel</Button>
            <Button onPress={sendRefer} textColor={GOLD} loading={loadingReferral}>
              Request
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* Referral Paywall Dialog */}
        <Dialog visible={showReferralPaywall} onDismiss={handlePaywallClose}>
          <Dialog.Title>Upgrade for Unlimited Referrals</Dialog.Title>
          <Dialog.Content>
            <Text>
              You have used your free referral request for today.
              {"\n\n"}
              Upgrade your account to get unlimited referral requests and boost your chances!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handlePaywallClose}>Later</Button>
            <Button onPress={handleUpgrade} textColor={GOLD}>
              Upgrade (Coming Soon)
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* Snackbar */}
      <Snackbar
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        duration={1200}
        style={{ backgroundColor: GOLD, borderRadius: 10, marginBottom: 24 }}
      >
        <Text style={{ color: WHITE, fontWeight: 'bold' }}>{snackbarMsg}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    elevation: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 7,
    marginBottom: 2,
  },
  headerAvatar: {
    backgroundColor: ACCENT,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: GOLD,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
    marginTop: 1,
  },
  list: { flex: 1, marginBottom: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5, maxWidth: '95%' },
  me: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  them: { justifyContent: 'flex-start', alignSelf: 'flex-start' },
  msgCard: { borderRadius: 15, marginBottom: 2, elevation: 2, maxWidth: 260, minWidth: 50 },
  cardMe: { backgroundColor: "#ece3ff", marginLeft: 24 },
  cardThem: { backgroundColor: WHITE, marginRight: 24 },
  avatarMe: { backgroundColor: ACCENT, marginLeft: 8 },
  avatarThem: { backgroundColor: "#aaa", marginRight: 8 },
  timestamp: { fontSize: 10, color: "#aaa", marginTop: 3, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingHorizontal: 2 },
  input: { flex: 1, marginRight: 7, backgroundColor: WHITE, borderRadius: 20, borderWidth: 1.2, borderColor: GOLD, fontSize: 15, paddingHorizontal: 10 },
  sendBtn: { borderRadius: 20, minWidth: 44, height: 44, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6, marginBottom: 2 },
  actionSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 4,
    elevation: 2,
    marginHorizontal: 3,
  },
  actionText: { color: ACCENT, fontWeight: 'bold', fontSize: 13, marginLeft: 2 },
  linkText: { color: ACCENT, textDecorationLine: 'underline', fontWeight: 'bold' },
  slotBtn: {
    backgroundColor: WHITE,
    borderColor: ACCENT,
    borderWidth: 1.2,
    borderRadius: 8,
    marginTop: 7,
    padding: 8,
    alignItems: 'center',
  },
  selectedSlotBtn: {
    backgroundColor: ACCENT,
    borderColor: GOLD,
  },
  dialogInput: { marginBottom: 7, backgroundColor: WHITE },
  referralLimitRow: {
    alignItems: "center",
    marginBottom: 6,
    marginTop: -5,
  },
});