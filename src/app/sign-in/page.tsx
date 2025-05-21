"use client"; // for App Router
import { SignIn, SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn routing="hash" />
    </div>
  );
}
