// types/latex-template.ts
import { readYaml } from "@/lib/file-read";
import { parseYamlTemplate } from "@/lib/latex-template";
import { LanguageLevel, Resume, Section } from "@/types/resume";

export interface ExpectedArg<S> {
  arg: string;
  getValue: (object: S) => string | string[] | undefined;
  notRequired?: boolean;
}

// Base classes for storing serializable data
export class LatexArgItemData {
  template: string;
  args: Record<string, string | null>;

  constructor(template: string, args: Record<string, string | null> = {}) {
    this.template = template;
    this.args = args;
  }
}

export class LatexLoopItemData {
  header: string;
  loop: LatexArgItemData;
  footer: string;
  afterEach?: string;

  constructor(
    header: string,
    loop: LatexArgItemData,
    footer: string,
    afterEach?: string
  ) {
    this.header = header;
    this.loop = loop;
    this.footer = footer;
    this.afterEach = afterEach;
  }
}

export class ContentSectionData {
  order: number;
  type: string;
  content: LatexArgItemData;

  constructor(order: number, type: string, content: LatexArgItemData) {
    this.order = order;
    this.type = type;
    this.content = content;
  }
}

export class LatexSectionData extends LatexLoopItemData {
  order: number;
  type: "education" | "experience" | "projects" | "courses";
  bulletPoints?: LatexLoopItemData;

  constructor(
    order: number,
    type: "education" | "experience" | "projects" | "courses",
    header: string,
    loop: LatexArgItemData,
    footer: string,
    afterEach?: string,
    bulletPoints?: LatexLoopItemData
  ) {
    super(header, loop, footer, afterEach);
    this.order = order;
    this.type = type;
    this.bulletPoints = bulletPoints;
  }
}

export class LatexSkillData extends LatexLoopItemData {
  order: number;
  type: "skills";

  constructor(
    order: number,
    header: string,
    loop: LatexArgItemData,
    footer: string,
    afterEach?: string
  ) {
    super(header, loop, footer, afterEach);
    this.order = order;
    this.type = "skills";
  }
}

export class LatexLanguageData extends LatexLoopItemData {
  order: number;
  type: "languages";

  constructor(
    order: number,
    header: string,
    loop: LatexArgItemData,
    footer: string,
    afterEach?: string
  ) {
    super(header, loop, footer, afterEach);
    this.order = order;
    this.type = "languages";
  }
}

export class LatexInformationData {
  order: number;
  type: "information";
  contents: ContentSectionData[];

  constructor(order: number, contents: ContentSectionData[]) {
    this.order = order;
    this.type = "information";
    this.contents = contents;
  }
}

export class LatexTemplateData {
  document: {
    start: string;
    end: string;
  };
  sections: (
    | LatexSectionData
    | LatexSkillData
    | LatexInformationData
    | LatexLanguageData
  )[];

  constructor(
    documentStart: string,
    documentEnd: string,
    sections: (
      | LatexSectionData
      | LatexSkillData
      | LatexInformationData
      | LatexLanguageData
    )[]
  ) {
    this.document = {
      start: documentStart,
      end: documentEnd,
    };
    this.sections = sections;
  }
}

// Helper classes with methods (to be used on the client/server but not serialized)
export class LatexArgItem {
  private data: LatexArgItemData;

  constructor(data: LatexArgItemData) {
    this.data = data;
  }

  getLatexString(): string {
    let processedTemplate = this.data.template;
    Object.entries(this.data.args).forEach(([key, value]) => {
      if (value !== null) {
        const regex = new RegExp(`__${key.toUpperCase()}__`, "g");
        processedTemplate = processedTemplate.replace(regex, value);
      }
    });
    return processedTemplate;
  }

  setArg(key: string, value: string | null): boolean {
    if (!(key in this.data.args)) {
      return false;
    }
    this.data.args[key] = value;
    return true;
  }

  getData(): LatexArgItemData {
    return { ...this.data };
  }

  static fromTemplate(template: string): LatexArgItem {
    const args: Record<string, string | null> = {};
    const regex = /__([A-Z_]+)__/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
      args[match[1].toLowerCase()] = "";
    }
    return new LatexArgItem(new LatexArgItemData(template, args));
  }
}

