export type CompanyTypePreference = "mnc" | "middle_enterprise" | "startup";
export type WorkType = "onsite" | "hybrid" | "remote";

export interface HRJobOpening {
  jobTitle: string;
  description: string;
  experienceRequired: string;
  salaryRange?: string;
  jdPdfUrl?: string;
}

export interface HRProfile {
  role: "hr";
  companyTypePreference: CompanyTypePreference;
  location: string;
  fullName: string;
  designation: string;
  companyName: string;
  brandImageUrl?: string;
  tagline?: string;
  industry: string;
  companySize: string;
  foundedIn?: string;
  websiteUrl?: string;
  companyMission: string;
  officeLocation: string;
  workType: WorkType;
  useMyLocation?: boolean;
  rolesHiringFor: string[];
  hardSkills: string[];
  softSkills?: string[];
  toolsRequired?: string[];
  perks: string[];
  videoGreetingUrl?: string;
  jobOpenings?: HRJobOpening[];
  linkedinUrl?: string;
  careersPageUrl?: string;
  otherLinks?: string[];
  isPublished: boolean;
  lastEdited?: string;
}