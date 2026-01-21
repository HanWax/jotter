import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Navbar } from "../components/layout/Navbar";
import { HomePage } from "../components/homepage/HomePage";

export function IndexRoute() {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <HomePage />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <main className="min-h-screen bg-gray-50">
          <header className="flex justify-end p-4">
            <div className="flex gap-2">
              <Link
                to="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </header>
          <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 72px)" }}>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">Jotter</h1>
              <p className="mt-2 text-gray-600">Your personal knowledge base</p>
            </div>
          </div>
        </main>
      </SignedOut>
    </>
  );
}
