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

export const resumeSample = {

}