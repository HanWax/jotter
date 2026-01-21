import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/layout/Navbar";

export function DashboardLayout() {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
