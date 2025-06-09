import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Resume, resumeSample, Section } from '@/types/resume';

// TODO: add calender for date and time 
// TODO: dont render sections that are not available in template, maybe indicate this in the db or have some template spec 

const ResumeEditor = () => {
    const [resume, setResume] = useState<Resume>(resumeSample);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        personal: true,
        education: false,
        experience: false,
        projects: false,
        courses: false,
        languages: false,
        skills: false
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updatePersonalInfo = (field: keyof Resume, value: string) => {
        setResume(prev => ({ ...prev, [field]: value }));
    };

    const addSection = (sectionType: 'education' | 'experience' | 'projects' | 'courses') => {
        const newSection: Section = {
            title: '',
            content: '',
            startDate: '',
            endDate: '',
            organization: '',
            location: ''
        };
        setResume(prev => ({
            ...prev,
            [sectionType]: [...(prev[sectionType] || []), newSection]
        }));
    };

    const updateSection = (sectionType: 'education' | 'experience' | 'projects' | 'courses', index: number, field: keyof Section, value: string | string[]) => {
        setResume(prev => ({
            ...prev,
            [sectionType]: prev[sectionType]?.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ) || []
        }));
    };

    const removeSection = (sectionType: 'education' | 'experience' | 'projects' | 'courses', index: number) => {
        setResume(prev => ({
            ...prev,
            [sectionType]: prev[sectionType]?.filter((_, i) => i !== index) || []
        }));
    };

    const moveSection = (sectionType: 'education' | 'experience' | 'projects' | 'courses', fromIndex: number, toIndex: number) => {
        setResume(prev => {
            const items = [...(prev[sectionType] || [])];
            const [removed] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, removed);
            return { ...prev, [sectionType]: items };
        });
    };

    const addLanguage = () => {
        setResume(prev => ({
            ...prev,
            languages: [...prev.languages, { name: '', level: '' }]
        }));
    };

    const updateLanguage = (index: number, field: 'name' | 'level', value: string) => {
        setResume(prev => ({
            ...prev,
            languages: prev.languages.map((lang, i) =>
                i === index ? { ...lang, [field]: value } : lang
            )
        }));
    };

    const removeLanguage = (index: number) => {
        setResume(prev => ({
            ...prev,
            languages: prev.languages.filter((_, i) => i !== index)
        }));
    };

    const moveLanguage = (fromIndex: number, toIndex: number) => {
        setResume(prev => {
            const languages = [...prev.languages];
            const [removed] = languages.splice(fromIndex, 1);
            languages.splice(toIndex, 0, removed);
            return { ...prev, languages };
        });
    };

    const addSkill = () => {
        setResume(prev => ({
            ...prev,
            skills: [...prev.skills, '']
        }));
    };

    const updateSkill = (index: number, value: string) => {
        setResume(prev => ({
            ...prev,
            skills: prev.skills.map((skill, i) => i === index ? value : skill)
        }));
    };

    const removeSkill = (index: number) => {
        setResume(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const moveSkill = (fromIndex: number, toIndex: number) => {
        setResume(prev => {
            const skills = [...prev.skills];
            const [removed] = skills.splice(fromIndex, 1);
            skills.splice(toIndex, 0, removed);
            return { ...prev, skills };
        });
    };

    const handleSave = () => {
        // Here you would typically save the resume data
        console.log('Resume saved:', resume);
        alert('Resume saved successfully!');
    };

    const renderSectionForm = (section: Section, index: number, sectionType: 'education' | 'experience' | 'projects' | 'courses') => {
        const sections = resume[sectionType] || [];
        const canMoveUp = index > 0;
        const canMoveDown = index < sections.length - 1;

        return (
            <Card key={index} className="mb-4 outline outline-1 outline-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-lg font-medium">{sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} {index + 1}</div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => moveSection(sectionType, index, index - 1)}
                            disabled={!canMoveUp}
                            className="h-10 w-10 p-0"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => moveSection(sectionType, index, index + 1)}
                            disabled={!canMoveDown}
                            className="h-10 w-10 p-0"
                        >
                            <ArrowDown className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => removeSection(sectionType, index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`${sectionType}-title-${index}`}>Title/Position</Label>
                            <Input
                                id={`${sectionType}-title-${index}`}
                                value={section.title}
                                onChange={(e) => updateSection(sectionType, index, 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${sectionType}-org-${index}`}>Organization</Label>
                            <Input
                                id={`${sectionType}-org-${index}`}
                                value={section.organization}
                                onChange={(e) => updateSection(sectionType, index, 'organization', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor={`${sectionType}-start-${index}`}>Start Date</Label>
                            <Input
                                id={`${sectionType}-start-${index}`}
                                value={section.startDate}
                                onChange={(e) => updateSection(sectionType, index, 'startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${sectionType}-end-${index}`}>End Date</Label>
                            <Input
                                id={`${sectionType}-end-${index}`}
                                value={section.endDate}
                                onChange={(e) => updateSection(sectionType, index, 'endDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor={`${sectionType}-location-${index}`}>Location</Label>
                            <Input
                                id={`${sectionType}-location-${index}`}
                                value={section.location}
                                onChange={(e) => updateSection(sectionType, index, 'location', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`${sectionType}-content-${index}`}>Description</Label>
                        <Textarea
                            id={`${sectionType}-content-${index}`}
                            value={Array.isArray(section.content) ? section.content.join('\n') : section.content}
                            onChange={(e) => updateSection(sectionType, index, 'content', e.target.value)}
                            rows={3}
                            placeholder="Enter description (use new lines for bullet points)"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Resume Editor</h1>
                <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Resume
                </Button>
            </div>

            {/* Personal Information */}
            <Card>
                <Collapsible
                    open={openSections.personal}
                    onOpenChange={() => toggleSection('personal')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Personal Information
                                {openSections.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={resume.name}
                                        onChange={(e) => updatePersonalInfo('name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="title">Professional Title</Label>
                                    <Input
                                        id="title"
                                        value={resume.title}
                                        onChange={(e) => updatePersonalInfo('title', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="about">About</Label>
                                <Textarea
                                    id="about"
                                    value={resume.about}
                                    onChange={(e) => updatePersonalInfo('about', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={resume.email || ''}
                                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={resume.phone || ''}
                                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="portfolio">Portfolio</Label>
                                    <Input
                                        id="portfolio"
                                        value={resume.portfolio || ''}
                                        onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        value={resume.linkedin || ''}
                                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input
                                        id="github"
                                        value={resume.github || ''}
                                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={resume.address || ''}
                                        onChange={(e) => updatePersonalInfo('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Education */}
            <Card>
                <Collapsible
                    open={openSections.education}
                    onOpenChange={() => toggleSection('education')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Education
                                {openSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.education?.map((section, index) => (
                                    renderSectionForm(section, index, 'education')
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => addSection('education')}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Education
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Experience */}
            <Card>
                <Collapsible
                    open={openSections.experience}
                    onOpenChange={() => toggleSection('experience')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Experience
                                {openSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.experience?.map((section, index) => (
                                    renderSectionForm(section, index, 'experience')
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => addSection('experience')}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Experience
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Projects */}
            <Card>
                <Collapsible
                    open={openSections.projects}
                    onOpenChange={() => toggleSection('projects')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Projects
                                {openSections.projects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.projects?.map((section, index) => (
                                    renderSectionForm(section, index, 'projects')
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => addSection('projects')}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Project
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Courses */}
            <Card>
                <Collapsible
                    open={openSections.courses}
                    onOpenChange={() => toggleSection('courses')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Courses
                                {openSections.courses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.courses?.map((section, index) => (
                                    renderSectionForm(section, index, 'courses')
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => addSection('courses')}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Languages */}
            <Card>
                <Collapsible
                    open={openSections.languages}
                    onOpenChange={() => toggleSection('languages')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Languages
                                {openSections.languages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.languages?.map((language, index) => {
                                    const canMoveUp = index > 0;
                                    const canMoveDown = index < resume.languages.length - 1;

                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Language"
                                                    value={language.name}
                                                    onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Level"
                                                    value={language.level}
                                                    onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="default"
                                                    onClick={() => moveLanguage(index, index - 1)}
                                                    disabled={!canMoveUp}
                                                    className="h-10 w-10 p-0"
                                                >
                                                    <ArrowUp className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="default"
                                                    onClick={() => moveLanguage(index, index + 1)}
                                                    disabled={!canMoveDown}
                                                    className="h-10 w-10 p-0"
                                                >
                                                    <ArrowDown className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="default"
                                                    onClick={() => removeLanguage(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    onClick={addLanguage}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Language
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Skills */}
            <Card>
                <Collapsible
                    open={openSections.skills}
                    onOpenChange={() => toggleSection('skills')}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="flex items-center justify-between">
                                Skills
                                {openSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="space-y-4">
                                {resume.skills?.map((skill, index) => {
                                    const canMoveUp = index > 0;
                                    const canMoveDown = index < resume.skills.length - 1;

                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <Input
                                                className="flex-1"
                                                placeholder="Skill"
                                                value={skill}
                                                onChange={(e) => updateSkill(index, e.target.value)}
                                            />
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveSkill(index, index - 1)}
                                                    disabled={!canMoveUp}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveSkill(index, index + 1)}
                                                    disabled={!canMoveDown}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSkill(index)}
                                                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    onClick={addSkill}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Skill
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    );
};

export default ResumeEditor;