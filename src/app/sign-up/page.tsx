"use client"; // for App Router
import { SignIn, SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp routing="hash" 
        signInUrl="/sign-in"
        fallbackRedirectUrl={"/"}
      />
    </div>
  );
}
