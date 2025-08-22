import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

type Step3Props = {
  onNext?: () => void;
};

const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "male", label: "Man" },
  { value: "nonbinary", label: "Nonbinary" },
  { value: "prefer_not_say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

const PRONOUNS = [
  "She/Her",
  "He/Him",
  "They/Them",
  "She/They",
  "He/They",
  "Prefer not to say",
];

export default function Step3({ onNext }: Step3Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [gender, setGender] = useState(
    GENDERS.some(g => g.value === answers.gender) ? answers.gender : (answers.gender ? "other" : "")
  );
  const [customGender, setCustomGender] = useState(
    gender === "other" && answers.gender ? answers.gender : ""
  );
  const [genderPronoun, setGenderPronoun] = useState(answers.genderPronoun || "");
  const [touched, setTouched] = useState(false);
  const [showPronouns, setShowPronouns] = useState(!!answers.genderPronoun);
  const [step3TipsDismissed, setStep3TipsDismissed] = useState(answers.step3TipsDismissed ?? false);

  const handleSelect = (value: string) => {
    setGender(value);
    setTouched(true);
    if (value !== "other") setCustomGender("");
  };

  // Progress bar (step 3/9, visual only, no numbers)
  const progressPercent = 3 / 9;

  const canContinue =
    gender &&
    (gender !== "other" || customGender.trim().length >= 2);

  const handleNext = () => {
    setAnswer("gender", gender === "other" ? customGender.trim() : gender);
    setAnswer("genderPronoun", genderPronoun || undefined);
    setAnswer("step3TipsDismissed", step3TipsDismissed);
    onNext && onNext();
  };

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        background: "#FFF9EC",
        borderRadius: 18,
        padding: 28,
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
      <h2 style={{ color: "#6c47ff", marginBottom: 18, fontWeight: 700, fontSize: 25 }}>
        Which gender best describes you?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 10 }}>
        {GENDERS.map((g) => (
          <label
            key={g.value}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 12,
              cursor: "pointer",
              background: gender === g.value ? "#ece3ff" : "#fff",
              border: `2px solid ${gender === g.value ? "#6c47ff" : "#eee"}`,
              fontWeight: gender === g.value ? 700 : 500,
              fontSize: 17,
              boxShadow: gender === g.value ? "0 0 0 2px #6c47ff22" : "none",
              transition: "all 0.15s",
              position: "relative"
            }}
          >
            <input
              type="radio"
              value={g.value}
              checked={gender === g.value}
              onChange={() => handleSelect(g.value)}
              style={{ marginRight: 12, accentColor: "#6c47ff" }}
            />
            {g.label}
            {gender === g.value &&
              <span style={{
                marginLeft: "auto",
                color: "#6c47ff",
                fontWeight: 700,
                fontSize: 16,
                marginRight: 6,
              }}>✓</span>
            }
          </label>
        ))}
      </div>
      {gender === "other" && (
        <input
          value={customGender}
          onChange={e => setCustomGender(e.target.value)}
          placeholder="Please specify (e.g. Agender, Genderqueer)"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1.5px solid #DDD",
            fontSize: 16,
            outline: "none",
            background: "#fff",
            margin: "10px 0 0 0",
            fontWeight: 500,
          }}
          maxLength={32}
        />
      )}
      <div style={{ color: "#888", fontSize: 13, margin: "10px 0 0 0" }}>
        We ask this so we can personalize your experience. It’s always private.
      </div>
      <button
        type="button"
        style={{
          background: "none",
          color: "#6c47ff",
          border: "none",
          padding: 0,
          marginBottom: 8,
          marginTop: 10,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 14,
          textDecoration: "underline"
        }}
        onClick={() => setShowPronouns((p) => !p)}
      >
        {showPronouns ? "Hide pronouns" : "Add pronouns (optional)"}
      </button>
      {showPronouns && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6, marginBottom: 8 }}>
          {PRONOUNS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setGenderPronoun(genderPronoun === p ? "" : p)}
              style={{
                borderRadius: 8,
                border: genderPronoun === p ? "2px solid #6c47ff" : "2px solid #ece3ff",
                background: genderPronoun === p ? "#ece3ff" : "#fff",
                color: "#6c47ff",
                padding: "6px 16px",
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer"
              }}
            >{p}</button>
          ))}
        </div>
      )}
      {/* Dismissable tips */}
      {!step3TipsDismissed && (
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
              onClick={() => setStep3TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>You control what’s shown to employers.</li>
            <li>We share only what helps you get matched, never your full data.</li>
            <li>Pronouns help us and companies address you respectfully.</li>
          </ul>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={!canContinue}
        style={{
          width: "100%",
          background: !canContinue ? "#FFD70066" : "#B88908",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: !canContinue ? "not-allowed" : "pointer",
          boxShadow: "0 2px 16px #FFD70022",
          marginTop: 20,
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && !canContinue && (
        <div style={{ color: "#B88908", marginTop: 10, fontSize: 14 }}>
          Please select your gender or specify it.
        </div>
      )}
    </div>
  );
}