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
          strict: true,
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
                description: "A brief summary about the individual."
              },
              education: {
                type: "array",
                description: "A collection of educational qualifications.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              experience: {
                type: "array",
                description: "A collection of work experience sections.",
                items: {
                  "$ref": "#/$defs/section"
                }
              },
              projects: {
                type: "array",
                description: "A collection of projects that the individual has worked on, can also include string descriptions.",
                items: {
                  anyOf: [
                    { "$ref": "#/$defs/section" },
                    { type: "string" }
                  ]
                }
              },
              courses: {
                type: "array",
                description: "A collection of courses that the individual has completed, part of academic study or independent, can also include string descriptions.",
                items: {
                  anyOf: [
                    { "$ref": "#/$defs/section" },
                    { type: "string" }
                  ]
                }
              },
              skills: {
                type: "array",
                description: "A list of skills possessed by the individual.",
                items: {
                  type: "string"
                }
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
                description: "The URL to the individual's LinkedIn profile."
              },
              github: {
                type: "string",
                description: "The URL to the individual's GitHub profile."
              },
              address: {
                type: "string",
                description: "The physical address of the individual."
              }
            },
            required: [
              "name",
              "title",
              "about",
              "education",
              "experience",
              "projects",
              "courses",
              "skills",
              "email",
              "phone",
              "portfolio",
              "linkedin",
              "github",
              "address"
            ],
            additionalProperties: false,
            $defs: {
              section: {
                type: "object",
                description: "Defines a section of the resume that includes details such as title, content, dates, and organization.",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the section."
                  },
                  content: {
                    type: "string",
                    description: "The content of the section."
                  },
                  startDate: {
                    type: "string",
                    description: "The starting date of the section."
                  },
                  endDate: {
                    type: "string",
                    description: "The ending date of the section."
                  },
                  organization: {
                    type: "string",
                    description: "The organization related to the section."
                  }
                },
                required: [
                  "title",
                  "content",
                  "startDate",
                  "endDate",
                  "organization"
                ],
                additionalProperties: false
              }
            }
          }
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