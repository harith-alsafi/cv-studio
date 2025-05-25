"use client"; // for App Router
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={"/"}
        appearance={{
          elements: {
            dividerRow: "hidden", // hides the row with the divider
            dividerText: "hidden", // just in case there's text
            dividerLine: "hidden", // some themes use this
            
          },
        }}
      />
    </div>
  );
}