export class LatexSection {
  private data: LatexSectionData;

  constructor(data: LatexSectionData) {
    this.data = data;
  }

  getLatexString(resume: Resume): string {
    const sectionExpectedArgs = getLatexExpectedArgs()[
      this.data.type
    ] as ExpectedArg<Section>[];
    const key = this.data.type as keyof Resume;
    const sections: Section[] | undefined = resume[key] as
      | Section[]
      | undefined;

    if (sections && sections.length > 0) {
      let processedContent = this.data.header + "\n";
      const loopItem = new LatexArgItem(this.data.loop);

      for (const section of sections) {
        for (const arg of sectionExpectedArgs) {
          const value = arg.getValue(section);
          if (value) {
            loopItem.setArg(arg.arg, value as string);
          }
        }

        if (this.data.bulletPoints && Array.isArray(section.content)) {
          let bulletPointsContent = this.data.bulletPoints.header + "\n";
          const bpLoopItem = new LatexArgItem(this.data.bulletPoints.loop);

          for (const bullet of section.content) {
            bpLoopItem.setArg("bullet", bullet);
            bulletPointsContent += bpLoopItem.getLatexString();
            if (bullet !== section.content[section.content.length - 1]) {
              bulletPointsContent += this.data.bulletPoints.afterEach
                ? this.data.bulletPoints.afterEach
                : "";
            }
          }

          bulletPointsContent += this.data.bulletPoints.footer + "\n";
          loopItem.setArg("content", bulletPointsContent);
        }

        processedContent += loopItem.getLatexString() + "\n";
        if (section !== sections[sections.length - 1]) {
          processedContent += this.data.afterEach
            ? this.data.afterEach + "\n"
            : "";
        }
      }

      processedContent += this.data.footer;
      return processedContent;
    }

    return "";
  }

  getData(): LatexSectionData {
    return { ...this.data };
  }
}

export class LatexSkill {
  private data: LatexSkillData;

  constructor(data: LatexSkillData) {
    this.data = data;
  }

  getLatexString(resume: Resume): string {
    const skills = resume.skills;
    if (skills) {
      let processedContent = this.data.header + "\n";
      const loopItem = new LatexArgItem(this.data.loop);

      for (const skill of skills) {
        loopItem.setArg("skill", skill);
        processedContent += loopItem.getLatexString();
        if (skill !== skills[skills.length - 1]) {
          processedContent += this.data.afterEach ? this.data.afterEach : "";
        }
      }

      processedContent += this.data.footer;
      return processedContent;
    }

    return "";
  }

  getData(): LatexSkillData {
    return { ...this.data };
  }
}

export class LatexLanguage {
  private data: LatexLanguageData;

  constructor(data: LatexLanguageData) {
    this.data = data;
  }

  getLatexString(resume: Resume): string {
    const languages = resume.languages;
    if (languages) {
      let processedContent = this.data.header + "\n";
      const loopItem = new LatexArgItem(this.data.loop);
      const languageExpectedArgs = getLatexExpectedArgs()[
        "languages"
      ] as ExpectedArg<LanguageLevel>[];

      for (const language of languages) {
        for (const arg of languageExpectedArgs) {
          const value = arg.getValue(language);
          if (value) {
            loopItem.setArg(arg.arg, value as string);
          }
        }

        processedContent += loopItem.getLatexString() + "\n";
        if (language !== languages[languages.length - 1]) {
          processedContent += this.data.afterEach
            ? this.data.afterEach + "\n"
            : "";
        }
      }

      processedContent += this.data.footer;
      return processedContent;
    }

    return "";
  }

  getData(): LatexLanguageData {
    return { ...this.data };
  }
}

export class LatexInformation {
  private data: LatexInformationData;

  constructor(data: LatexInformationData) {
    this.data = data;
  }

