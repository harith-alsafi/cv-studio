import { LanguageLevel, Resume, Section } from "@/types/resume";

// TODO: add way to add order 
export interface ExpectedArg<S>{
    arg: string;
    getValue: (object: S) => string | string[] | undefined;
    notRequired?: boolean;
}

export interface LatexArgItem {
    template: string;
    args: Map<string, string | null>;
    getLatexString: () => string;
    setArg: (key: string, value: string | null) => boolean;
}

export interface LatexLoopItem {
    header: string;
    loop: LatexArgItem;
    footer: string;
    afterEach?: string;
}

export interface LatexSection extends LatexLoopItem {
    order: number;
    type: 'education' | 'experience' | 'projects' | 'courses';
    getLatexString: (resume: Resume) => string;
    bulletPoints?: LatexLoopItem;
}

export interface LatexSkill extends LatexLoopItem {
    order: number;
    type: 'skills' ;
    getLatexString: (resume: Resume) => string;
}

export interface LatexLanguage extends LatexLoopItem {
    order: number;
    type: 'languages' ;
    getLatexString: (resume: Resume) => string;
}

interface ContentSection {
    order: number;
    type: string;
    content: LatexArgItem;
}

export interface LatexInformation {
    order: number;
    type: 'information';
    contents: ContentSection[];
    getLatexString: (resume: Resume) => string;
}

export interface LatexTemplate {
    document : {
        start: string;
        end: string;
    }

    sections: (LatexSection | LatexSkill | LatexInformation | LatexLanguage)[];
}


export const latexTemplateSample = {

}