import { useEffect, useState } from "react";
import { DynamicForm } from "./DynamicForm";
import type { Question } from "../types";

const DRAFT_KEY = "formDraft";

export function FormWithDraft({
  questions,
  onSubmit,
}: {
  questions: Question[];
  onSubmit: (answers: any) => void;
}) {
  const [initialValues, setInitialValues] = useState<Record<number, any>>();
  const [initialImageMap, setInitialImageMap] =
    useState<Record<number, string>>();

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const { values, imageMap } = JSON.parse(saved);
        setInitialValues(values);
        setInitialImageMap(imageMap);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const handleFormChange = (
    values: Record<number, any>,
    imageMap: Record<number, string>,
  ) => {
    if (Object.keys(values).length > 0 || Object.keys(imageMap).length > 0) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, imageMap }));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const handleSubmit = (answers: Record<number, any>) => {
    localStorage.removeItem(DRAFT_KEY); // clear draft after successful submit
    onSubmit(answers);
  };

  return (
    <DynamicForm
      questions={questions}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      initialImageMap={initialImageMap}
      onFormChange={handleFormChange}
    />
  );
}
