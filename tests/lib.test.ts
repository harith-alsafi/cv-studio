import { readYaml } from "@/lib/file-read";
import { generateLatexDocument, parseYamlTemplate } from "@/lib/latex-generation";
import { Resume } from "@/types/resume";
import { describe, it, expect } from 'vitest';
import path from 'path';

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


describe('generateLatexDocument', () => {
    it('should generate a LaTeX document from a resume object', () => {
        const templatePath = path.join(__dirname, '..','specification.yaml');
        const template = readYaml(templatePath);
        const latexTemplate = parseYamlTemplate(template);
        const latexDocument = generateLatexDocument(latexTemplate, resumeSample);
        console.log(latexDocument);
        
}); });