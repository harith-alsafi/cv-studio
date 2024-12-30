import { ExpectedArg, LatexArgItem, LatexInformation, LatexLanguage, LatexLoopItem, LatexSection, LatexSkill, LatexTemplate } from "@/types/latex-template";
import { LanguageLevel, Resume, Section } from "@/types/resume";
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const sectionExpectedArgs:  ExpectedArg<Section>[] = [
    {arg: 'title', getValue: (section: Section) => section.title},
    {arg: 'organization', getValue: (section: Section) => section.organization},
    {arg: 'location', getValue: (section: Section) => section.location},
    {arg: 'start_date', getValue: (section: Section) => section.startDate},
    {arg: 'end_date', getValue: (section: Section) => section.endDate},
    {arg: 'content', getValue: (section: Section) => section.content},
]

const latexExpectedArgs: Record<string, (ExpectedArg<Section> | ExpectedArg<Resume> | ExpectedArg<LanguageLevel>)[]> = {
    'education': sectionExpectedArgs,
    'experience': sectionExpectedArgs,
    'projects': sectionExpectedArgs,
    'courses': sectionExpectedArgs,
    'skills': [
        {arg: 'skill', getValue: (resume: Resume) => resume.skills}
    ],
    'languages': [
        {arg: 'name', getValue: (language: LanguageLevel) => language.name}, 
        {arg: 'level', getValue: (language: LanguageLevel) => language.level}
    ],
    'information': [
        {arg: 'about', getValue: (resume: Resume) => resume.about},
        {arg: 'name', getValue: (resume: Resume) => resume.name},
        {arg: 'title', getValue: (resume: Resume) => resume.title},
        {arg: 'email', getValue: (resume: Resume) => resume.email},
        {arg: 'phone', getValue: (resume: Resume) => resume.phone},
        {arg: 'portfolio', getValue: (resume: Resume) => resume.portfolio},
        {arg: 'linkedin', getValue: (resume: Resume) => resume.linkedin},
        {arg: 'github', getValue: (resume: Resume) => resume.github},
        {arg: 'address', getValue: (resume: Resume) => resume.address},
    ]
}

function extractArguments(type: string,template: string): LatexArgItem {
    const args = new Map<string, string | null>();
    const regex = /__([A-Z_]+)__/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        args.set(match[1].toLowerCase(), '');
    }
    // let expectedArgs = latexExpectedArgs[type];
    // if(expectedArgs.length !== args.size){
    //     throw new Error(`Section ${type}: Expected ${expectedArgs.length} arguments but found ${args.size}`);
    // }
    return {
        template,
        args,
        // expectedArgs: latexExpectedArgs[type],
        getLatexString(): string {
            let processedTemplate = template;
            args.forEach((value, key) => {
                // if (value === null && this.expectedArgs.find((arg) => arg.arg === key)?.required) {
                //     throw new Error(`Argument ${key} is required but not set`);
                // }
                if (value !== null) {
                    processedTemplate = processedTemplate.replace(`__${key.toUpperCase()}__`, value);

                }
            });
            return processedTemplate;
        },
        setArg(key: string, value: string | null): boolean {
            if (!args.has(key)) {
                return false;
            }
            args.set(key, value);
            return true;
        }
    };
}

// Helper function to process LatexLoopItem structures
function processLatexLoopItem(type:string, data: any): LatexLoopItem {
    return {
        header: data.header,
        loop: extractArguments(type, data.loop),
        footer: data.footer,
        afterEach: data['after-each'],
    };
}

