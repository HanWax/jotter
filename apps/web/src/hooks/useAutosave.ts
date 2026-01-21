import { useCallback, useRef, useState } from "react";
import { useUpdateDocument } from "./useDocuments";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(documentId: string) {
  const updateDocument = useUpdateDocument();
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback(
    (data: { title?: string; content?: unknown }) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setStatus("saving");

      updateDocument.mutate(
        { id: documentId, data },
        {
          onSuccess: () => {
            setStatus("saved");
            // Reset to idle after 2 seconds
            timeoutRef.current = setTimeout(() => {
              setStatus("idle");
            }, 2000);
          },
          onError: () => {
            setStatus("error");
          },
        }
      );
    },
    [documentId, updateDocument]
  );

  return { save, status, isSaving: status === "saving" };
}
