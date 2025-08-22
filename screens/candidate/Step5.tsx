import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

type Step5Props = {
  onNext?: () => void;
};

function filterNonEmpty(arr: string[]) {
  return arr.filter((v) => v.trim().length > 0);
}

const SUGGESTED_ROLES = [
  "Frontend Engineer", "Backend Engineer", "Product Manager", "Designer", "Data Scientist", "DevOps", "QA", "Growth Marketer"
];

const SUGGESTED_HARD_SKILLS = [
  "React", "Python", "Java", "SQL", "Node.js", "AWS", "ML", "Figma", "C++"
];

const SUGGESTED_SOFT_SKILLS = [
  "Communication", "Leadership", "Empathy", "Critical Thinking", "Teamwork", "Adaptability", "Creativity", "Problem Solving"
];

const SUGGESTED_SOFTWARE = [
  "Figma", "Photoshop", "Excel", "Jira", "VS Code", "Sketch", "Notion", "Slack"
];

export default function Step5({ onNext }: Step5Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [roles, setRoles] = useState<string[]>(answers.roles?.length ? answers.roles : []);
  const [hardSkills, setHardSkills] = useState<string[]>(answers.hardSkills?.length ? answers.hardSkills : []);
  const [softSkills, setSoftSkills] = useState<string[]>(answers.softSkills?.length ? answers.softSkills : []);
  const [specificSkills, setSpecificSkills] = useState<string[]>(answers.specificSkills?.length ? answers.specificSkills : []);
  const [software, setSoftware] = useState<string[]>(answers.software?.length ? answers.software : []);
  const [otherStrengths, setOtherStrengths] = useState<string[]>(answers.otherStrengths?.length ? answers.otherStrengths : []);
  const [superpower, setSuperpower] = useState(answers.superpower || "");
  const [touched, setTouched] = useState(false);
  const [step5TipsDismissed, setStep5TipsDismissed] = useState(answers.step5TipsDismissed ?? false);
  const [showMore, setShowMore] = useState(false);

  // Progress bar (step 5/9, visual only)
  const progressPercent = 5 / 9;

  // Dynamic chip list helpers
  function DynamicChipInput({
    label,
    chips,
    setChips,
    suggestedChips,
    placeholder,
    minCount = 1,
    maxCount = 10,
    required = true,
  }: {
    label: string;
    chips: string[];
    setChips: (v: string[]) => void;
    suggestedChips?: string[];
    placeholder: string;
    minCount?: number;
    maxCount?: number;
    required?: boolean;
  }) {
    const [input, setInput] = useState("");

    const addChip = (val?: string) => {
      const value = (val ?? input).trim();
      if (
        value &&
        !chips.map((c) => c.toLowerCase()).includes(value.toLowerCase()) &&
        chips.length < maxCount
      ) {
        setChips([...chips, value]);
        setInput("");
      }
    };
    const removeChip = (chip: string) => setChips(chips.filter((c) => c !== chip));

    const showSuggestions =
      suggestedChips &&
      input &&
      suggestedChips.some(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !chips.map((c) => c.toLowerCase()).includes(s.toLowerCase())
      );

    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: "#6c47ff", marginBottom: 6 }}>{label}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 10,
              border: "1.5px solid #DDD",
              fontSize: 16,
              outline: "none",
              background: "#fff",
              fontWeight: 500,
            }}
            maxLength={32}
            onKeyDown={e => {
              if (e.key === "Enter") addChip();
            }}
            onBlur={() => setTouched(true)}
          />
          <button
            type="button"
            onClick={() => addChip()}
            disabled={!input.trim() || chips.length >= maxCount}
            style={{
              background: "#ece3ff",
              border: "none",
              borderRadius: 8,
              color: "#6c47ff",
              fontWeight: 600,
              padding: "7px 14px",
              cursor: input.trim() && chips.length < maxCount ? "pointer" : "not-allowed",
              fontSize: 15,
              transition: "background 0.14s",
            }}
          >
            Add
          </button>
        </div>
        {showSuggestions && (
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestedChips!.filter(
              s =>
                s.toLowerCase().includes(input.toLowerCase()) &&
                !chips.map((c) => c.toLowerCase()).includes(s.toLowerCase())
            ).slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addChip(s)}
                style={{
                  borderRadius: 8,
                  border: "1.5px solid #ece3ff",
                  background: "#f6f4ff",
                  color: "#6c47ff",
                  padding: "5px 12px",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {chips.map(chip => (
            <span
              key={chip}
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#ece3ff",
                color: "#6c47ff",
                borderRadius: 7,
                padding: "5px 14px",
                fontWeight: 600,
                fontSize: 15,
                marginRight: 3,
                marginBottom: 3,
              }}
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(chip)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6c47ff",
                  fontWeight: 700,
                  marginLeft: 5,
                  cursor: "pointer",
                  fontSize: 15,
                }}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {required && (
          <div style={{ color: chips.length === 0 ? "#B88908" : "#18a957", fontSize: 12, marginTop: 2 }}>
            {chips.length === 0
              ? `Add at least 1 ${label.toLowerCase().replace(/[^a-zA-Z ]/g, "")}`
              : `${chips.length} added`}
          </div>
        )}
      </div>
    );
  }

  const isValid =
    roles.length > 0 &&
    hardSkills.length > 0 &&
    softSkills.length > 0 &&
    specificSkills.length > 0;

  const handleNext = () => {
    setAnswer("roles", filterNonEmpty(roles));
    setAnswer("hardSkills", filterNonEmpty(hardSkills));
    setAnswer("softSkills", filterNonEmpty(softSkills));
    setAnswer("specificSkills", filterNonEmpty(specificSkills));
    setAnswer("software", filterNonEmpty(software));
    setAnswer("otherStrengths", filterNonEmpty(otherStrengths));
    setAnswer("superpower", superpower.trim() || undefined);
    setAnswer("step5TipsDismissed", step5TipsDismissed);
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
          marginBottom: 18,
          fontWeight: 700,
          fontSize: 25,
          letterSpacing: 0.2,
        }}
      >
        Skills & Roles
      </h2>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 600, color: "#232323", marginBottom: 8 }}>
          What kind of roles make your heart race?
        </div>
        <DynamicChipInput
          label=""
          chips={roles}
          setChips={setRoles}
          suggestedChips={SUGGESTED_ROLES}
          placeholder="e.g. Product Designer, Data Scientist"
        />
      </div>
      <DynamicChipInput
        label="Hard Skills"
        chips={hardSkills}
        setChips={setHardSkills}
        suggestedChips={SUGGESTED_HARD_SKILLS}
        placeholder="e.g. Python, React"
      />
      <DynamicChipInput
        label="Soft Skills"
        chips={softSkills}
        setChips={setSoftSkills}
        suggestedChips={SUGGESTED_SOFT_SKILLS}
        placeholder="e.g. Empathy, Leadership"
      />
      <DynamicChipInput
        label="Specific Skills"
        chips={specificSkills}
        setChips={setSpecificSkills}
        suggestedChips={[]}
        placeholder="e.g. Kubernetes, Animation, SEO"
      />
      <DynamicChipInput
        label="Software Proficiency (optional)"
        chips={software}
        setChips={setSoftware}
        suggestedChips={SUGGESTED_SOFTWARE}
        placeholder="e.g. Figma, Notion"
        minCount={0}
      />
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
        {showMore ? "Hide extra fields" : "Add strengths & your superpower"}
      </button>
      {showMore && (
        <div style={{ marginBottom: 12 }}>
          <DynamicChipInput
            label="Other Strengths (optional)"
            chips={otherStrengths}
            setChips={setOtherStrengths}
            suggestedChips={["Public Speaking", "Mentoring", "Resilience", "Emotional Intelligence", "Curiosity", "Storytelling"]}
            placeholder="e.g. Mentoring, Storytelling"
            minCount={0}
          />
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: "#6c47ff", marginBottom: 6 }}>
              Your superpower <span style={{ color: "#888", fontWeight: 400, fontSize: 13 }}>(in one line, optional)</span>
            </div>
            <input
              value={superpower}
              onChange={e => setSuperpower(e.target.value)}
              placeholder="e.g. I turn chaos into clarity"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: "1.5px solid #ece3ff",
                marginBottom: 2,
                fontSize: 16,
                outline: "none",
                background: "#fff",
                fontWeight: 500,
              }}
              maxLength={64}
            />
          </div>
        </div>
      )}
      {/* Dismissable tips */}
      {!step5TipsDismissed && (
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
              onClick={() => setStep5TipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>Mix technical and people skills for more matches.</li>
            <li>Soft skills and superpowers often set you apart!</li>
            <li>Chips auto-suggest top skills—add your own, too.</li>
          </ul>
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={!isValid}
        style={{
          width: "100%",
          background: isValid ? "#B88908" : "#FFD70066",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: isValid ? "pointer" : "not-allowed",
          boxShadow: "0 2px 16px #FFD70022",
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && !isValid && (
        <div style={{ color: "#B88908", marginTop: 12, fontSize: 14 }}>
          Please fill in at least one for each required section.
        </div>
      )}
    </div>
  );
}