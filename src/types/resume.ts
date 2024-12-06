export interface Section {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    organization: string;
}

export interface Resume {
    name: string;
    title: string;
    about: string;
    education: Section[];
    experience: Section[];
    projects?: Section[] | string[];
    courses?: Section[] | string[];
    skills: string[];
    email?: string;
    phone?: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
    address?: string;
}