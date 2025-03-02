import { 
    LatexArgItem, 
    LatexArgItemData,
    LatexInformationData,
    ContentSectionData,
    LatexSectionData,
    LatexSkillData,
    LatexLanguageData,
    LatexTemplateData,
    LatexLoopItemData
} from "@/types/latex-template";

// Helper function to process template strings into LatexArgItemData
function extractArguments(template: string): LatexArgItemData {
    const args: Record<string, string | null> = {};
    const regex = /__([A-Z_]+)__/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        args[match[1].toLowerCase()] = '';
    }
    return new LatexArgItemData(template, args);
}

// Helper function to process LatexLoopItem structures
function processLatexLoopItem(data: any): LatexLoopItemData {
    return new LatexLoopItemData(
        data.header,
        extractArguments(data.loop),
        data.footer,
        data['after-each']
    );
}

export function parseYamlTemplate(yamlData: Record<string, any>): LatexTemplateData {
    // Map sections into appropriate types
    const sections = yamlData.sections.map((latexSection: any) => {
        const baseOrder = latexSection.order;
        const baseType = latexSection.type;

        if (latexSection.type === 'information') {
            return new LatexInformationData(
                baseOrder,
                latexSection.contents.map((content: any) => new ContentSectionData(
                    content.order,
                    content.type,
                    extractArguments(content.content)
                ))
            );
        }

        if (['education', 'experience', 'projects', 'courses'].includes(latexSection.type)) {
            const loopItem = processLatexLoopItem(latexSection);
            const bulletPoints = latexSection.bulletPoints 
                ? processLatexLoopItem(latexSection.bulletPoints) 
                : undefined;
                
            return new LatexSectionData(
                baseOrder,
                baseType,
                loopItem.header,
                loopItem.loop,
                loopItem.footer,
                loopItem.afterEach,
                bulletPoints
            );
        }

        if (latexSection.type === 'languages') {
            const loopItem = processLatexLoopItem(latexSection);
            
            return new LatexLanguageData(
                baseOrder,
                loopItem.header,
                loopItem.loop,
                loopItem.footer,
                loopItem.afterEach
            );
        }

        if (latexSection.type === 'skills') {
            const loopItem = processLatexLoopItem(latexSection);
            
            return new LatexSkillData(
                baseOrder,
                loopItem.header,
                loopItem.loop,
                loopItem.footer,
                loopItem.afterEach
            );
        }

        throw new Error(`Unsupported section type: ${latexSection.type}`);
    });

    // Assemble the LatexTemplateData object
    return new LatexTemplateData(
        yamlData.document.start,
        yamlData.document.end,
        sections
    );
}