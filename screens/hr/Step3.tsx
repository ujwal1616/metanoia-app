import React, { useRef, useState, useContext } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, IconButton, Portal, Dialog } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingContext } from '../OnboardingContext';

const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";

function isValidImageUrl(url: string) {
  return (
    !url ||
    /^https?:\/\/\S+\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff)$/i.test(url)
  );
}

function isValidWebsite(url: string) {
  return (
    !url ||
    /^https?:\/\/(www\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\/\S*)?$/i.test(url)
  );
}

export default function Step3({ onNext }: { onNext?: () => void }) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [brandImageUrl, setBrandImageUrl] = useState(answers.brandImageUrl || "");
  const [tagline, setTagline] = useState(answers.tagline || "");
  const [website, setWebsite] = useState(answers.website || "");
  const [about, setAbout] = useState(answers.about || "");
  const [featured, setFeatured] = useState(answers.featured || false);

  const [previewUrl, setPreviewUrl] = useState(answers.brandImageUrl || "");
  const [touched, setTouched] = useState({ brandImageUrl: false, tagline: false, website: false, about: false });

  const [imgDialog, setImgDialog] = useState(false);

  const isBrandImageValid = !!brandImageUrl && isValidImageUrl(brandImageUrl);
  const isWebsiteValid = isValidWebsite(website);

  const handleBrandUrlChange = (url: string) => {
    setBrandImageUrl(url);
    setPreviewUrl(url);
  };

  // For uploading logo from device
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setBrandImageUrl(result.assets[0].uri);
      setPreviewUrl(result.assets[0].uri);
    }
    setImgDialog(false);
  };

  const handleNextStep = () => {
    setAnswer("brandImageUrl", brandImageUrl.trim());
    setAnswer("tagline", tagline.trim());
    setAnswer("website", website.trim());
    setAnswer("about", about.trim());
    setAnswer("featured", featured);
    onNext && onNext();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Give us a face for the brand
            <Text style={{ color: GOLD }}> 🏷️</Text>
          </Text>
        </Surface>
        <View style={styles.logoUploadRow}>
          <Text style={{ fontWeight: 'bold', color: GOLD, marginBottom: 4 }}>Logo / Image</Text>
          <IconButton icon="camera" size={24} onPress={() => setImgDialog(true)} style={{ marginLeft: 0 }} />
        </View>
        <TextInput
          label="Paste Logo/Image URL"
          value={brandImageUrl}
          onChangeText={handleBrandUrlChange}
          mode="outlined"
          style={styles.input}
          onBlur={() => setTouched(t => ({ ...t, brandImageUrl: true }))}
          left={<TextInput.Icon icon="image-outline" />}
          error={touched.brandImageUrl && !isBrandImageValid}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <HelperText type="error" visible={touched.brandImageUrl && !isBrandImageValid}>
          Please provide a valid image URL (jpg, png, gif, etc.).
        </HelperText>
        {previewUrl && isValidImageUrl(previewUrl) && (
          <Surface style={styles.logoPreview}>
            <Image
              source={{ uri: previewUrl }}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </Surface>
        )}
        <TextInput
          label="Optional Tagline"
          value={tagline}
          onChangeText={setTagline}
          mode="outlined"
          style={styles.input}
          maxLength={60}
          left={<TextInput.Icon icon="format-quote-close" />}
          onBlur={() => setTouched(t => ({ ...t, tagline: true }))}
        />
        <HelperText type="info" visible={tagline.length > 0}>
          {tagline.length}/60 characters
        </HelperText>
        <TextInput
          label="Official Website (optional)"
          value={website}
          onChangeText={setWebsite}
          mode="outlined"
          style={styles.input}
          maxLength={70}
          left={<TextInput.Icon icon="web" />}
          onBlur={() => setTouched(t => ({ ...t, website: true }))}
          error={touched.website && !isWebsiteValid}
          autoCapitalize="none"
        />
        <HelperText type="error" visible={touched.website && !isWebsiteValid}>
          Please enter a valid website URL (must start with https://).
        </HelperText>
        <TextInput
          label="About Company (optional)"
          value={about}
          onChangeText={setAbout}
          mode="outlined"
          style={styles.input}
          multiline
          maxLength={280}
          left={<TextInput.Icon icon="information-outline" />}
          onBlur={() => setTouched(t => ({ ...t, about: true }))}
        />
        <HelperText type="info" visible={about.length > 0}>
          {about.length}/280 characters
        </HelperText>
        <View style={styles.featuredToggleRow}>
          <IconButton
            icon={({ color, size }) => (
              <TextInput.Icon
                icon={featured ? "star" : "star-outline"}
                color={featured ? GOLD_ACCENT : "#AAA"}
                size={26}
                style={{ margin: 0 }}
              />
            )}
            size={26}
            onPress={() => setFeatured(f => !f)}
            style={{ marginRight: 0 }}
          />
          <Text style={{ color: GOLD, fontWeight: "bold", marginLeft: 4 }}>
            Mark as Featured Company
          </Text>
        </View>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={!isBrandImageValid}
        >
          Next
        </Button>
        {touched.brandImageUrl && !isBrandImageValid && (
          <Text style={{ color: GOLD, marginTop: 10, fontSize: 14 }}>
            Please upload or paste a valid brand logo/image URL.
          </Text>
        )}
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ color: "#888", fontSize: 13 }}>
            Logo helps candidates recognize your brand instantly.
          </Text>
        </View>
        <Portal>
          <Dialog visible={imgDialog} onDismiss={() => setImgDialog(false)}>
            <Dialog.Title>Upload Logo / Image</Dialog.Title>
            <Dialog.Content>
              <Button icon="camera" mode="outlined" onPress={pickImage}>Pick from Gallery</Button>
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
  logoPreview: {
    alignItems: 'center',
    backgroundColor: OFF_WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 3,
    elevation: 1,
  },
  logoImg: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 5,
  },
  logoUploadRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginLeft: 2
  },
  featuredToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
});