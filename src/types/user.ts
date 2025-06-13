import { Resume } from "@/types/resume";

export interface GenerationInput {
  createdAt: Date;
  resumeId: string;
  templateId: string;
  jobDescription: string;
  prompt: string;
}

export interface GenerationOutput {
  id: string;
  pdfUrl: string;
  generatedResume: Resume;
}

export interface ResumeInfo {
  id: string;
  name: string;
  resume: Resume;
}

export interface Generation {
  id: string;
  input: GenerationInput;
  output: GenerationOutput;
}

export interface UserPayment{
  planKey: string;
  generationsUsed: number;
}

export interface UserData {
  resumes: ResumeInfo[];
  generations: Generation[];
  paymentUsage: UserPayment;
}

export interface User {
  clerkId: string;
  email: string;
  stripeId: string;
  lastUpdated: Date;
  
  data: UserData;
}

export const userSample: User = {
  clerkId: "user_2abc123def456",
  email: "john.doe@example.com",
  stripeId: "cus_abc123def456",
  lastUpdated: new Date("2024-06-01T10:00:00Z"),
  data: {
    resumes: [
      {
        id: "resume_001",
        name: "Software Engineer Resume",
        resume: {
          name: "John Doe",
          title: "Senior Software Engineer",
          about: "Experienced developer specializing in web applications.",
          email: "john.doe@example.com",
          phone: "+1-555-0123",
          portfolio: "https://johndoe.dev",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe",
          address: "San Francisco, CA",
          education: [
            {
              title: "Bachelor of Science in Computer Science",
              content: "Graduated magna cum laude.",
              startDate: "2018-08",
              endDate: "2022-05",
              organization: "Stanford University",
              location: "Stanford, CA"
            }
          ],
          experience: [
            {
              title: "Senior Software Engineer",
              content: ["Led development of microservices architecture.", "Mentored junior developers."],
              startDate: "2023-01",
              endDate: "2024-12",
              organization: "Tech Corp",
              location: "San Francisco, CA"
            },
            {
              title: "Software Engineer",
              content: "Built scalable web applications using React and Node.js.",
              startDate: "2022-06",
              endDate: "2022-12",
              organization: "StartupXYZ",
              location: "Remote"
            }
          ],
          projects: [
            {
              title: "E-commerce Platform",
              content: "Full-stack web application with payment integration.",
              startDate: "2023-03",
              endDate: "2023-06",
              organization: "Personal Project",
              location: "Remote"
            }
          ],
          courses: [
            {
              title: "AWS Solutions Architect",
              content: "Cloud architecture and deployment strategies.",
              startDate: "2023-09",
              endDate: "2023-11",
              organization: "AWS Training",
              location: "Online"
            }
          ],
          languages: [
            { name: "English", level: "Native" },
            { name: "Spanish", level: "Intermediate" }
          ],
          skills: ["JavaScript", "React", "Node.js", "AWS", "Docker"]
        }
      },
      {
        id: "resume_002",
        name: "Product Manager Resume",
        resume: {
          name: "John Doe",
          title: "Product Manager",
          about: "Strategic product leader with technical background.",
          email: "john.doe@example.com",
          phone: "+1-555-0123",
          portfolio: "https://johndoe.dev",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe",
          address: "San Francisco, CA",
          education: [
            {
              title: "MBA",
              content: "Focus on product management and strategy.",
              startDate: "2020-08",
              endDate: "2022-05",
              organization: "UC Berkeley",
              location: "Berkeley, CA"
            }
          ],
          experience: [
            {
              title: "Product Manager",
              content: ["Launched 3 major features.", "Increased user engagement by 40%."],
              startDate: "2023-01",
              endDate: "2024-12",
              organization: "Tech Corp",
              location: "San Francisco, CA"
            }
          ],
          projects: [
            {
              title: "Mobile App Redesign",
              content: "Led cross-functional team to redesign user experience.",
              startDate: "2023-06",
              endDate: "2023-09",
              organization: "Tech Corp",
              location: "San Francisco, CA"
            }
          ],
          courses: [
            {
              title: "Product Management Fundamentals",
              content: "Core PM skills and methodologies.",
              startDate: "2022-08",
              endDate: "2022-10",
              organization: "Coursera",
              location: "Online"
            }
          ],
          languages: [
            { name: "English", level: "Native" },
            { name: "French", level: "Basic" }
          ],
          skills: ["Product Strategy", "User Research", "Analytics", "Agile", "Figma"]
        }
      }
    ],
    generations: [
      {
        id: "gen_001",
        input: {
          createdAt: new Date("2024-06-01T10:00:00Z"),
          resumeId: "resume_001",
          templateId: "template_modern",
          jobDescription: "Looking for a senior full-stack developer with React experience.",
          prompt: "Emphasize React and leadership experience."
        },
        output: {
          id: "output_001",
          pdfUrl: "https://storage.example.com/resumes/gen_001.pdf",
          generatedResume: {
            name: "John Doe",
            title: "Senior Full-Stack Developer",
            about: "React specialist with proven leadership experience.",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            portfolio: "https://johndoe.dev",
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe",
            address: "San Francisco, CA",
            education: [
              {
                title: "Bachelor of Science in Computer Science",
                content: "Graduated magna cum laude.",
                startDate: "2018-08",
                endDate: "2022-05",
                organization: "Stanford University",
                location: "Stanford, CA"
              }
            ],
            experience: [
              {
                title: "Senior Full-Stack Developer",
                content: ["Led React development team.", "Built scalable applications."],
                startDate: "2023-01",
                endDate: "2024-12",
                organization: "Tech Corp",
                location: "San Francisco, CA"
              }
            ],
            languages: [
              { name: "English", level: "Native" }
            ],
            skills: ["React", "JavaScript", "Leadership", "Node.js"]
          }
        }
      },
      {
        id: "gen_002",
        input: {
          createdAt: new Date("2024-06-05T14:30:00Z"),
          resumeId: "resume_002",
          templateId: "template_classic",
          jobDescription: "Product Manager role at a fintech startup.",
          prompt: "Highlight fintech and startup experience."
        },
        output: {
          id: "output_002",
          pdfUrl: "https://storage.example.com/resumes/gen_002.pdf",
          generatedResume: {
            name: "John Doe",
            title: "Fintech Product Manager",
            about: "Product leader with startup and financial technology expertise.",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            portfolio: "https://johndoe.dev",
            linkedin: "https://linkedin.com/in/johndoe",
            address: "San Francisco, CA",
            education: [
              {
                title: "MBA",
                content: "Focus on fintech and entrepreneurship.",
                startDate: "2020-08",
                endDate: "2022-05",
                organization: "UC Berkeley",
                location: "Berkeley, CA"
              }
            ],
            experience: [
              {
                title: "Fintech Product Manager",
                content: "Launched payment solutions for startups.",
                startDate: "2023-01",
                endDate: "2024-12",
                organization: "Tech Corp",
                location: "San Francisco, CA"
              }
            ],
            languages: [
              { name: "English", level: "Native" }
            ],
            skills: ["Fintech", "Product Strategy", "Startups", "Analytics"]
          }
        }
      },
      {
        id: "gen_003",
        input: {
          createdAt: new Date("2024-06-10T09:15:00Z"),
          resumeId: "resume_001",
          templateId: "template_minimal",
          jobDescription: "Remote DevOps engineer position.",
          prompt: "Focus on cloud and DevOps skills."
        },
        output: {
          id: "output_003",
          pdfUrl: "https://storage.example.com/resumes/gen_003.pdf",
          generatedResume: {
            name: "John Doe",
            title: "DevOps Engineer",
            about: "Cloud infrastructure specialist with remote work experience.",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            github: "https://github.com/johndoe",
            address: "Remote",
            education: [
              {
                title: "Bachelor of Science in Computer Science",
                content: "Cloud computing focus.",
                startDate: "2018-08",
                endDate: "2022-05",
                organization: "Stanford University",
                location: "Stanford, CA"
              }
            ],
            experience: [
              {
                title: "DevOps Engineer",
                content: "Managed AWS infrastructure and CI/CD pipelines.",
                startDate: "2023-01",
                endDate: "2024-12",
                organization: "Tech Corp",
                location: "Remote"
              }
            ],
            languages: [
              { name: "English", level: "Native" }
            ],
            skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"]
          }
        }
      }
    ],
    paymentUsage: {
      planKey: "pro_monthly",
      generationsUsed: 3
    }
  }
};