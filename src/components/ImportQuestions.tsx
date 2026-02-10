import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { QuestionListSchema, type QuestionList } from "../types";

type ImportQuestionProps = {
  onImport: (questions: QuestionList) => void;
};

const DEFAULT_QUESTIONS_URL = "/default.json";

function getQuestionsParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("questions");
}

export function ImportQuestions({ onImport }: ImportQuestionProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions(url: string) {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Fetch failed (${res.status})`);
        }

        const raw = await res.json();
        const result = QuestionListSchema.safeParse(raw);

        if (!result.success) {
          throw new Error(result.error.message);
        }

        if (!cancelled) {
          setError(null);
          onImport(result.data);
        }
      } catch (err) {
        console.error(`Failed to load questions from ${url}`);
        console.debug(err);

        if (!cancelled) {
          setError(`Failed to load questions from ${url}`);
        }
      }
    }

    const paramUrl = getQuestionsParam();

    (async () => {
      // 1️⃣ Always load default first
      await loadQuestions(DEFAULT_QUESTIONS_URL);

      // 2️⃣ Override if URL param exists
      if (paramUrl) {
        await loadQuestions(paramUrl);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onImport]);

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}
    </>
  );
}
