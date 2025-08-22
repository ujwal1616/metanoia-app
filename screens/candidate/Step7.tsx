import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

// List of fun, job-related prompts
const PROMPTS = [
  "I see myself in the next 5 years…",
  "My biggest strength",
  "My biggest weakness",
  "My love language at work",
  "Proudest professional accomplishment",
  "Introverted or extroverted?",
  "Give me a deadline and I'll…",
  "If I could design my dream job, it would include…",
  "To me, success at work feels like…",
  "My toxic trait at work? I actually love Mondays.",
  "In group projects, I'm always the one who…",
  "The one tool or software I can't live without is…",
  "If I could have lunch with a CEO, I'd ask them…",
  "I think work should feel like…",
  "My biggest work superpower is...",
  "My most underrated skill is...",
  "I'm the go-to person for...",
  "My biggest professional challenge was...",
  "If I could master one new skill instantly...",
  "A coworker would describe me as...",
  "My favorite way to learn is...",
  "The work task I secretly love...",
  "If I could join any project in the world...",
  "I'm most motivated when...",
  "My dream team would...",
  "I bring energy to meetings by...",
  "I geek out over...",
  "My ideal project looks like...",
];

type Step7Props = {
  onNext?: () => void;
};

export default function Step7({ onNext }: Step7Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [selectedPrompts, setSelectedPrompts] = useState<string[]>(
    answers.selectedPrompts || []
  );
  const [promptAnswers, setPromptAnswers] = useState<{ [prompt: string]: string }>(
    answers.promptAnswers || {}
  );
  const [touched, setTouched] = useState(false);

  // Only allow exactly 3 prompts
  const togglePrompt = (prompt: string): void => {
    setTouched(false);
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts(selectedPrompts.filter((p: string) => p !== prompt));
      setPromptAnswers(prev => {
        const newObj = { ...prev };
        delete newObj[prompt];
        return newObj;
      });
    } else if (selectedPrompts.length < 3) {
      setSelectedPrompts([...selectedPrompts, prompt]);
    }
  };

  const canProceed =
    selectedPrompts.length === 3 &&
    selectedPrompts.every(p => (promptAnswers[p] || "").trim().length > 0);

  // Progress bar (step 7/9, visual only)
  const progressPercent = 7 / 9;

  const handleNext = () => {
    setAnswer("selectedPrompts", selectedPrompts);
    setAnswer("promptAnswers", promptAnswers);
    setAnswer(
      "promptAnswersArray",
      selectedPrompts.map(prompt => ({
        prompt,
        answer: promptAnswers[prompt] || "",
      }))
    );
    onNext && onNext();
  };

  return (
    <div
      style={{
        maxWidth: 540,
        margin: "0 auto",
        background: "#FFF9EC",
        borderRadius: 20,
        padding: 38,
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
          marginBottom: 16,
          fontWeight: 700,
          fontSize: 25,
          letterSpacing: 0.12,
        }}
      >
        Let’s break the ice
      </h2>
      <div style={{ color: "#232323", fontWeight: 600, marginBottom: 12, fontSize: 17 }}>
        Choose <b>exactly 3</b> prompts to answer
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginBottom: 22,
        }}
      >
        {PROMPTS.map((prompt) => (
          <div
            key={prompt}
            style={{
              background: selectedPrompts.includes(prompt) ? "#ece3ff" : "#fff",
              border: `2px solid ${selectedPrompts.includes(prompt) ? "#6c47ff" : "#eee"}`,
              borderRadius: 12,
              padding: "12px 16px",
              fontWeight: 500,
              fontSize: 15,
              minHeight: 40,
              transition: "all 0.14s",
              boxShadow: selectedPrompts.includes(prompt) ? "0 0 0 2px #6c47ff22" : "none",
            }}
          >
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selectedPrompts.includes(prompt)}
                onChange={() => togglePrompt(prompt)}
                disabled={
                  !selectedPrompts.includes(prompt) && selectedPrompts.length >= 3
                }
                style={{ marginRight: 10, accentColor: "#6c47ff" }}
              />
              <span>{prompt}</span>
            </label>
            {selectedPrompts.includes(prompt) && (
              <textarea
                placeholder="Your answer"
                value={promptAnswers[prompt] || ""}
                onChange={e =>
                  setPromptAnswers({ ...promptAnswers, [prompt]: e.target.value.slice(0, 140) })
                }
                style={{
                  marginTop: 10,
                  width: "100%",
                  minHeight: 42,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #DDD",
                  fontSize: 15,
                  outline: "none",
                  background: "#fff",
                  fontWeight: 500,
                  resize: "vertical",
                  color: "#232323",
                }}
                maxLength={140}
                onBlur={() => setTouched(true)}
              />
            )}
            {selectedPrompts.includes(prompt) && (
              <div style={{ textAlign: "right", fontSize: 12, color: "#6c47ff", marginTop: 2 }}>
                {(promptAnswers[prompt] || "").length}/140
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          setTouched(true);
          if (canProceed) handleNext();
        }}
        disabled={!canProceed}
        style={{
          width: "100%",
          background: canProceed ? "#B88908" : "#FFD70066",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.2,
          cursor: canProceed ? "pointer" : "not-allowed",
          boxShadow: "0 2px 16px #FFD70022",
          transition: "background 0.18s",
        }}
      >
        Next
      </button>
      {touched && selectedPrompts.length !== 3 && (
        <div style={{ color: "#B88908", marginTop: 12, fontSize: 14 }}>
          Please select exactly 3 prompts.
        </div>
      )}
      {touched && selectedPrompts.some((p) => !(promptAnswers[p] || "").trim()) && (
        <div style={{ color: "#B88908", marginTop: 7, fontSize: 14 }}>
          Please answer all selected prompts.
        </div>
      )}
      <div style={{ color: "#888", fontSize: 13, marginTop: 16 }}>
        Answers are visible to recruiters. Keep it fun and real!
      </div>
    </div>
  );
}