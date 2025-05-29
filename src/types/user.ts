import { Resume } from "@/types/resume";

export interface GenerationInput {
  createdAt: Date;
  templateId: string;
  jobDescription: string;
  prompt: string;
}

export interface GenerationOutput {
  id: string;
  pdfUrl: string;
  generatedResume: Resume;
}

export interface ProfileInfo {
  id: string;
  name: string;
  resume: Resume;
}

export interface Generation {
  id: string;
  input: GenerationInput;
  output: GenerationOutput[];
}

export interface Profile {
  info: ProfileInfo;
  generations: Generation[];
}

export interface UserData {
  profiles: Profile[];
  // Add other fields as necessary
}

export interface User {
  clerkId: string;
  email: string;
  stripeId: string;
  createdAt: Date;

  data: UserData;
}
