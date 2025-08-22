import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

// For web: enable geolocation and Google Places autocomplete
type Step1Props = {
  onNext?: () => void;
};

const COMPANY_TYPES = [
  { value: "mnc", label: "MNC", description: "Large multinational companies" },
  { value: "middle_enterprise", label: "Medium Enterprise", description: "Established, growing businesses" },
  { value: "startup", label: "Startup", description: "Young, dynamic and fast-paced" },
  { value: "open_to_all", label: "Open to All", description: "I'm open to all company types" },
];

const SUGGESTED_LOCATIONS = [
  "Remote", "Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "USA", "UK", "Europe"
];

export default function Step1({ onNext }: Step1Props) {
  // Use onboarding context for global answers and validation
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [companyTypePreference, setCompanyTypePreference] = useState(answers.companyTypePreference || "");
  const [location, setLocation] = useState(answers.location || "");
  const [openToRemote, setOpenToRemote] = useState(answers.openToRemote ?? false);
  const [relocate, setRelocate] = useState(answers.relocate ?? false);
  const [whyLocation, setWhyLocation] = useState(answers.whyLocation || "");
  const [touched, setTouched] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [step1TipsDismissed, setStep1TipsDismissed] = useState(answers.step1TipsDismissed ?? false);

  // Try to fetch location using browser geolocation
  const handleDetectLocation = () => {
    setDetecting(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          let loc = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || "";
          if (data.display_name) loc = data.display_name;
          setLocation(loc);
        } catch (e) {
          setGeoError("Unable to retrieve your location.");
        }
        setDetecting(false);
      },
      (error) => {
        setGeoError("Unable to detect location: " + error.message);
        setDetecting(false);
      }
    );
  };

  // Progress bar (step 1/9) - only visual, no number
  const progressPercent = 1 / 9;

  // On Next: Save answers in context and continue
  const handleNext = () => {
    setAnswer("companyTypePreference", companyTypePreference);
    setAnswer("location", location);
    setAnswer("openToRemote", openToRemote);
    setAnswer("relocate", relocate);
    setAnswer("whyLocation", whyLocation.trim());
    setAnswer("step1TipsDismissed", step1TipsDismissed);
    onNext && onNext();
  };

  return (
    <div style={{
      maxWidth: 440,
      margin: "0 auto",
      background: "#FFF9EC",
      borderRadius: 18,
      padding: 28,
      boxShadow: "0 8px 32px #FFD70033"
    }}>
      {/* Progress bar (visual only) */}
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
      <h2 style={{ color: "#B88908", marginBottom: 18, fontWeight: 700, fontSize: 26 }}>
        What kind of company would you thrive at?
      </h2>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginBottom: 24,
      }}>
        {COMPANY_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setCompanyTypePreference(type.value);
              setTouched(true);
            }}
            type="button"
            style={{
              border: "2px solid",
              borderColor: companyTypePreference === type.value ? "#B88908" : "#EEE",
              background: companyTypePreference === type.value ? "#FFD70022" : "#FFF",
              color: "#232323",
              borderRadius: 12,
              padding: "16px 16px 12px 16px",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
              boxShadow: companyTypePreference === type.value ? "0 0 0 2px #FFD70099" : "none",
              transition: "border 0.15s, background 0.15s, box-shadow 0.18s",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 17 }}>{type.label}</span>
            <br />
            <span style={{ fontSize: 13, color: "#615632", fontWeight: 400 }}>{type.description}</span>
            {companyTypePreference === type.value &&
              <span style={{
                marginLeft: 10,
                color: "#B88908",
                fontWeight: 700,
                fontSize: 16,
                float: "right"
              }}>✓</span>
            }
          </button>
        ))}
      </div>
      <h2 style={{ color: "#6c47ff", marginBottom: 8, fontWeight: 700, fontSize: 20 }}>
        Preferred Location?
      </h2>
      <div style={{
        display: "flex", flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 7
      }}>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Bangalore, Remote"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid #DDD",
            fontSize: 16,
            outline: "none",
          }}
          onBlur={() => setTouched(true)}
        />
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          title="Use my current location"
          style={{
            background: "#fff",
            border: "2px solid #B88908",
            borderRadius: 10,
            color: "#B88908",
            fontWeight: 600,
            padding: "8px 14px",
            cursor: detecting ? "wait" : "pointer",
            transition: "background 0.13s, border 0.13s",
          }}
        >
          {detecting ? "Detecting..." : "📍 Use GPS"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {SUGGESTED_LOCATIONS.map(loc => (
          <button
            key={loc}
            type="button"
            style={{
              borderRadius: 8,
              border: location.trim().toLowerCase() === loc.toLowerCase() ? "2px solid #6c47ff" : "2px solid #ece3ff",
              background: location.trim().toLowerCase() === loc.toLowerCase() ? "#ece3ff" : "#fff",
              color: "#6c47ff",
              padding: "6px 16px",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer"
            }}
            onClick={() => {
              setLocation(loc);
              setTouched(true);
            }}
          >
            {loc}
          </button>
        ))}
      </div>
      {geoError && (
        <div style={{ color: "#B88908", marginBottom: 6, fontSize: 14 }}>
          {geoError}
        </div>
      )}
      <div style={{
        display: "flex", flexDirection: "row",
        gap: 18, alignItems: "center", marginBottom: 8, marginTop: 4
      }}>
        <label style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={openToRemote}
            onChange={e => setOpenToRemote(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Open to Remote
        </label>
        <label style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={relocate}
            onChange={e => setRelocate(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Willing to Relocate
        </label>
      </div>
      <button
        type="button"
        style={{
          background: "none",
          color: "#6c47ff",
          border: "none",
          padding: 0,
          marginBottom: 8,
          marginTop: 0,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 14,
          textDecoration: "underline"
        }}
        onClick={() => setShowMore(m => !m)}
      >
        {showMore ? "Hide more options" : "Why this location?"}
      </button>
      {showMore && (
        <textarea
          value={whyLocation}
          onChange={e => setWhyLocation(e.target.value)}
          placeholder="Tell us why this location matters to you! (e.g. family, climate, tech scene, remote work, etc.)"
          rows={2}
          maxLength={100}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1.5px solid #ece3ff",
            padding: "10px",
            marginBottom: 8,
            fontSize: 15,
            color: "#232323",
          }}
        />
      )}

      {/* Dismissable tips */}
      {!step1TipsDismissed && (
        <div style={{
          background: "#f6f4ff",
          borderRadius: 10,
          padding: 10,
          marginBottom: 16,
          marginTop: 4,
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
              onClick={() => setStep1TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>Choose the company vibe that fits you best – there are no wrong answers!</li>
            <li>Location helps us show you jobs where you really want to work.</li>
            <li>Remote-friendly? Tick the box for more options!</li>
          </ul>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={!companyTypePreference || !location}
        style={{
          width: "100%",
          background: (!companyTypePreference || !location) ? "#FFD70066" : "#B88908",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: (!companyTypePreference || !location) ? "not-allowed" : "pointer",
          boxShadow: "0 2px 16px #FFD70022",
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && (!companyTypePreference || !location) && (
        <div style={{ color: "#B88908", marginTop: 10, fontSize: 14 }}>
          Please select a company type and enter your preferred location.
        </div>
      )}
    </div>
  );
}