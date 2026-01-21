interface ContentNode {
  type?: string;
  text?: string;
  content?: ContentNode[];
}

/**
 * Extract plain text from TipTap JSON content
 */
export function extractText(content: unknown): string {
  if (!content) return "";

  try {
    const json: ContentNode =
      typeof content === "string" ? JSON.parse(content) : content;
    const textParts: string[] = [];

    const processNode = (node: ContentNode): void => {
      if (node.text) {
        textParts.push(node.text);
      }

      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          processNode(child);
        }
        // Add newline after block-level elements
        if (
          node.type === "paragraph" ||
          node.type === "heading" ||
          node.type === "blockquote" ||
          node.type === "listItem"
        ) {
          textParts.push("\n");
        }
      }
    };

    processNode(json);
    return textParts.join("").trim();
  } catch {
    return "";
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export type DiffSegment = {
  type: "unchanged" | "added" | "removed";
  text: string;
};

/**
 * Simple word-level diff between two texts
 * Returns segments marked as unchanged, added, or removed
 */
export function diffTexts(oldText: string, newText: string): DiffSegment[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  // Simple LCS-based diff
  const segments: DiffSegment[] = [];

  // Build LCS table
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const oldWord = oldWords[i - 1];
      const newWord = newWords[j - 1];
      const prevDiag = dp[i - 1]?.[j - 1] ?? 0;
      const prevUp = dp[i - 1]?.[j] ?? 0;
      const prevLeft = dp[i]?.[j - 1] ?? 0;

      if (oldWord === newWord) {
        dp[i]![j] = prevDiag + 1;
      } else {
        dp[i]![j] = Math.max(prevUp, prevLeft);
      }
    }
  }

  // Backtrack to find diff
  let i = m;
  let j = n;
  const result: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    const oldWord = oldWords[i - 1];
    const newWord = newWords[j - 1];
    const dpCurrent = dp[i]?.[j - 1] ?? 0;
    const dpPrev = dp[i - 1]?.[j] ?? 0;

    if (i > 0 && j > 0 && oldWord === newWord) {
      result.unshift({ type: "unchanged", text: oldWord ?? "" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dpCurrent >= dpPrev)) {
      result.unshift({ type: "added", text: newWord ?? "" });
      j--;
    } else {
      result.unshift({ type: "removed", text: oldWord ?? "" });
      i--;
    }
  }

  // Merge consecutive segments of the same type
  for (const segment of result) {
    const last = segments[segments.length - 1];
    if (last && last.type === segment.type) {
      last.text += segment.text;
    } else {
      segments.push({ ...segment });
    }
  }

  return segments;
}
