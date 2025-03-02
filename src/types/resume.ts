export interface Section {
    title: string;
    content: string | string[];
    startDate: string;
    endDate: string;
    organization: string;
    location: string;
}

export interface LanguageLevel{
    name: string;
    level: string;
}

export interface Resume {
    name: string;
    title: string;
    about: string;
    email?: string;
    phone?: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
    address?: string;
    education: Section[];
    experience: Section[];
    projects?: Section[];
    courses?: Section[];
    languages: LanguageLevel[];
    skills: string[];
}

export const resumeSample: Resume = {
    name: 'John Doe',
    title: 'Software Developer',
    about: 'I am a software developer with experience in JavaScript, TypeScript, and Node.js.',
    email: 'youremail@yourdomain.com',
    phone: '0541 999 99 99',
    address: 'Your Location',
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    education: [
        {
            title: 'Bachelor of Science in Computer Science',
            content: [
                'Data Structures, Algorithms, Web Development',
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
            content: [
                'Worked on a team to develop a mobile application using React Native.',
                'Implemented new features and fixed bugs.',

            ],
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
