export type CompanyTypePreference = "mnc" | "middle_enterprise" | "startup" | "open_to_all";
export type Gender = "woman" | "male" | "nonbinary";
export type JobSkillType = { hard: string[]; soft: string[]; specific: string[]; };

export type CandidatePrompt =
  | "i see myself in the next 5 years"
  | "my biggest strength"
  | "my biggest weakness"
  | "my love language at work"
  | "proudest professional accomplishment"
  | "introverted or extroverted"
  | "Give me a deadline and I’ll…"
  | "If I could design my dream job, it would include…"
  | "To me, success at work feels like…"
  | "My toxic trait at work? I actually love Mondays."
  | "In group projects, I’m always the one who…"
  | "The one tool or software I can’t live without is…"
  | "If I could have lunch with a CEO, I’d ask them…"
  | "I think work should feel like…";

export interface CandidatePromptAnswer {
  prompt: CandidatePrompt;
  answer: string;
}

export interface CandidateProfile {
  role: "candidate";
  companyTypePreference: CompanyTypePreference;
  location: string;
  firstName: string;
  lastName: string;
  birthday: string; // dd/mm/yyyy
  ageCheck: boolean;
  gender: Gender;
  latestEducation: {
    institution: string;
    degree: string;
    passingYear: string;
  };
  projects: { name: string; link?: string; description?: string; }[];
  experiences: { name: string; link?: string; description?: string; }[];
  jobRolesOfInterest: string[];
  skills: JobSkillType;
  softwareProficiency?: string[];
  introText: string;
  introVideoUrl?: string;
  promptAnswers: [CandidatePromptAnswer, CandidatePromptAnswer, CandidatePromptAnswer];
  cvUrl?: string;
  atsCvUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  profilePhotoUrl: string;
  isPublished: boolean;
  lastEdited?: string;
}