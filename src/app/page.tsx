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
import { Resume, resumeSample } from "@/types/resume";
import { extractTextFromFile } from "@/lib/file-read";
import { generateResumePDF } from "@/lib/pdf-generation"; // Importing but not using in either version
import { ChevronDown, Download, Loader2, Upload } from "lucide-react";
import { readYaml } from "@/lib/file-read";
import { parseYamlTemplate } from "@/lib/latex-template-parse";
import { useTheme } from "next-themes";

import { ToastWithAction } from "./toast-with-action";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { TemplatePopup } from "@/components/template-popup";
import { Skeleton } from "@/components/ui/skeleton";
import Pricing from "@/components/pricing"; // Import the Pricing component
import { useUserContext } from "@/context/user-context";
import { findOrCreateUser, loadUser, saveUser } from "@/lib/firestore-db";
import { User } from "@/types/user";
import { createStripeCustomer } from "@/lib/stripe-payment";
import { useTemplateContext } from "@/context/template-context";
import { TemplateEntry } from "@/types/latex-template";

interface OpenAIResponse {
  role: string;
  content: string;
  refusal: null | string;
}

function ResumeGeneratorSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* TopBar Skeleton */}
      <div className="w-full p-4 border-b border-border">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="py-6 flex-1 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1440px] mx-auto">
        {/* Left Panel - Form Skeleton */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
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
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {/* PDF Viewer Area */}
            <div className="h-full flex flex-col gap-4">
              {/* PDF Header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>

              {/* PDF Content Area */}
              <div className="flex-1 border border-border rounded-lg p-4 space-y-4">
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
  );
}

interface CVEditorContentProps {
  showPricingDialog: boolean;
  openPricingDialog: () => void;
  closePricingDialog: () => void;
}

