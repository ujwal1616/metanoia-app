import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

type Step2Props = {
  onNext?: () => void;
};

const PRONOUNS = [
  "He/Him",
  "She/Her",
  "They/Them",
  "He/They",
  "She/They",
  "Prefer not to say",
];

function getAgeFromBday(birthday: string): number | undefined {
  const match = birthday.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!match) return undefined;
  const [_, d, m, y] = match;
  const dob = new Date(`${y}-${m}-${d}`);
  if (isNaN(dob.valueOf())) return undefined;
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export default function Step2({ onNext }: Step2Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [fullName, setFullName] = useState(answers.fullName || "");
  const [nickname, setNickname] = useState(answers.nickname || "");
  const [birthday, setBirthday] = useState(answers.birthday || "");
  const [pronouns, setPronouns] = useState(answers.pronouns || "");
  const [showAge, setShowAge] = useState(answers.showAge ?? true);
  const [touched, setTouched] = useState(false);
  const [step2TipsDismissed, setStep2TipsDismissed] = useState(answers.step2TipsDismissed ?? false);

  const age = getAgeFromBday(birthday);

  const progressPercent = 2 / 9;

  const isValidBirthday = birthday.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/) && !!age && age > 10 && age < 80;
  const canContinue = fullName.trim().length >= 2 && isValidBirthday;

  const handleNext = () => {
    setAnswer("fullName", fullName.trim());
    setAnswer("birthday", birthday.trim());
    setAnswer("age", age);
    setAnswer("nickname", nickname.trim() || undefined);
    setAnswer("pronouns", pronouns || undefined);
    setAnswer("showAge", showAge);
    setAnswer("step2TipsDismissed", step2TipsDismissed);
    onNext && onNext();
  };

  return (
    <div style={{
      maxWidth: 440,
      margin: "0 auto",
      background: "#F6F6FD",
      borderRadius: 18,
      padding: 28,
      boxShadow: "0 8px 32px #6c47ff22"
    }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          width: "100%",
          height: 8,
          background: "#ece3ff",
          borderRadius: 9,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progressPercent * 100}%`,
            height: 8,
            background: "#6c47ff",
            borderRadius: 9,
            transition: "width 0.3s"
          }} />
        </div>
      </div>
      <h2 style={{ color: "#6c47ff", marginBottom: 16, fontWeight: 700, fontSize: 22 }}>
        Let’s get to know you — what should we call you when we fall in love with your profile?
      </h2>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, color: "#232323", fontSize: 16 }}>
          Your full name <span style={{ color: "#B88908" }}>*</span>
        </label>
        <input
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          style={{
            width: "100%",
            marginTop: 6,
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid #DDD",
            fontSize: 16,
            outline: "none",
            marginBottom: 8
          }}
          maxLength={40}
          onBlur={() => setTouched(true)}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, color: "#232323", fontSize: 16 }}>
          What do friends call you? <span style={{ color: "#888", fontWeight: 400 }}>(nickname, optional)</span>
        </label>
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="e.g. Pri"
          style={{
            width: "100%",
            marginTop: 6,
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid #EEE",
            fontSize: 16,
            outline: "none",
            marginBottom: 8
          }}
          maxLength={18}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600, color: "#232323", fontSize: 16 }}>
          Your bday? <span style={{ color: "#B88908" }}>*</span>
        </label>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <input
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            placeholder="DD/MM/YYYY"
            style={{
              flex: 1,
              marginTop: 6,
              padding: "13px 14px",
              borderRadius: 10,
              border: "1.5px solid #DDD",
              fontSize: 16,
              outline: "none",
              marginBottom: 8
            }}
            maxLength={10}
            pattern="\d{2}/\d{2}/\d{4}"
            onBlur={() => setTouched(true)}
          />
          <span style={{ color: "#6c47ff", fontSize: 15, fontWeight: 600, alignSelf: "center" }}>
            {isValidBirthday && age ? `🎂 ${age} yrs` : ""}
          </span>
        </div>
        <div style={{ fontSize: 13, color: isValidBirthday ? "#18a957" : "#B88908", marginBottom: 2 }}>
          Age check — because sometimes experience isn’t just in the resume.
        </div>
        {!isValidBirthday && birthday && (
          <div style={{ color: "#ff4444", fontSize: 13, marginTop: 2 }}>
            Please enter a valid date (DD/MM/YYYY) and age between 10 and 80.
          </div>
        )}
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: 600, color: "#232323", fontSize: 16 }}>
          Pronouns <span style={{ color: "#888", fontWeight: 400 }}>(optional)</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {PRONOUNS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPronouns(pronouns === p ? "" : p)}
              style={{
                borderRadius: 8,
                border: pronouns === p ? "2px solid #6c47ff" : "2px solid #ece3ff",
                background: pronouns === p ? "#ece3ff" : "#fff",
                color: "#6c47ff",
                padding: "6px 16px",
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer"
              }}
            >{p}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="checkbox"
          checked={showAge}
          onChange={e => setShowAge(e.target.checked)}
          style={{ marginRight: 7 }}
        />
        <span style={{ color: "#232323", fontWeight: 500 }}>
          Show my age on my profile (recommended)
        </span>
      </div>
      {/* Dismissable tips */}
      {!step2TipsDismissed && (
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
              onClick={() => setStep2TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>First names help us personalize your experience (and your future messages!).</li>
            <li>We never show your full bday, just your age (unless you turn off “show age”).</li>
            <li>Adding pronouns helps everyone feel welcome.</li>
          </ul>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={!canContinue}
        style={{
          width: "100%",
          background: !canContinue ? "#DDD" : "#6c47ff",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: !canContinue ? "not-allowed" : "pointer",
          boxShadow: "0 2px 16px #6c47ff22",
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && !canContinue && (
        <div style={{ color: "#B88908", marginTop: 10, fontSize: 14 }}>
          Please enter your full name and a valid birthday.
        </div>
      )}
    </div>
  );
}