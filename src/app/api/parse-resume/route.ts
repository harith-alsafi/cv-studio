// src/api/parse-resu,e/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: text
            }
          ]
        },
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: ""
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume",
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the individual."
              },
              title: {
                type: "string",
                description: "The job title or position of the individual."
              },
              about: {
                type: "string",
                description: "A brief description about the individual."
              },
              email: {
                type: "string",
                description: "The email address of the individual."
              },
              phone: {
                type: "string",
                description: "The phone number of the individual."
              },
              portfolio: {
                type: "string",
                description: "The URL to the individual's portfolio."
              },
              linkedin: {
                type: "string",
                description: "The individual's LinkedIn profile URL."
              },
              github: {
                type: "string",
                description: "The individual's GitHub profile URL."
              },
              address: {
                type: "string",
                description: "The address of the individual."
              },
              education: {
                type: "array",
                description: "List of educational qualifications.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              experience: {
                type: "array",
                description: "List of work experience.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              projects: {
                type: "array",
                description: "List of projects.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              courses: {
                type: "array",
                description: "List of completed courses.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              languages: {
                type: "array",
                description: "List of languages and proficiency levels.",
                items: {
                  "$ref": "#/$defs/language_level"
                }
              },
              skills: {
                type: "array",
                description: "List of skills possessed by the individual.",
                items: {
                  type: "string"
                }
              }
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
              "skills"
            ],
            additionalProperties: false,
            $defs: {
              section: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the section."
                  },
                  content: {
                    anyOf: [
                      {
                        type: "string",
                        description: "The content of the section as a single string."
                      },
                      {
                        type: "array",
                        items: {
                          type: "string",
                          description: "The content of the section as an array of strings."
                        }
                      }
                    ]
                  },
                  startDate: {
                    type: "string",
                    description: "The start date for this section."
                  },
                  endDate: {
                    type: "string",
                    description: "The end date for this section."
                  },
                  organization: {
                    type: "string",
                    description: "The organization related to this section."
                  },
                  location: {
                    type: "string",
                    description: "The location of the organization."
                  }
                },
                required: [
                  "title",
                  "content",
                  "startDate",
                  "endDate",
                  "organization",
                  "location"
                ],
                additionalProperties: false
              },
              language_level: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the language."
                  },
                  level: {
                    type: "string",
                    description: "The proficiency level of the language."
                  }
                },
                required: [
                  "name",
                  "level"
                ],
                additionalProperties: false
              }
            }
          },
          strict: true
        }
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}