export function parseYamlTemplate(yamlData: Record<string, any>): LatexTemplate {
    // Map sections into appropriate types
    const sections = yamlData.sections.map((latexSection: any) => {
        const base = {
            order: latexSection.order,
            type: latexSection.type,
        };

        if (latexSection.type === 'information') {
            return {
                ...base,
                contents: latexSection.contents.map((content: any) => ({
                    order: content.order,
                    type: content.type,
                    content: extractArguments(content.type, content.content),
                })),
                getLatexString(resume: Resume) {
                    let processedContent = '';
                    const infoExpectedArgs = latexExpectedArgs['information'] as ExpectedArg<Resume>[];
                    // extract contents array and sort by order
                    const contents = this.contents.sort((a, b) => a.order - b.order);
                    for (const content of contents) {
                        // find the content.type is inside infoExpectedArgs
                        const expectedArgs = infoExpectedArgs.find((arg) => arg.arg === content.type);
                        if(expectedArgs){
                            const value = expectedArgs.getValue(resume);
                            if(value){
                                content.content.setArg(content.type, value as string);
                                processedContent += content.content.getLatexString();
                            }
                            processedContent += '\n';
                        }   
                    }
                    return processedContent;
                },
            } as LatexInformation;
        }

        if (['education', 'experience', 'projects', 'courses'].includes(latexSection.type)) {
            return {
                ...base,
                ...processLatexLoopItem(latexSection.type, latexSection),
                getLatexString(resume) {
                    const sectionExpectedArgs = latexExpectedArgs[latexSection.type] as ExpectedArg<Section>[];
                    const key = latexSection.type as keyof Resume;
                    const sections: Section[] | undefined = resume[key] as (Section[] | undefined);
                    if (sections && sections.length > 0) {
                        let processedContent = this.header + '\n';
                        for (const section of sections) {
                            for (const arg of sectionExpectedArgs) {
                                const value = arg.getValue(section);
                                if (value) {
                                    this.loop.setArg(arg.arg, value as string);
                                }
                            }
                            if(this.bulletPoints && Array.isArray(section.content)){
                                let bulletPointsContent = this.bulletPoints.header + '\n';
                                for(const bullet of section.content){
                                    this.bulletPoints.loop.setArg('bullet', bullet);
                                    bulletPointsContent += this.bulletPoints.loop.getLatexString() + '\n';
                                    if (bullet !== section.content[section.content.length - 1]) {
                                        bulletPointsContent += this.bulletPoints.afterEach ? this.bulletPoints.afterEach + '\n' : '';
                                    }
                                }
                                bulletPointsContent += this.bulletPoints.footer + '\n';
                                this.loop.setArg('content', bulletPointsContent);
                            }
                            processedContent += this.loop.getLatexString() + '\n';
                            // dont add afterEach if it is the last section
                            if (section !== sections[sections.length - 1]) {
                                processedContent += this.afterEach ? this.afterEach + '\n' : '';
                            }
                        }
                        processedContent += this.footer;
                        return processedContent
                    }
                },
                bulletPoints: latexSection.bulletPoints ? processLatexLoopItem( 'bulletPoints', latexSection.bulletPoints) : undefined,
            } as LatexSection;
        }

        if(latexSection.type === 'languages') {
            return {
                ...base,
                ...processLatexLoopItem(latexSection.type, latexSection),
                getLatexString(resume) {
                    const languages = resume.languages;
                    if (languages) {
                        let processedContent = this.header + '\n';
                        const languageExpectedArgs = latexExpectedArgs['languages'] as ExpectedArg<LanguageLevel>[];
                        for (const language of languages) {
                            for (const arg of languageExpectedArgs) {
                                const value = arg.getValue(language);
                                if (value) {
                                    this.loop.setArg(arg.arg, value as string);
                                }
                            }
                            processedContent += this.loop.getLatexString() + '\n';
                            if (language !== languages[languages.length - 1]) {
                                processedContent += this.afterEach ? this.afterEach + '\n' : '';
                            }
                        }
                        processedContent += this.footer;
                        return processedContent;
                    }
                }
            } as LatexLanguage;
        }

        if (latexSection.type === 'skills') {
            return {
                ...base,
                ...processLatexLoopItem(latexSection.type, latexSection),
                getLatexString(resume) {
                    const skills = resume.skills;
                    if (skills) {
                        let processedContent = this.header + '\n';
                        for (const skill of skills) {
                            this.loop.setArg('skill', skill);
                            processedContent += this.loop.getLatexString() + '\n';
                            if (skill !== skills[skills.length - 1]) {
                                processedContent += this.afterEach ? this.afterEach + '\n' : '';
                            }
                        }
                        processedContent += this.footer;
                        return processedContent;
                    }
                }
            } as LatexSkill;
        }

        throw new Error(`Unsupported section type: ${latexSection.type}`);
    });

    // Assemble the LatexTemplate object
    return {
        document: {
            start: yamlData.document.start,
            end: yamlData.document.end,
        },
        sections,
    };
}

export function generateLatexDocument(template: LatexTemplate, resume: Resume): string {
    let latexDocument = template.document.start + '\n';

    const sortedSections = template.sections.sort((a, b) => a.order - b.order);
    for (const section of sortedSections) {
        const latexString = section.getLatexString(resume);
        if (latexString) {
            latexDocument += latexString + '\n';
        }
    }

    latexDocument += template.document.end;
    return latexDocument;
}


export async function generateLatexPdf(latexDocument: string) {
    try {
        // Paths
        const tempDir = path.join(process.cwd(), 'tmp');
        const outputPath = path.join(tempDir, 'temp.pdf');

        // Ensure temporary directory exists
        await fs.mkdir(tempDir, { recursive: true });

        // Write the LaTeX document to a temporary file
        const latexFilePath = path.join(tempDir, 'temp.tex');
        await fs.writeFile(latexFilePath, latexDocument);

        // Compile LaTeX to PDF using `pdflatex`
        await new Promise((resolve, reject) => {
            exec(
                `bash -c "pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${latexFilePath}"`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error('pdflatex error:', stderr);
                        return reject(new Error('Failed to compile LaTeX'));
                    }
                    resolve(stdout);
                }
            );
        });

        // Read the generated PDF
        const pdfBuffer = await fs.readFile(outputPath);

        // Clean up temporary files
        await fs.rm(tempDir, { recursive: true, force: true });

        // Return the generated PDF buffer
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Internal Server Error');
    }
}