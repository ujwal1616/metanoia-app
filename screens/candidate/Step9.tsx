import React, { useRef, useState, useContext } from "react";
import { OnboardingContext } from "../OnboardingContext";

function isValidUrl(url: string): boolean {
  return !url || /^https?:\/\/\S+\.\S+/.test(url);
}

function getDomainPlaceholder(domain: string) {
  switch (domain) {
    case "LinkedIn":
      return "Paste LinkedIn profile URL (e.g. https://linkedin.com/in/...)";
    case "Portfolio":
      return "Paste personal website or portfolio link";
    case "GitHub":
      return "Paste GitHub profile or repo (e.g. https://github.com/yourname)";
    case "Other":
      return "Paste any other relevant link (e.g. Medium, Dribbble, etc.)";
    default:
      return "Paste link";
  }
}

type Step8Props = {
  onNext?: () => void;
};

export default function Step8({ onNext }: Step8Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [cvUrl, setCvUrl] = useState(answers.cvUrl || "");
  const [linkedInUrl, setLinkedInUrl] = useState(answers.linkedInUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(answers.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(answers.githubUrl || "");
  const [otherLink, setOtherLink] = useState(answers.otherLink || "");
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [step8TipsDismissed, setStep8TipsDismissed] = useState(answers.step8TipsDismissed ?? false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Simulate file upload, set a fake URL
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setCvUrl(`https://files.example.com/${encodeURIComponent(file.name)}`);
      setUploading(false);
    }, 1200);
  };

  const isValid =
    !!cvUrl &&
    isValidUrl(cvUrl) &&
    isValidUrl(linkedInUrl) &&
    isValidUrl(portfolioUrl) &&
    isValidUrl(githubUrl) &&
    isValidUrl(otherLink);

  // Progress bar (step 8/9)
  const progressPercent = 8 / 9;

  const handleNext = () => {
    setAnswer("cvUrl", cvUrl);
    setAnswer("linkedInUrl", linkedInUrl);
    setAnswer("portfolioUrl", portfolioUrl);
    setAnswer("githubUrl", githubUrl);
    setAnswer("otherLink", otherLink);
    setAnswer("step8TipsDismissed", step8TipsDismissed);
    onNext && onNext();
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        background: "#FFF9EC",
        borderRadius: 18,
        padding: 32,
        boxShadow: "0 8px 32px #FFD70033",
      }}
    >
      {/* Progress bar without numbers */}
      <div style={{ marginBottom: 18 }}>
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
          marginBottom: 14,
          fontWeight: 700,
          fontSize: 25,
        }}
      >
        Supporting links and documents
      </h2>
      <div style={{ marginBottom: 18, fontWeight: 600, color: "#232323" }}>
        Upload your CV <span style={{ fontWeight: 400, fontSize: 15 }}>(PDF, DOCX, or share link)</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
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
          Upload File
        </button>
        <span style={{ color: "#888", fontSize: 13 }}>or</span>
        <input
          type="text"
          value={cvUrl}
          onChange={e => setCvUrl(e.target.value)}
          placeholder="Paste CV link (Google Drive, Dropbox, etc.)"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1.5px solid #DDD",
            fontSize: 15,
            background: "#fff",
            outline: "none",
          }}
          onBlur={() => setTouched(true)}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.rtf"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
      </div>
      {uploading && (
        <div style={{ color: "#B88908", fontSize: 14, marginBottom: 6 }}>Uploading CV...</div>
      )}
      {cvUrl && (
        <div style={{ color: "#6c47ff", fontSize: 13, marginBottom: 12 }}>
          CV link: <a href={cvUrl} target="_blank" rel="noopener noreferrer">{cvUrl}</a>
        </div>
      )}

      {/* LinkedIn */}
      <div style={{ fontWeight: 600, color: "#232323", marginBottom: 5 }}>
        LinkedIn <span style={{ fontWeight: 400, fontSize: 15 }}>(optional)</span>
      </div>
      <input
        type="text"
        value={linkedInUrl}
        onChange={e => setLinkedInUrl(e.target.value)}
        placeholder={getDomainPlaceholder("LinkedIn")}
        style={{
          width: "100%",
          padding: "11px 13px",
          borderRadius: 9,
          border: "1.5px solid #DDD",
          fontSize: 15,
          background: "#fff",
          outline: "none",
          marginBottom: 12,
        }}
        onBlur={() => setTouched(true)}
      />

      {/* Portfolio */}
      <div style={{ fontWeight: 600, color: "#232323", marginBottom: 5 }}>
        Portfolio <span style={{ fontWeight: 400, fontSize: 15 }}>(optional)</span>
      </div>
      <input
        type="text"
        value={portfolioUrl}
        onChange={e => setPortfolioUrl(e.target.value)}
        placeholder={getDomainPlaceholder("Portfolio")}
        style={{
          width: "100%",
          padding: "11px 13px",
          borderRadius: 9,
          border: "1.5px solid #DDD",
          fontSize: 15,
          background: "#fff",
          outline: "none",
          marginBottom: 12,
        }}
        onBlur={() => setTouched(true)}
      />

      {/* GitHub */}
      <div style={{ fontWeight: 600, color: "#232323", marginBottom: 5 }}>
        GitHub <span style={{ fontWeight: 400, fontSize: 15 }}>(optional)</span>
      </div>
      <input
        type="text"
        value={githubUrl}
        onChange={e => setGithubUrl(e.target.value)}
        placeholder={getDomainPlaceholder("GitHub")}
        style={{
          width: "100%",
          padding: "11px 13px",
          borderRadius: 9,
          border: "1.5px solid #DDD",
          fontSize: 15,
          background: "#fff",
          outline: "none",
          marginBottom: 12,
        }}
        onBlur={() => setTouched(true)}
      />

      {/* Other link */}
      <div style={{ fontWeight: 600, color: "#232323", marginBottom: 5 }}>
        Other Link <span style={{ fontWeight: 400, fontSize: 15 }}>(optional)</span>
      </div>
      <input
        type="text"
        value={otherLink}
        onChange={e => setOtherLink(e.target.value)}
        placeholder={getDomainPlaceholder("Other")}
        style={{
          width: "100%",
          padding: "11px 13px",
          borderRadius: 9,
          border: "1.5px solid #DDD",
          fontSize: 15,
          background: "#fff",
          outline: "none",
          marginBottom: 16,
        }}
        onBlur={() => setTouched(true)}
      />

      <button
        onClick={handleNext}
        disabled={!isValid || uploading}
        style={{
          width: "100%",
          background: isValid && !uploading ? "#B88908" : "#FFD70066",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: isValid && !uploading ? "pointer" : "not-allowed",
          boxShadow: "0 2px 16px #FFD70022",
          marginTop: 8,
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && !cvUrl && (
        <div style={{ color: "#B88908", marginTop: 12, fontSize: 14 }}>
          Please upload or provide a link to your CV.
        </div>
      )}
      {touched && cvUrl && !isValidUrl(cvUrl) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please provide a valid CV link (should start with http(s)://).
        </div>
      )}
      {(linkedInUrl && !isValidUrl(linkedInUrl)) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please provide a valid LinkedIn URL.
        </div>
      )}
      {(portfolioUrl && !isValidUrl(portfolioUrl)) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please provide a valid portfolio URL.
        </div>
      )}
      {(githubUrl && !isValidUrl(githubUrl)) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please provide a valid GitHub URL.
        </div>
      )}
      {(otherLink && !isValidUrl(otherLink)) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please provide a valid link.
        </div>
      )}
      {!step8TipsDismissed && (
        <div style={{
          background: "#f6f4ff",
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
          marginTop: 10,
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
              onClick={() => setStep8TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>Portfolio, LinkedIn, and GitHub links help recruiters get to know you better.</li>
            <li>Even if you have no portfolio, a GitHub or Dribbble link can show your work.</li>
            <li>Upload a CV or paste a secure link (Google Drive, Dropbox, etc.).</li>
            <li>File upload is simulated here; real app should store files securely!</li>
          </ul>
        </div>
      )}
      <div style={{ color: "#888", fontSize: 13, marginTop: 16 }}>
        All links are optional except your CV. Make sure links are shareable!
      </div>
    </div>
  );
}