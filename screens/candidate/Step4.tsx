import React, { useContext, useState } from "react";
import { OnboardingContext } from "../OnboardingContext";

type Step4Props = {
  onNext?: () => void;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => `${CURRENT_YEAR - i}`);
const SUGGESTED_SKILLS = [
  "React", "Python", "C++", "Java", "SQL", "Figma", "Node.js", "AWS", "Flutter", "Machine Learning", "UI/UX", "Django", "Go", "Leadership", "Public Speaking"
];

export default function Step4({ onNext }: Step4Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [latestEducation, setLatestEducation] = useState(answers.latestEducation || "");
  const [passingYear, setPassingYear] = useState(answers.passingYear || "");
  const [projects, setProjects] = useState<string[]>(
    answers.projects && answers.projects.length ? answers.projects : [""]
  );
  const [experiences, setExperiences] = useState<string[]>(
    answers.experiences && answers.experiences.length ? answers.experiences : [""]
  );
  const [skills, setSkills] = useState<string[]>(
    answers.skills && answers.skills.length ? answers.skills : []
  );
  const [inputSkill, setInputSkill] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [gpa, setGpa] = useState(answers.gpa || "");
  const [honors, setHonors] = useState(answers.honors || "");
  const [touched, setTouched] = useState(false);
  const [eduTipsDismissed, setEduTipsDismissed] = useState(answers.eduTipsDismissed ?? false);
  const [showMore, setShowMore] = useState(false);

  const progressPercent = 4 / 9;

  // --- Project & Experience helpers
  const addProject = () => setProjects([...projects, ""]);
  const updateProject = (idx: number, val: string) =>
    setProjects(projects.map((p, i) => (i === idx ? val : p)));
  const removeProject = (idx: number) =>
    setProjects(projects.filter((_, i) => i !== idx));

  const addExperience = () => setExperiences([...experiences, ""]);
  const updateExperience = (idx: number, val: string) =>
    setExperiences(experiences.map((e, i) => (i === idx ? val : e)));
  const removeExperience = (idx: number) =>
    setExperiences(experiences.filter((_, i) => i !== idx));

  // --- Skills chip helpers
  const addSkill = (skill: string) => {
    const val = skill.trim();
    if (val && !skills.map(s => s.toLowerCase()).includes(val.toLowerCase()) && val.length <= 32) {
      setSkills([...skills, val]);
      setInputSkill("");
      setShowSkillSuggestions(false);
    }
  };
  const removeSkill = (skill: string) =>
    setSkills(skills.filter((s) => s !== skill));

  const skillSuggestions = inputSkill
    ? SUGGESTED_SKILLS.filter(
        s =>
          s.toLowerCase().includes(inputSkill.trim().toLowerCase()) &&
          !skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())
      ).slice(0, 6)
    : [];

  // --- Validation
  const isValid =
    latestEducation.trim().length > 2 &&
    passingYear &&
    projects.filter((p) => p.trim()).length > 0 &&
    experiences.filter((e) => e.trim()).length > 0 &&
    skills.filter(s => s.trim()).length > 0;

  const handleNext = () => {
    setAnswer("latestEducation", latestEducation);
    setAnswer("passingYear", passingYear);
    setAnswer("projects", projects.filter((p) => p.trim()));
    setAnswer("experiences", experiences.filter((e) => e.trim()));
    setAnswer("skills", skills.filter((s) => s.trim()));
    setAnswer("gpa", gpa.trim() || undefined);
    setAnswer("honors", honors.trim() || undefined);
    setAnswer("eduTipsDismissed", eduTipsDismissed);
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
        Education & Background
      </h2>
      <div style={{ marginBottom: 18 }}>
        <input
          value={latestEducation}
          onChange={(e) => setLatestEducation(e.target.value)}
          placeholder="E.g. BTech in Computer Science, IIT Bombay"
          style={{
            width: "100%",
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid #DDD",
            marginBottom: 12,
            fontSize: 16,
            outline: "none",
            background: "#fff",
            fontWeight: 500,
          }}
          maxLength={100}
          onBlur={() => setTouched(true)}
        />
        <select
          value={passingYear}
          onChange={(e) => setPassingYear(e.target.value)}
          style={{
            width: "100%",
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid #DDD",
            marginBottom: 12,
            fontSize: 16,
            outline: "none",
            background: "#fff",
            fontWeight: 500,
            color: passingYear ? "#232323" : "#999",
          }}
          onBlur={() => setTouched(true)}
        >
          <option value="">Passing out year</option>
          {YEARS.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: "#6c47ff", marginBottom: 8 }}>
          Projects you're proud of
        </div>
        {projects.map((proj, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              gap: 6,
            }}
          >
            <input
              value={proj}
              onChange={(e) => updateProject(idx, e.target.value)}
              placeholder={`Project ${idx + 1} (e.g. Portfolio Website, ML Model)`}
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
              maxLength={90}
            />
            {projects.length > 1 && (
              <button
                type="button"
                onClick={() => removeProject(idx)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #B88908",
                  borderRadius: 8,
                  color: "#B88908",
                  fontWeight: 600,
                  padding: "6px 12px",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Remove project"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addProject}
          style={{
            background: "#ece3ff",
            border: "none",
            borderRadius: 8,
            color: "#6c47ff",
            fontWeight: 600,
            padding: "7px 14px",
            cursor: "pointer",
            marginTop: 4,
            marginBottom: 6,
            fontSize: 15,
            transition: "background 0.14s",
          }}
        >
          + Add another project
        </button>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, color: "#6c47ff", marginBottom: 8 }}>
          Experiences you're proud of
        </div>
        {experiences.map((exp, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              gap: 6,
            }}
          >
            <input
              value={exp}
              onChange={(e) => updateExperience(idx, e.target.value)}
              placeholder={`Experience ${idx + 1} (e.g. Internship at Google, Teaching Assistant)`}
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
              maxLength={90}
            />
            {experiences.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #B88908",
                  borderRadius: 8,
                  color: "#B88908",
                  fontWeight: 600,
                  padding: "6px 12px",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Remove experience"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addExperience}
          style={{
            background: "#ece3ff",
            border: "none",
            borderRadius: 8,
            color: "#6c47ff",
            fontWeight: 600,
            padding: "7px 14px",
            cursor: "pointer",
            marginTop: 4,
            marginBottom: 6,
            fontSize: 15,
            transition: "background 0.14s",
          }}
        >
          + Add another experience
        </button>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, color: "#6c47ff", marginBottom: 6 }}>
          Your top skills
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={inputSkill}
            onChange={e => {
              setInputSkill(e.target.value);
              setShowSkillSuggestions(true);
            }}
            placeholder="Type & add skill (e.g. Python, Figma)"
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
            onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 100)}
            onKeyDown={e => {
              if (e.key === "Enter" && inputSkill.trim()) {
                addSkill(inputSkill);
              }
            }}
          />
          <button
            type="button"
            onClick={() => addSkill(inputSkill)}
            disabled={!inputSkill.trim()}
            style={{
              background: "#ece3ff",
              border: "none",
              borderRadius: 8,
              color: "#6c47ff",
              fontWeight: 600,
              padding: "7px 14px",
              cursor: inputSkill.trim() ? "pointer" : "not-allowed",
              fontSize: 15,
              transition: "background 0.14s",
            }}
          >Add</button>
        </div>
        {showSkillSuggestions && skillSuggestions.length > 0 && (
          <div style={{
            margin: "8px 0 2px 0",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}>
            {skillSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
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
              >{s}</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {skills.map(skill => (
            <span
              key={skill}
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
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
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
              >×</button>
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        style={{
          background: "none",
          color: "#6c47ff",
          border: "none",
          padding: 0,
          marginBottom: 10,
          marginTop: 0,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 14,
          textDecoration: "underline"
        }}
        onClick={() => setShowMore(m => !m)}
      >
        {showMore ? "Hide extra fields" : "Add GPA/Honors (optional)"}
      </button>
      {showMore && (
        <div style={{ marginBottom: 14 }}>
          <input
            value={gpa}
            onChange={e => setGpa(e.target.value)}
            placeholder="GPA (e.g. 9.2/10 or 3.8/4)"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              border: "1.5px solid #ece3ff",
              marginBottom: 8,
              fontSize: 16,
              outline: "none",
              background: "#fff",
              fontWeight: 500,
            }}
            maxLength={12}
          />
          <input
            value={honors}
            onChange={e => setHonors(e.target.value)}
            placeholder="Honors/awards (e.g. Dean's List, Gold Medal)"
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
      )}

      {/* Dismissable tips */}
      {!eduTipsDismissed && (
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
              onClick={() => setEduTipsDismissed(true)}
              title="Dismiss tips"
            >✕</button>
          </div>
          <ul style={{ margin: 0, marginTop: 4, paddingLeft: 16, color: "#6c47ff" }}>
            <li>Highlight projects/experiences even if they’re outside your degree!</li>
            <li>Skills give you a better chance at matching with dream jobs.</li>
            <li>GPA & awards are optional—brag if you want, skip if you don’t.</li>
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
        <div style={{ color: "#B88908", marginTop: 10, fontSize: 14 }}>
          Please fill in all required fields, including at least one project, experience, and skill.
        </div>
      )}
    </div>
  );
}