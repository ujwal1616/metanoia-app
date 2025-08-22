import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Surface,
  HelperText,
  Divider,
  IconButton,
  Portal,
  Dialog,
  ProgressBar,
} from 'react-native-paper';
import { OnboardingContext } from '../OnboardingContext';

function isValidVideoUrl(url: string) {
  if (!url) return true;
  return (
    /^https?:\/\/\S+\.\S+/.test(url) &&
    (
      /\.(mp4|mov|webm|m4v|avi)$/i.test(url) ||
      /(youtube\.com|youtu\.be|vimeo\.com|loom\.com|drive\.google\.com|dropbox\.com)/i.test(url)
    )
  );
}
function isValidThumbnailUrl(url: string) {
  if (!url) return true;
  return /^https?:\/\/\S+\.(jpg|jpeg|png|gif)$/i.test(url);
}

export default function Step10({
  onNext,
  priorVideoGreetingUrl,
}: {
  onNext?: () => void;
  priorVideoGreetingUrl?: string;
}) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [videoGreetingUrl, setVideoGreetingUrl] = useState(answers.videoGreetingUrl || "");
  const [touched, setTouched] = useState(false);

  // Advanced fields
  const [videoCaption, setVideoCaption] = useState(answers.videoCaption || "");
  const [showVideoOnCard, setShowVideoOnCard] = useState(answers.showVideoOnCard ?? true);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(answers.videoThumbnailUrl || "");
  const [transcript, setTranscript] = useState(answers.transcript || "");
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoTipsDismissed, setVideoTipsDismissed] = useState(answers.videoTipsDismissed ?? false);
  const [showMore, setShowMore] = useState(false);

  const isValid = isValidVideoUrl(videoGreetingUrl);
  const isValidThumbnail = isValidThumbnailUrl(videoThumbnailUrl);

  // Progress bar percent (simulate 95% for example)
  const progressPercent = 0.95;

  const handleNextStep = () => {
    setAnswer("videoGreetingUrl", videoGreetingUrl);
    setAnswer("videoCaption", videoCaption.trim());
    setAnswer("showVideoOnCard", showVideoOnCard);
    setAnswer("videoThumbnailUrl", videoThumbnailUrl.trim());
    setAnswer("transcript", transcript.trim());
    setAnswer("videoTipsDismissed", videoTipsDismissed);
    onNext && onNext();
  };

  const handleSkip = () => {
    setAnswer("videoGreetingUrl", "");
    setAnswer("videoCaption", "");
    setAnswer("showVideoOnCard", true);
    setAnswer("videoThumbnailUrl", "");
    setAnswer("transcript", "");
    setAnswer("videoTipsDismissed", true);
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
          <ProgressBar progress={progressPercent} color="#B88908" style={styles.progressBar} />
          <Text style={styles.progressLabel}>Step 10 of 10 – Finish to unlock swiping</Text>
        </View>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Say hi in 5 seconds <Text style={{ color: "#B88908" }}>🎥</Text>
          </Text>
        </Surface>
        <Text style={styles.label}>
          Upload or link a short video greeting for candidates (optional but highly recommended).
        </Text>
        <Text style={styles.benefitText}>
          💡 Video greetings get 40% more candidate engagement!
        </Text>
        <Divider style={{ marginVertical: 10 }} />

        {/* Suggest previous video */}
        {priorVideoGreetingUrl && !videoGreetingUrl && (
          <Button
            icon="history"
            onPress={() => setVideoGreetingUrl(priorVideoGreetingUrl)}
            style={{ marginBottom: 5 }}
            mode="outlined"
          >
            Use your last video greeting
          </Button>
        )}

        <TextInput
          label="Paste your video URL"
          value={videoGreetingUrl}
          onChangeText={text => {
            setVideoGreetingUrl(text);
            setTouched(true);
          }}
          mode="outlined"
          placeholder="https://youtu.be/..."
          autoCapitalize="none"
          autoCorrect={false}
          left={<TextInput.Icon icon="link-variant" />}
          right={
            videoGreetingUrl && isValid ? (
              <TextInput.Icon
                icon="open-in-new"
                onPress={() => Linking.openURL(videoGreetingUrl)}
                forceTextInputFocus={false}
              />
            ) : undefined
          }
          error={touched && !isValid}
          onBlur={() => setTouched(true)}
          style={styles.input}
        />
        <Button
          icon="video"
          mode="outlined"
          onPress={() => alert("In-app recording coming soon!")}
          style={{ marginTop: 5, marginBottom: 5 }}
        >
          Record a video now (Coming soon)
        </Button>
        <HelperText type="info" visible={!!videoGreetingUrl}>
          Accepts YouTube, Vimeo, Loom, Google Drive, Dropbox, or direct video links (mp4, mov, webm, etc).
        </HelperText>
        <HelperText type="error" visible={touched && !isValid}>
          Please enter a valid video URL.
        </HelperText>

        {/* Show/Hide advanced fields */}
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
            {/* Video caption */}
            <TextInput
              label="Short caption for your video (optional)"
              value={videoCaption}
              onChangeText={setVideoCaption}
              mode="outlined"
              placeholder="e.g. Meet your future team lead!"
              style={styles.input}
              maxLength={60}
            />
            <HelperText type="info" visible={videoCaption.length > 0}>
              {videoCaption.length}/60 characters
            </HelperText>

            {/* Show video on card */}
            <View style={styles.row}>
              <Button
                mode={showVideoOnCard ? "contained" : "outlined"}
                style={[styles.toggleBtn, showVideoOnCard && { backgroundColor: "#B88908" }]}
                onPress={() => setShowVideoOnCard(s => !s)}
                icon={showVideoOnCard ? "eye" : "eye-off"}
              >
                {showVideoOnCard ? "Show video on job card" : "Hide video on card"}
              </Button>
            </View>

            {/* Video thumbnail */}
            <TextInput
              label="Custom thumbnail image URL (optional)"
              value={videoThumbnailUrl}
              onChangeText={setVideoThumbnailUrl}
              mode="outlined"
              placeholder="https://... .jpg or .png"
              left={<TextInput.Icon icon="image-outline" />}
              error={!!videoThumbnailUrl && !isValidThumbnail}
              style={styles.input}
            />
            {videoThumbnailUrl && isValidThumbnail && (
              <View style={{ alignItems: "center", marginBottom: 7 }}>
                <Image
                  source={{ uri: videoThumbnailUrl }}
                  style={{ width: 120, height: 68, borderRadius: 7, marginTop: 4, borderWidth: 1, borderColor: "#ece3ff" }}
                  resizeMode="cover"
                />
              </View>
            )}
            <HelperText type="error" visible={!!videoThumbnailUrl && !isValidThumbnail}>
              Please enter a valid image URL (jpg, jpeg, png, gif).
            </HelperText>

            {/* Transcript */}
            <Button
              mode="outlined"
              style={styles.transcriptBtn}
              onPress={() => setShowTranscript(t => !t)}
              icon={showTranscript ? "chevron-up" : "chevron-down"}
            >
              {showTranscript ? "Hide Transcript" : "Add/Edit Transcript (optional)"}
            </Button>
            {showTranscript && (
              <TextInput
                label="Transcript of your video"
                value={transcript}
                onChangeText={setTranscript}
                mode="outlined"
                placeholder="Write out your video text for accessibility"
                style={styles.input}
                multiline
                maxLength={500}
              />
            )}
          </>
        )}

        {/* Tips, can be dismissed */}
        {!videoTipsDismissed && (
          <Surface style={styles.tipsSurface}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.tipTitle}>Tips for your video:</Text>
              <IconButton icon="close" size={18} onPress={() => setVideoTipsDismissed(true)} />
            </View>
            <Text style={styles.tip}>• Keep it under 30 seconds</Text>
            <Text style={styles.tip}>• Introduce yourself and your company vibe</Text>
            <Text style={styles.tip}>• Be authentic – phone videos are great!</Text>
            <Text style={styles.tip}>• Use a clear background and good lighting</Text>
          </Surface>
        )}

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextStep}
          disabled={!!videoGreetingUrl && !isValid || !!videoThumbnailUrl && !isValidThumbnail}
        >
          Next
        </Button>
        <Button
          style={styles.skipBtn}
          onPress={handleSkip}
        >
          Skip for now
        </Button>
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
            A quick hello video adds a personal touch and helps attract the right candidates!
          </Text>
          <Text style={{ fontStyle: "italic", color: "#888", fontSize: 12, marginTop: 8 }}>
            “After adding a video, we saw more candidate engagement!” – Jane, Acme Corp
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
  benefitText: { color: "#18a957", fontWeight: "bold", fontSize: 13, marginBottom: 3 },
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
    fontWeight: "bold"
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  moreBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 14,
    fontWeight: "bold"
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
  tipsSurface: {
    backgroundColor: "#f6f4ff",
    borderRadius: 10,
    padding: 10,
    marginTop: 18,
    marginBottom: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 14,
    marginVertical: 6,
  },
  transcriptBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 14,
    borderColor: "#B88908",
    borderWidth: 1,
  },
});