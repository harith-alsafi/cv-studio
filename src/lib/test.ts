import { generateLatexDocument, parseYamlTemplate } from "@/lib/latex-generation";
import { Resume } from "@/types/resume";
import YAML from 'yaml';


const yamlString = `
document:
  start: |
    \\documentclass{article}
    \\usepackage{lipsum}
    \\begin{document}
  end: |
    \\end{document}

sections:
  - type: information
    order: 0
    contents: 
      - type: name
        order: 0
        content: |
          \\name{__NAME__}
      - type: address
        order: 1
        content: |
          \\name{__ADDRESS__}
  - type: education
    order: 1
    header: |
      \\section{Education}
    loop: |
      \\cvevent{__TITLE__}{__ORGANIZATION__}{__START_DATE__ - __END_DATE__}{__LOCATION__}
      __CONTENT__
    bulletPoints: 
      header: |
        \\begin{itemize}
      loop: |
        \\item __BULLET__
      footer: |
        \\end{itemize}
    footer: |
      \\medskip
    after-each: |
      \\tightdivider
  - type: skills
    order: 2
    header: |
      \\section{Skills}
    loop: |
      \\cvtag{__SKILL__}
    footer: |
      \\medskip
    after-each: |
      \\tightdivider
  
`

const resumeSample: Resume = {
    name: 'John Doe',
    title: 'Software Developer',
    about: 'I am a software developer with experience in JavaScript, TypeScript, and Node.js.',
    email: 'john@gmail.com',
    phone: '123-456-7890',
    education: [
        {
            title: 'Bachelor of Science in Computer Science',
            content: [
                'Relevant coursework: Data Structures, Algorithms, Web Development.',
                'GPA: 3.5'
            ],
            startDate: 'August 2016',
            endDate: 'May 2020',
            organization: 'University of Example',
            location: 'Example City, EX'
        },
        {
            title: 'High School Diploma',
            content: 'Graduated with honors.',
            startDate: 'August 2012',
            endDate: 'May 2016',
            organization: 'Example High School',
            location: 'Example City, EX'
        }
    ],
    experience: [
        {
            title: 'Software Developer',
            content: 'Developed web applications using React and Node.js.',
            startDate: 'June 2020',
            endDate: 'Present',
            organization: 'Tech Company',
            location: 'Example City, EX'
        },
        {
            title: 'Intern',
            content: [
                'Worked on a team to develop a mobile application using React Native.',
                'Implemented new features and fixed bugs.',

            ],
            startDate: 'May 2019',
            endDate: 'August 2019',
            organization: 'Software Company',
            location: 'Example City, EX'
        }
    ],
    projects: [
        {
            title: 'Project 1',
            content: 'Description of Project 1',
            startDate: 'January 2020',
            endDate: 'March 2020',
            organization: 'University of Example',
            location: 'Example City, EX'
        }
    ],
    languages: [
        {
            name: "English",
            level: "Fluent"
        },
        {
            name: "Spanish",
            level: "Intermediate"
        }
    ],
    skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "SQL"
    ]
}

try {
    // Parse the YAML string
    const parsedDocument = YAML.parse(yamlString) as Record<string, any>;
    
    const parsedYaml = parseYamlTemplate(parsedDocument);
    
    const latexString = generateLatexDocument(parsedYaml, resumeSample);
    console.log(latexString);
    // Now parsedDocument is a JavaScript object that you can work with
    // console.dir(parsedYaml, { depth: null, colors: true });
  } catch (error) {
    console.error('Error parsing YAML:', error);
  }