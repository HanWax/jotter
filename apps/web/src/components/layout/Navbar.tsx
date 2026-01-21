import { Link, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { UserMenu } from "./UserMenu";
import { CreateDropdown } from "./CreateDropdown";
import { SearchBar } from "./SearchBar";

const navLinks = [
  { to: "/documents" as const, label: "Documents" },
  { to: "/folders" as const, label: "Folders" },
  { to: "/tags" as const, label: "Tags" },
  { to: "/assets" as const, label: "Assets" },
];

export function Navbar() {
  const navigate = useNavigate();

  const handleSearchSelect = (documentId: string) => {
    navigate({ to: "/documents/$id", params: { id: documentId } });
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
        Jotter
      </Link>

      <SignedIn>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 max-w-md hidden sm:block">
          <SearchBar onSelect={handleSearchSelect} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CreateDropdown />
          <UserMenu />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="ml-auto flex items-center gap-2">
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
      </SignedOut>
    </header>
  );
}
