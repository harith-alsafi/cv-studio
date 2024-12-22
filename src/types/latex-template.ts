// TODO: add way to add order 

export interface LatexItem {
    template: string;
    args: Map<string, string>;
    hasArgs: boolean;
    getLatexString: () => string;
}

export interface LatexLoopItem {
    header: LatexItem;
    loop: LatexItem;
    footer: LatexItem;
    afterEach?: LatexItem;
}

export interface ComplexLatexLoopSection extends LatexLoopItem {
    order: number;
    type: 'education' | 'experience' | 'projects' | 'courses';
    bulletPoints?: LatexLoopItem;
}

export interface LatexLoopSection extends LatexLoopItem {
    order: number;
    type: 'skills' | 'languages';
}

export interface LatexSection {
    order: number;
    type:  'information' | 'about';
    content: LatexItem;
}

export interface LatexTemplate {
    document : {
        start: LatexItem;
        end: LatexItem;
    }

    sections: (LatexSection | ComplexLatexLoopSection | LatexLoopSection)[];
}

export const expectedArgs = [
    {
        type: 'information',
        args: []
    }
]

export const latexTemplateSample = {

}