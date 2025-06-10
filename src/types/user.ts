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

export interface UserPayment{
  planKey: string;
  generationsUsed: number;
}

export interface UserData {
  profiles: Profile[];
  paymentUsage: UserPayment;
}

export interface User {
  clerkId: string;
  email: string;
  stripeId: string;
  
  data: UserData;
}

const userSample: User = {
  clerkId: "123c",
  email: "john.smith@yahoo.com",
  stripeId: "123s",

  data: {
    
  }
}