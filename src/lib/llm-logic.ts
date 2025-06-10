import { Resume } from "@/types/resume";
import OpenAI from "openai";
import { ResponseFormatJSONSchema } from "openai/resources/shared.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resumeResponseFormat: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "resume",
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the individual.",
        },
        title: {
          type: "string",
          description: "The job title or position of the individual.",
        },
        about: {
          type: "string",
          description:
            "A brief description about the individual, highlighting relevant experience for the target role if a job description is provided.",
        },
        email: {
          type: "string",
          description: "The email address of the individual.",
        },
        phone: {
          type: "string",
          description: "The phone number of the individual.",
        },
        portfolio: {
          type: "string",
          description: "The URL to the individual's portfolio.",
        },
        linkedin: {
          type: "string",
          description: "The individual's LinkedIn profile URL.",
        },
        github: {
          type: "string",
          description: "The individual's GitHub profile URL.",
        },
        address: {
          type: "string",
          description: "The address of the individual.",
        },
        education: {
          type: "array",
          description:
            "List of educational qualifications, prioritized based on relevance to the job description if provided.",
          items: {
            $ref: "#/$defs/section",
          },
        },
        experience: {
          type: "array",
          description:
            "List of work experience, prioritized based on relevance to the job description if provided.",
          items: {
            $ref: "#/$defs/section",
          },
        },
        projects: {
          type: "array",
          description:
            "List of projects, prioritized based on relevance to the job description if provided.",
          items: {
            $ref: "#/$defs/section",
          },
        },
        courses: {
          type: "array",
          description:
            "List of completed courses, prioritized based on relevance to the job description if provided.",
          items: {
            $ref: "#/$defs/section",
          },
        },
        languages: {
          type: "array",
          description: "List of languages and proficiency levels.",
          items: {
            $ref: "#/$defs/language_level",
          },
        },
        skills: {
          type: "array",
          description:
            "List of skills possessed by the individual, prioritized based on relevance to the job description if provided.",
          items: {
            type: "string",
          },
        },
      },
      required: [
        "name",
        "title",
        "about",
        "email",
        "phone",
        "portfolio",
        "linkedin",
        "github",
        "address",
        "education",
        "experience",
        "projects",
        "courses",
        "languages",
        "skills",
      ],
      additionalProperties: false,
      $defs: {
        section: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the section.",
            },
            content: {
              anyOf: [
                {
                  type: "string",
                  description:
                    "The content of the section as a single string, highlighting aspects relevant to the job description if provided.",
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                    description:
                      "The content of the section as an array of strings, highlighting aspects relevant to the job description if provided.",
                  },
                },
              ],
            },
            startDate: {
              type: "string",
              description: "The start date for this section.",
            },
            endDate: {
              type: "string",
              description: "The end date for this section.",
            },
            organization: {
              type: "string",
              description: "The organization related to this section.",
            },
            location: {
              type: "string",
              description: "The location of the organization.",
            },
          },
          required: [
            "title",
            "content",
            "startDate",
            "endDate",
            "organization",
            "location",
          ],
          additionalProperties: false,
        },
        language_level: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the language.",
            },
            level: {
              type: "string",
              description: "The proficiency level of the language.",
            },
          },
          required: ["name", "level"],
          additionalProperties: false,
        },
      },
    },
    strict: true,
  },
};

export async function LLMResumeResponse(
  systemMessage: string,
  userMessage: string
): Promise<Resume | null> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    response_format: resumeResponseFormat,
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const msg = response.choices[0].message.content;
  const resume: Resume | null =
    msg !== null ? (JSON.parse(msg) as Resume) : null;
  return resume;
}

export async function LLMParseResume(
  text: string,
  jobDescription: string | null = null
): Promise<Resume | null> {
  let systemMessage =
    "You are an expert resume parser. Extract relevant information from the resume into the specified JSON schema format.";

  // Add job description context if provided
  if (jobDescription) {
    systemMessage +=
      " The extracted information should be tailored to highlight aspects that are most relevant to the provided job description. Focus on skills, experiences, and qualifications that align with the job requirements.";
  }

  const userMessage = `Resume Content:\n${text}${
    jobDescription ? `\n\nJob Description:\n${jobDescription}` : ""
  }`;

  return await LLMResumeResponse(systemMessage, userMessage);
}

export async function LLMGenerateResume(){

}

export async function LLMGenerateCoverLetter(){

}

export async function LLMGenerateIntervieQuestions(){
  
}