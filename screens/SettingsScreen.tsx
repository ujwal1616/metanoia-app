import React, { useState } from 'react';
import { View, StyleSheet, Image, Linking, Appearance } from 'react-native';
import {
  Text,
  Switch,
  Button,
  Divider,
  List,
  Surface,
  Snackbar,
  IconButton,
  Portal,
  Dialog,
} from 'react-native-paper';

// GOLD-WHITE THEME COLORS
const GOLD = "#B88908";
const ACCENT = "#6c47ff";
const GOLD_ACCENT = "#FFD700";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const OFF_WHITE = "#f6f4ff";
const DARK_TEXT = "#232323";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [snackbar, setSnackbar] = useState({ msg: '', visible: false });
  const [showAbout, setShowAbout] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate sign out and delete
  const handleSignOut = () => {
    setShowSignOutConfirm(false);
    setSnackbar({ msg: 'Signed out!', visible: true });
    // Add actual sign out logic and navigation here!
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    setSnackbar({ msg: 'Account deleted!', visible: true });
    // Add delete account logic here!
  };

  // Open support email
  const handleSupportEmail = () => {
    Linking.openURL('mailto:support@metanoia.com?subject=Metanoia%20Support');
  };

  // Open privacy/terms (replace with your URLs)
  const openPrivacy = () => {
    Linking.openURL('https://www.metanoia.com/privacy');
  };
  const openTerms = () => {
    Linking.openURL('https://www.metanoia.com/terms');
  };

  // Simulate dark mode switch (replace with actual theme logic in your app)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    setSnackbar({ msg: `Dark mode ${!darkMode ? "enabled" : "disabled"}!`, visible: true });
    // TODO: connect to theme context/provider if used
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.headerBar}>
        <Image
          source={require('../assets/images/metanoia-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="titleLarge" style={styles.header}>
          Settings
        </Text>
        <IconButton icon="information-outline" size={26} onPress={() => setShowAbout(true)} />
      </Surface>
      <Divider style={styles.divider} />

      <List.Section style={styles.listSection}>
        <List.Item
          title="Enable Notifications"
          description="Get updates about new matches & messages."
          left={() => <List.Icon icon="bell" color={GOLD} />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => {
                setNotificationsEnabled(val);
                setSnackbar({
                  msg: val ? "Notifications enabled!" : "Notifications disabled.",
                  visible: true
                });
              }}
              color={GOLD}
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listTitle}
        />
        <List.Item
          title="Dark Mode"
          description="Reduce eye strain at night."
          left={() => <List.Icon icon="theme-light-dark" color={ACCENT} />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              color={ACCENT}
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listTitle}
        />
        <List.Item
          title="Change Password"
          description="Update your account password."
          left={() => <List.Icon icon="lock-reset" color={GOLD_ACCENT} />}
          onPress={() => setSnackbar({ msg: "Password reset link sent to your email.", visible: true })}
          style={styles.listItem}
          titleStyle={styles.listTitle}
        />
        <List.Item
          title="Help & Support"
          description="Contact our support team."
          left={() => <List.Icon icon="help-circle" color={ACCENT} />}
          onPress={handleSupportEmail}
          style={styles.listItem}
          titleStyle={styles.listTitle}
        />
      </List.Section>

      <Divider style={styles.divider} />

      <Button
        mode="contained"
        icon="logout"
        style={styles.signOutBtn}
        buttonColor={GOLD}
        textColor={WHITE}
        onPress={() => setShowSignOutConfirm(true)}
      >
        Sign Out
      </Button>

      <Button
        icon="delete"
        mode="outlined"
        textColor="#b92c2c"
        style={styles.deleteBtn}
        onPress={() => setShowDeleteConfirm(true)}
      >
        Delete Account
      </Button>

      <Button
        icon="information"
        mode="text"
        textColor={ACCENT}
        onPress={() => setShowAbout(true)}
        style={styles.aboutBtn}
      >
        About Metanoia
      </Button>

      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <Text
          style={styles.legalLink}
          onPress={openPrivacy}
        >
          Privacy Policy
        </Text>
        <Text
          style={styles.legalLink}
          onPress={openTerms}
        >
          Terms & Conditions
        </Text>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={1800}
        style={{
          backgroundColor: GOLD,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: WHITE, fontWeight: 'bold' }}>{snackbar.msg}</Text>
      </Snackbar>

      {/* About Dialog */}
      <Portal>
        <Dialog visible={showAbout} onDismiss={() => setShowAbout(false)}>
          <Dialog.Title>About Metanoia</Dialog.Title>
          <Dialog.Content>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../assets/images/metanoia-logo.png')}
                style={{ width: 50, height: 50, marginBottom: 8 }}
                resizeMode="contain"
              />
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: GOLD, marginBottom: 2 }}>Metanoia</Text>
              <Text style={{ color: DARK_TEXT, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
                Premium hiring & career platform. v1.0.0{'\n'}© {new Date().getFullYear()} Metanoia Team
              </Text>
              <Text style={{ fontSize: 13, color: ACCENT, marginBottom: 8, textAlign: 'center' }}>
                For support: support@metanoia.com
              </Text>
              <Button
                icon="email"
                onPress={handleSupportEmail}
                style={{ marginTop: 2 }}
                textColor={ACCENT}
                mode="outlined"
              >
                Contact Support
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAbout(false)} textColor={GOLD} icon="close">
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Sign Out confirmation */}
        <Dialog visible={showSignOutConfirm} onDismiss={() => setShowSignOutConfirm(false)}>
          <Dialog.Title>Sign Out?</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSignOutConfirm(false)}>Cancel</Button>
            <Button onPress={handleSignOut} textColor={GOLD} icon="logout">
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete Account confirmation */}
        <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
          <Dialog.Title>Delete Account?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: "#b92c2c", fontWeight: "bold", marginBottom: 4 }}>
              This action is irreversible!
            </Text>
            <Text>All your data will be permanently deleted. Are you sure?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button onPress={handleDeleteAccount} textColor="#b92c2c" icon="delete">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: OFF_WHITE },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    padding: 12,
    borderRadius: 18,
    elevation: 4,
    marginBottom: 10,
  },
  logo: { width: 40, height: 40, marginRight: 10 },
  header: { flex: 1, fontWeight: 'bold', color: GOLD, textAlign: 'center' },
  divider: { marginVertical: 12, backgroundColor: GOLD_ACCENT + '66', height: 1.5 },
  listSection: { backgroundColor: CARD_BG, borderRadius: 14, marginVertical: 6, elevation: 2 },
  listItem: { borderRadius: 12, marginVertical: 2, backgroundColor: WHITE },
  listTitle: { color: DARK_TEXT, fontWeight: 'bold' },
  signOutBtn: { marginTop: 28, borderRadius: 24, elevation: 2, paddingVertical: 5 },
  deleteBtn: {
    marginTop: 12,
    borderRadius: 24,
    elevation: 0,
    borderColor: "#b92c2c",
    borderWidth: 1.2,
    paddingVertical: 5,
    backgroundColor: WHITE,
  },
  aboutBtn: { marginTop: 18, alignSelf: 'center' },
  legalLink: {
    color: ACCENT,
    textDecorationLine: 'underline',
    marginTop: 3,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.1,
  },
});