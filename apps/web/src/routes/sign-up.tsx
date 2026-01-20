import { SignUp } from "@clerk/clerk-react";

export function SignUpRoute() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