  getLatexString(resume: Resume): string {
    let processedContent = "";
    const infoExpectedArgs = getLatexExpectedArgs()[
      "information"
    ] as ExpectedArg<Resume>[];

    // extract contents array and sort by order
    const contents = [...this.data.contents].sort((a, b) => a.order - b.order);

    for (const content of contents) {
      // find the content.type is inside infoExpectedArgs
      const expectedArgs = infoExpectedArgs.find(
        (arg) => arg.arg === content.type
      );
      if (expectedArgs) {
        const value = expectedArgs.getValue(resume);
        if (value) {
          const contentItem = new LatexArgItem(content.content);
          contentItem.setArg(content.type, value as string);
          processedContent += contentItem.getLatexString();
        }
      }
    }

    return processedContent;
  }

  getData(): LatexInformationData {
    return { ...this.data };
  }
}

export class LatexTemplate {
  private data: LatexTemplateData;

  constructor(data: LatexTemplateData) {
    this.data = data;
  }

  generateLatex(resume: Resume): string {
    let result = this.data.document.start + "\n";

    // Sort sections by order
    const sortedSections = [...this.data.sections].sort(
      (a, b) => a.order - b.order
    );

    for (const sectionData of sortedSections) {
      let section;

      if (sectionData.type === "information") {
        section = new LatexInformation(sectionData as LatexInformationData);
      } else if (sectionData.type === "skills") {
        if (resume.skills.length === 0) {
          continue;
        }
        section = new LatexSkill(sectionData as LatexSkillData);
      } else if (sectionData.type === "languages") {
        if (resume.languages.length === 0) {
          continue;
        }
        section = new LatexLanguage(sectionData as LatexLanguageData);
      } else {
        const key = sectionData.type as keyof Resume;
        if (resume[key] != undefined && resume[key].length === 0) {
          continue;
        }
        section = new LatexSection(sectionData as LatexSectionData);
      }

      result += section.getLatexString(resume) + "\n";
    }

    result += this.data.document.end;
    return result;
  }

  getData(): LatexTemplateData {
    return { ...this.data };
  }
}

// Helper functions for expected arguments
export function getSectionExpectedArgs(): ExpectedArg<Section>[] {
  return [
    { arg: "title", getValue: (section: Section) => section.title },
    {
      arg: "organization",
      getValue: (section: Section) => section.organization,
    },
    { arg: "location", getValue: (section: Section) => section.location },
    { arg: "start_date", getValue: (section: Section) => section.startDate },
    { arg: "end_date", getValue: (section: Section) => section.endDate },
    { arg: "content", getValue: (section: Section) => section.content },
  ];
}

export function getLatexExpectedArgs(): Record<
  string,
  (ExpectedArg<Section> | ExpectedArg<Resume> | ExpectedArg<LanguageLevel>)[]
> {
  return {
    education: getSectionExpectedArgs(),
    experience: getSectionExpectedArgs(),
    projects: getSectionExpectedArgs(),
    courses: getSectionExpectedArgs(),
    skills: [{ arg: "skill", getValue: (resume: Resume) => resume.skills }],
    languages: [
      { arg: "name", getValue: (language: LanguageLevel) => language.name },
      { arg: "level", getValue: (language: LanguageLevel) => language.level },
    ],
    information: [
      { arg: "about", getValue: (resume: Resume) => resume.about },
      { arg: "name", getValue: (resume: Resume) => resume.name },
      { arg: "title", getValue: (resume: Resume) => resume.title },
      { arg: "email", getValue: (resume: Resume) => resume.email },
      { arg: "phone", getValue: (resume: Resume) => resume.phone },
      { arg: "portfolio", getValue: (resume: Resume) => resume.portfolio },
      { arg: "linkedin", getValue: (resume: Resume) => resume.linkedin },
      { arg: "github", getValue: (resume: Resume) => resume.github },
      { arg: "address", getValue: (resume: Resume) => resume.address },
    ],
  };
}

export interface TemplateEntry {
  filePath: string;
  name: string;
  data: LatexTemplateData;
};

export async function getLatexTemplates(): Promise<TemplateEntry[]> {
  const fileName = "template-1/template1.yaml";
  const yamlData = await readYaml(fileName);
  return [
    {
      filePath: fileName,
      name: "Template 1",
      data: parseYamlTemplate(yamlData),
    },
  ];
}