function CVEditorContent({
  showPricingDialog,
  openPricingDialog,
  closePricingDialog,
}: CVEditorContentProps) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { user, initializeUser, clearUserData, isLoading } = useUserContext();
  const { templates } = useTemplateContext();
  const router = useRouter();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("Service Designer");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [generatedPDF, setGeneratedPDF] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<TemplateEntry | null>(
    templates?.at(0) || null
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

  useEffect(() => {
        const handleUserAuth = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        // Clear user data and redirect to sign-in
        clearUserData();
        router.push("/sign-in");
        return;
      }

      if (clerkUser) {
        const emailAddress = clerkUser.emailAddresses[0]?.emailAddress || "";
        
        // Update form fields with Clerk user data
        setFirstName(clerkUser.firstName || "");
        setLastName(clerkUser.lastName || "");
        setEmail(emailAddress);
        setPhone(clerkUser.phoneNumbers[0]?.phoneNumber || "");

        // Initialize user data (will check localStorage first, then Firestore)
        try {
          await initializeUser(clerkUser.id, emailAddress);
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }
    };
    handleUserAuth();

    // Avoid hydration mismatch
    setMounted(true);
  }, [isLoaded, isSignedIn, clerkUser, initializeUser, clearUserData, router]);

  // Handle user logout
  useEffect(() => {
    if (isLoaded && !isSignedIn && mounted) {
      clearUserData();
    }
  }, [isLoaded, isSignedIn, clearUserData, mounted]);

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
        const errorText = await response.text();
        console.error("Failed to parse resume:", errorText);
        throw new Error(`Failed to parse resume: ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();

      if (data.content) {
        const parsedContent = JSON.parse(data.content) as Resume;
        setParsedData(parsedContent);

        // Generate tailored resume content using LLM
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
          const errorText = await responseLlm.text();
          console.error(
            "Failed to generate resume content from LLM:",
            errorText
          );
          throw new Error(
            `Failed to generate resume content from LLM: ${responseLlm.statusText}`
          );
        }

        const dataLlm: OpenAIResponse = await responseLlm.json();
        if (!dataLlm.content) {
          console.error("LLM response content is empty or missing.");
          throw new Error("Failed to get valid content from LLM.");
        }
        const resumeDataLlm = JSON.parse(dataLlm.content) as Resume;

        const pdfGenResponse = await fetch("/api/pdf-gen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeDataLlm,
            template: templateType?.data,
          }),
        });

        if (!pdfGenResponse.ok) {
          const errorText = await pdfGenResponse.text();
          console.error("Failed to generate PDF:", errorText);
          throw new Error(
            `Failed to generate PDF: ${pdfGenResponse.statusText}`
          );
        }

        const blob = await pdfGenResponse.blob();
        const pdfDataUrl = URL.createObjectURL(blob);
        setGeneratedPDF(pdfDataUrl);
      } else {
        // Handle case where data.content from parser API is empty
        console.error("Parsed resume content is empty.");
        throw new Error("Failed to parse resume content.");
      }
    } catch (error) {
      console.error("Error in handleGenerate:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);

      // Show toast with upgrade action if error indicates a usage limit
      if (
        errorMessage.toLowerCase().includes("limit") ||
        errorMessage.toLowerCase().includes("free generation") ||
        errorMessage.toLowerCase().includes("upgrade") ||
        errorMessage.toLowerCase().includes("premium")
      ) {
        toast({
          title: "Usage Limit Reached",
          description: "Please upgrade to continue using premium features.",
          variant: "destructive",
          duration: Infinity,
          action: (
            <ToastAction
              altText="Upgrade"
              onClick={openPricingDialog}
              className="py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade
            </ToastAction>
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <ResumeGeneratorSkeleton />;
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col overflow-hidden">


      <TemplatePopup
        isOpen={isTemplatePopupOpen}
        onClose={() => setIsTemplatePopupOpen(false)}
        onSelectTemplate={(template) => {
          setTemplateType(template);
          setTemplateName(template.name);
        }}
      />

      <div className="py-6 flex-1 px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1440px] mx-auto">
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm flex flex-col h-full overflow-hidden relative">
          <div className="space-y-6 p-6 flex-grow overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Template</h2>
                <Button
                  variant="outline"
                  className="w-[180px] bg-card border-border hover:bg-secondary hover:text-secondary-foreground flex justify-between items-center transition-colors"
                  onClick={() => setIsTemplatePopupOpen(true)}
                >
                  <span>{templateName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">Upload Resume</h2>
              <div className="flex items-center gap-2">
                <FileUpload onFileUpload={handleFileUpload} />
                <span className="text-sm text-muted-foreground">
                  {fileName}
                </span>
              </div>
              {error && (
                <div className="mt-2 text-destructive text-sm">Error: {error}</div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">Job Title</h2>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">Job Description</h2>
              <Textarea
                placeholder="Paste the job description here"
                className="min-h-[120px] w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={toggleAdditionalInfo}
                className="flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-accent/10 p-0 h-auto transition-colors"
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
                    <h2 className="text-lg font-semibold mb-2 text-foreground">First Name</h2>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Last Name</h2>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">
                      Email Address
                    </h2>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Phone</h2>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      type="tel"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Address</h2>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Website</h2>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Enter your website or portfolio"
                      type="url"
                      className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-border bg-card">
            <Button
              onClick={handleGenerate}
              disabled={!resumeFile || loading}
              className="w-full px-8 bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white font-bold transition-all duration-200 hover:shadow-lg"
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

        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
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
                className="flex items-center gap-2 bg-[hsl(var(--cv-button))] hover:bg-[hsl(var(--cv-button-hover))] text-white font-bold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Download CV
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Pricing Dialog */}
      {showPricingDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-6 rounded-lg shadow-xl max-w-3xl w-full mx-auto">
            <Pricing onClose={closePricingDialog} />
          </div>
        </div>
      )}
    </main>
  );
}

export default function CVEditor() {
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const openPricingDialog = () => setShowPricingDialog(true);
  const closePricingDialog = () => setShowPricingDialog(false);

  return (
    <Suspense fallback={<ResumeGeneratorSkeleton />}>
      <CVEditorContent
        showPricingDialog={showPricingDialog}
        openPricingDialog={openPricingDialog}
        closePricingDialog={closePricingDialog}
      />
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <ToastWithAction onOpenPricingDialog={openPricingDialog} />
      </div>
    </Suspense>
  );
}