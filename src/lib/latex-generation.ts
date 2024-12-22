import { ComplexLatexLoopSection, LatexItem, LatexLoopItem, LatexLoopSection, LatexSection, LatexTemplate } from "@/types/latex-template";
import { Section } from "@/types/resume";

function extractArguments(template: string | undefined): LatexItem {
    // extract arguments from template string
    // for example \cvevent{__TITLE__}{__ORGANIZATION__}{__START_DATE__ - __END_DATE__}{__LOCATION__} you will get 'title', 'organization', 'start_date', 'end_date', 'location'
    // i want this to return map of string to string where the key is the argument and the value is assigned null 
    if (!template) {
        return { template: '', args: new Map(), hasArgs: false };
    }
    const args = new Map<string, string>();
    const regex = /__([A-Z_]+)__/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        args.set(match[1].toLowerCase(), '');
    }
    return {
        template,
        args,
        hasArgs: args.size > 0,
    };
}

// Helper function to process LatexLoopItem structures
function processLatexLoopItem(data: any): LatexLoopItem {
    return {
        header: extractArguments(data.header),
        loop: extractArguments(data.loop),
        footer: extractArguments(data.footer),
        afterEach: extractArguments(data['after-each']),
    };
}

export function parseYamlTemplate(yamlData: Record<string, any>): LatexTemplate {
    // Map sections into appropriate types
    const sections = yamlData.sections.map((section: any) => {
        const base = {
            order: section.order,
            type: section.type,
        };

        if (section.type === 'information' || section.type === 'about') {
            return {
                ...base,
                content: extractArguments(section.content),
            } as LatexSection;
        }

        if (['education', 'experience', 'projects', 'courses'].includes(section.type)) {
            return {
                ...base,
                ...processLatexLoopItem(section),
                bulletPoints: section.bulletPoints ? processLatexLoopItem(section.bulletPoints) : undefined,
            } as ComplexLatexLoopSection;
        }

        if (['skills', 'languages'].includes(section.type)) {
            return {
                ...base,
                ...processLatexLoopItem(section),
            } as LatexLoopSection;
        }

        throw new Error(`Unsupported section type: ${section.type}`);
    });

    // Assemble the LatexTemplate object
    return {
        document: {
            start: extractArguments(yamlData.document.start),
            end: extractArguments(yamlData.document.end),
        },
        sections,
    };
}

function generateLatexString(item: LatexItem): string {
    // given template and arguments replace the arguments in the template
    // for example given \cvevent{__TITLE__}{__ORGANIZATION__}{__START_DATE__ - __END_DATE__}{__LOCATION__} and arguments {title: 'Software Engineer', organization: 'Google
    // start_date: '2019', end_date: '2021', location: 'Mountain View'} you will get \cvevent{Software Engineer}{Google}{2019 - 2021}{Mountain View}
    let processedTemplate = item.template;
    item.args.forEach((value, key) => {
        processedTemplate = processedTemplate.replace(`{__${key.toUpperCase()}__}`, value);
    });
    return processedTemplate;
}

export function generateLatexDocument(template: LatexTemplate, resume: Resume): string {
    
}