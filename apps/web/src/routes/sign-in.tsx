import { SignIn } from "@clerk/clerk-react";

export function SignInRoute() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}
