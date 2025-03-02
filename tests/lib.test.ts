import { readYaml } from "@/lib/file-read";
import { generateLatexPdf } from "@/lib/latex-generation";
import { Resume, resumeSample } from "@/types/resume";
import { describe, it, expect } from 'vitest';
import path from 'path';
import { parseYamlTemplate } from "@/lib/latex-template";
import { LatexTemplate } from "@/types/latex-template";

describe('generateLatexDocument', () => {
    it('should generate a LaTeX document from a resume object', async () => {
        const templatePath = path.join(__dirname, '..','template1.yaml');
        const template = await readYaml(templatePath);
        const latexTemplate = new LatexTemplate(parseYamlTemplate(template));
        const latexDocument = latexTemplate.generateLatex(resumeSample);
        // assert
        
        // console.log(latexDocument);

        await generateLatexPdf(latexDocument);
        
}); });
