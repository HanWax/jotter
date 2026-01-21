import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../lib/api";

export function AuthTokenSetter({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };

    updateToken();
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}
