"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/file-upload";
import PDFViewer from "@/components/pdf-viewer";
import { TemplateType } from "@/types/templates";
import { Resume, resumeSample } from "@/types/resume";
import { extractTextFromFile } from "@/lib/file-read-new";
import { generateResumePDF } from "@/lib/pdf-gen-basic"; // Importing but not using in either version
import { ChevronDown, Download, Loader2, Upload } from "lucide-react";
import { readYaml } from "@/lib/file-read";
import { parseYamlTemplate } from "@/lib/latex-template";
import { useTheme } from "next-themes";
import { TopBar } from "@/components/ui/top-bar";
import { TemplatePopup } from "@/components/template-popup";
import { Skeleton } from "@/components/ui/skeleton";

interface OpenAIResponse {
  role: string;
  content: string;
  refusal: null | string;
}

function ResumeGeneratorSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background dark:bg-[#111827] flex flex-col overflow-hidden">
      {/* TopBar Skeleton */}
      <div className="w-full p-4 border-b">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="py-6 flex-1 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1440px] mx-auto">
        {/* Left Panel - Form Skeleton */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="space-y-6">
            {/* Template Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
            </div>

            {/* Upload Resume Section */}
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Job Title Section */}
            <div>
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Job Description Section */}
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-[120px] w-full" />
            </div>

            {/* Additional Info Toggle */}
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Additional Info Fields (showing as if expanded) */}
              <div className="mt-4 space-y-4">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-6 w-28 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="sticky bottom-6 flex justify-center mt-6">
            <Skeleton className="h-12 w-40" />
          </div>
        </div>

        {/* Right Panel - PDF Viewer Skeleton */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm flex flex-col dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="flex-1 overflow-hidden relative">
            {/* PDF Viewer Area */}
            <div className="h-full flex flex-col gap-4">
              {/* PDF Header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
              
              {/* PDF Content Area */}
              <div className="flex-1 border rounded-lg p-4 space-y-4">
                {/* Header section */}
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                  <Skeleton className="h-4 w-56 mx-auto" />
                </div>
                
                {/* Sections */}
                <div className="space-y-6 mt-8">
                  {[1, 2, 3, 4].map((section) => (
                    <div key={section} className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Download Button */}
          <div className="mt-4 flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CVEditorContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("Service Designer");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [generatedPDF, setGeneratedPDF] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<TemplateType | null>(
    TemplateType.CLASSIC
  );
  const [templateName, setTemplateName] = useState("Classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Resume | null>(null);
  const [language, setLanguage] = useState("English"); // Keep language state for API calls
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTemplatePopupOpen, setIsTemplatePopupOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // Form state for additional info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [fileName, setFileName] = useState("No file chosen");

  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");    
    }
    const template = searchParams.get("template") as TemplateType;
    if (template) {
      setTemplateType(template);
      // Set template name based on type
      if (template === TemplateType.MODERN) {
        setTemplateName("Modern");
      } else if (template === TemplateType.CLASSIC) {
        setTemplateName("Classic");
      }
    }

    // Avoid hydration mismatch
    setMounted(true);
  }, [searchParams, isLoaded, isSignedIn, router, user]);

  const handleFileUpload = (file: File) => {
    setResumeFile(file);
    setFileName(file.name);
    setError(null);
    setGeneratedPDF(null);
  };

  const handleDownload = () => {
    if (!generatedPDF) return;

    try {
      // Convert the data URL to a Blob
      const byteString = atob(generatedPDF.split(",")[1]);
      const mimeString = generatedPDF.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generated-resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Failed to download PDF");
    }
  };

  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };

  const handleGenerate = async () => {
    if (!resumeFile) {
      setError("Please upload a resume file first");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedPDF(null);

    try {
      // Extract text from the uploaded file
      const text = await extractTextFromFile(resumeFile);

      // Send to parser API
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          jobDescription: jobDescription.trim(),
          jobTitle,
          additionalInfo: showAdditionalInfo
            ? {
                firstName,
                lastName,
                email,
                phone,
                address,
                website,
              }
            : null,
        }),
      });

      if (!response.ok) {
        console.error("Failed to parse resume:", response);
        throw new Error("Failed to parse resume");
      }

      const data: OpenAIResponse = await response.json();

      if (data.content) {
        const parsedContent = JSON.parse(data.content) as Resume;
        setParsedData(parsedContent);

        const responseLlm = await fetch("/api/resume-gen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: parsedContent,
            jobDescription,
            jobTitle,
            language,
          }),
        });

        if (!responseLlm.ok) {
          console.error("Failed to generate resume:", responseLlm);
          throw new Error("Failed to generate resume");
        }

        const dataLlm: OpenAIResponse = await responseLlm.json();
        const resumeDataLlm = JSON.parse(dataLlm.content) as Resume;

        const template = await readYaml("template-1/template1.yaml");
        const selectedTemplate = parseYamlTemplate(template);

        // Send data to the API for PDF generation
        const response = await fetch("/api/pdf-gen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeDataLlm,
            template: selectedTemplate,
          }),
        });

        console.log(response);

        if (response.ok) {
          const blob = await response.blob();
          const pdfDataUrl = URL.createObjectURL(blob);
          setGeneratedPDF(pdfDataUrl);
        } else {
          console.error("Failed to generate PDF:", await response.text());
          throw new Error("Failed to generate PDF");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <ResumeGeneratorSkeleton />;
  }

  return (
    <main className="min-h-screen w-full bg-background dark:bg-[#111827] flex flex-col overflow-hidden">
      <TopBar />

      <TemplatePopup
        isOpen={isTemplatePopupOpen}
        onClose={() => setIsTemplatePopupOpen(false)}
        onSelectTemplate={(template) => {
          setTemplateType(template.type as TemplateType);
          setTemplateName(template.name);
        }}
      />

      <div className="py-6 flex-1 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1440px] mx-auto">
        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Template</h2>
                <Button
                  variant="outline"
                  className="w-[180px] dark:bg-[#2a3042] dark:border-[#3a4055] flex justify-between items-center"
                  onClick={() => setIsTemplatePopupOpen(true)}
                >
                  <span>{templateName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Upload Resume</h2>
              <div className="flex items-center gap-2">
                <FileUpload onFileUpload={handleFileUpload} />
                <span className="text-sm text-muted-foreground">
                  {fileName}
                </span>
              </div>
              {error && (
                <div className="mt-2 text-red-600 text-sm">Error: {error}</div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Job Title</h2>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Job Description</h2>
              <Textarea
                placeholder="Paste the job description here"
                className="min-h-[120px] w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={toggleAdditionalInfo}
                className="flex items-center gap-2 text-[hsl(var(--cv-accent))] p-0 h-auto"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showAdditionalInfo ? "rotate-180" : ""
                  }`}
                />
                Edit additional info
              </Button>

              {showAdditionalInfo && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-5 duration-300">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">First Name</h2>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Last Name</h2>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Email Address
                    </h2>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Phone</h2>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      type="tel"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Address</h2>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Website</h2>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Enter your website or portfolio"
                      type="url"
                      className="w-full dark:bg-[#2a3042] dark:border-[#3a4055]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="sticky bottom-6 flex justify-center mt-6">
            <Button
              onClick={handleGenerate}
              disabled={!resumeFile || loading}
              className="w-auto px-8 bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white font-bold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Resume"
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm flex flex-col dark:bg-[#1a1f2e] dark:border-[#2a3042]">
          <div className="flex-1 overflow-hidden relative">
            {" "}
            {/* Added 'relative' for proper loading overlay */}
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Generating your resume...
                  </p>
                </div>
              </div>
            ) : generatedPDF ? (
              <PDFViewer pdfUrl={generatedPDF} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No PDF generated yet
              </div>
            )}
          </div>
          {generatedPDF && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white font-bold"
              >
                <Download className="h-4 w-4" />
                Download CV
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CVEditor() {
  return (
    <Suspense fallback={<ResumeGeneratorSkeleton />}>
      <CVEditorContent />
    </Suspense>
  );
}
