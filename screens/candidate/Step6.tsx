import React, { useRef, useState, useContext } from "react";
import { OnboardingContext } from "../OnboardingContext";

type Step6Props = {
  onNext?: () => void;
};

export default function Step6({ onNext }: Step6Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [introText, setIntroText] = useState(answers.introText || "");
  const [videoUrl, setVideoUrl] = useState(answers.videoUrl || "");
  const [videoPreview, setVideoPreview] = useState<string>(answers.videoUrl || "");
  const [videoCoverImage, setVideoCoverImage] = useState<string>(answers.videoCoverImage || "");
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [step6TipsDismissed, setStep6TipsDismissed] = useState(answers.step6TipsDismissed ?? false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Simulates uploading and getting a video URL
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const videoURL = URL.createObjectURL(file);
    setVideoUrl(videoURL);
    setVideoPreview(videoURL);
    setTimeout(() => setUploading(false), 1200);
  };

  // Simulates uploading and getting a cover image URL
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const coverURL = URL.createObjectURL(file);
    setVideoCoverImage(coverURL);
    setTimeout(() => setUploading(false), 800);
  };

  const handlePasteUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setVideoPreview(e.target.value);
  };

  const isValid = introText.trim().length > 0 && introText.length <= 100;

  // Progress bar (step 6/9, visual only)
  const progressPercent = 6 / 9;

  const handleNext = () => {
    setAnswer("introText", introText.trim());
    setAnswer("videoUrl", videoUrl);
    setAnswer("videoCoverImage", videoCoverImage);
    setAnswer("step6TipsDismissed", step6TipsDismissed);
    onNext && onNext();
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#FFF9EC",
        borderRadius: 18,
        padding: 32,
        boxShadow: "0 8px 32px #FFD70033",
      }}
    >
      {/* Progress bar (visual only, no numbers) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          width: "100%",
          height: 8,
          background: "#efece7",
          borderRadius: 9,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progressPercent * 100}%`,
            height: 8,
            background: "#B88908",
            borderRadius: 9,
            transition: "width 0.3s"
          }} />
        </div>
      </div>
      <h2
        style={{
          color: "#B88908",
          marginBottom: 12,
          fontWeight: 700,
          fontSize: 25,
        }}
      >
        Tell us about yourself!
      </h2>
      <div style={{ marginBottom: 18, color: "#232323", fontWeight: 600, fontSize: 17 }}>
        What sums up your vibe? <span style={{ fontWeight: 400, fontSize: 15 }}>(max 100 chars)</span>
      </div>
      <textarea
        maxLength={100}
        value={introText}
        onChange={e => setIntroText(e.target.value)}
        placeholder="Make it short, sweet, and unforgettable!"
        style={{
          width: "100%",
          minHeight: 60,
          padding: "13px 14px",
          borderRadius: 10,
          border: "1.5px solid #DDD",
          background: "#fff",
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 8,
          outline: "none",
          resize: "vertical",
        }}
        onBlur={() => setTouched(true)}
      />
      <div style={{ textAlign: "right", color: "#6c47ff", fontSize: 13, marginBottom: 12 }}>
        {introText.length}/100
      </div>
      <div style={{ fontWeight: 600, color: "#6c47ff", margin: "20px 0 7px 0" }}>
        Say hi to your future team — record or upload a short video greeting
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "#ece3ff",
            border: "none",
            borderRadius: 8,
            color: "#6c47ff",
            fontWeight: 600,
            padding: "9px 16px",
            cursor: "pointer",
            fontSize: 15,
            transition: "background 0.14s",
          }}
        >
          Upload Video
        </button>
        <span style={{ color: "#888", fontSize: 13 }}>or</span>
        <input
          type="text"
          value={videoUrl}
          onChange={handlePasteUrl}
          placeholder="Paste video URL"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1.5px solid #DDD",
            fontSize: 15,
            background: "#fff",
            outline: "none",
          }}
        />
        <input
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleVideoSelect}
        />
      </div>
      {uploading && (
        <div style={{ color: "#B88908", fontSize: 14, marginBottom: 6 }}>Uploading...</div>
      )}
      {videoPreview && (
        <div style={{ marginBottom: 12 }}>
          <video
            src={videoPreview}
            controls
            poster={videoCoverImage}
            style={{
              width: "100%",
              maxHeight: 220,
              borderRadius: 12,
              border: "1.5px solid #DDD",
              background: "#222",
              marginBottom: 6,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              style={{
                background: "#ece3ff",
                border: "none",
                borderRadius: 8,
                color: "#6c47ff",
                fontWeight: 600,
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 14,
                transition: "background 0.14s",
              }}
            >
              {videoCoverImage ? "Change Cover" : "Add Cover Image"}
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={coverInputRef}
              onChange={handleCoverSelect}
            />
            {videoCoverImage && (
              <>
                <span style={{ color: "#6c47ff", fontSize: 13 }}>Preview: </span>
                <img
                  src={videoCoverImage}
                  alt="Video cover"
                  style={{ height: 44, borderRadius: 8, border: "1.5px solid #ece3ff" }}
                />
              </>
            )}
          </div>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={!isValid || uploading}
        style={{
          width: "100%",
          background: !isValid || uploading ? "#FFD70066" : "#B88908",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: !isValid || uploading ? "not-allowed" : "pointer",
          boxShadow: "0 2px 16px #FFD70022",
          marginTop: 6,
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && !isValid && (
        <div style={{ color: "#B88908", marginTop: 10, fontSize: 14 }}>
          Please write something about yourself (max 100 characters).
        </div>
      )}
      <div style={{ color: "#888", fontSize: 13, marginTop: 14 }}>
        Video is optional but recommended. Accepted formats: mp4, webm, mov. Your video is private until you choose to make it public.
      </div>
      {!step6TipsDismissed && (
        <div style={{
          background: "#f6f4ff",
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
          marginTop: 2,
          boxShadow: "0 2px 6px #ece3ff44",
          fontSize: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: "#6c47ff" }}>Tips for this step:</span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 16,
                marginLeft: 10
              }}
              onClick={() => setStep6TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>Short, vivid intros stand out to teams and hiring managers.</li>
            <li>Video is optional but makes your profile 3x more likely to get a response.</li>
          </ul>
        </div>
      )}
    </div>
  );
}